import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate, getVisibleUserIds } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/dashboard/summary — role-aware aggregate dashboard data
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26' } = req.query;
        const role = req.user!.role;
        const userId = req.user!.id;

        // Get visible user IDs for RBAC filtering
        const visibleIds = await getVisibleUserIds(req.user!);

        // ── Total billed (scoped by role) ──
        let totalBilledQuery = `
            SELECT COALESCE(SUM(i.professional_fees),0) as total
            FROM invoices i
            JOIN assignments a ON a.id = i.assignment_id
            WHERE a.fiscal_year=$1`;
        const totalBilledParams: unknown[] = [fiscal_year];

        if (visibleIds !== null) {
            totalBilledParams.push(visibleIds);
            totalBilledQuery += ` AND (a.manager_id = ANY($${totalBilledParams.length}) OR a.partner_id = ANY($${totalBilledParams.length}))`;
        }

        const totalBilled = await pool.query(totalBilledQuery, totalBilledParams);

        // ── Self billed ──
        const selfBilled = await pool.query(
            `SELECT COALESCE(SUM(i.professional_fees),0) as total
             FROM invoices i
             JOIN assignments a ON a.id = i.assignment_id
             WHERE a.fiscal_year=$1 AND (a.manager_id=$2 OR a.partner_id=$2)`,
            [fiscal_year, userId]
        );

        // ── Overdue ──
        const currentDate = new Date();
        const calMonth = currentDate.getMonth() + 1;
        const currentFiscalMonth = calMonth >= 4 ? calMonth - 3 : calMonth + 9;

        let overdueQuery = `
            SELECT COALESCE(SUM(fa.amount - fa.billed_amount),0) as total
            FROM fee_allocations fa
            JOIN assignments a ON a.id = fa.assignment_id
            WHERE a.status='active' AND fa.fiscal_year=$1
            AND fa.month < $2 AND fa.amount > fa.billed_amount`;
        const overdueParams: unknown[] = [fiscal_year, currentFiscalMonth];

        if (visibleIds !== null) {
            overdueParams.push(visibleIds);
            overdueQuery += ` AND (a.manager_id = ANY($${overdueParams.length}) OR a.partner_id = ANY($${overdueParams.length}))`;
        }

        const overdueResult = await pool.query(overdueQuery, overdueParams);

        // ── Per-partner breakdown (admin, partner, director) ──
        let partnerBreakdown: unknown[] = [];
        if (role !== 'manager' && role !== 'staff') {
            let pQuery = `
                SELECT pp.id, pp.full_name, pp.display_name,
                  COALESCE(SUM(i.professional_fees),0) as billed
                FROM profiles pp
                LEFT JOIN assignments a ON a.partner_id=pp.id AND a.status='active' AND a.fiscal_year=$1
                LEFT JOIN invoices i ON i.assignment_id=a.id
                WHERE pp.role='partner' AND pp.is_active=true`;
            const pParams: unknown[] = [fiscal_year];

            // Directors only see their own partner data (themselves if they're also a partner,
            // or partners linked to their subordinates)
            if (role === 'director' && visibleIds !== null) {
                pParams.push(visibleIds);
                // Show only partners whose assignments involve visible managers
                pQuery = `
                    SELECT pp.id, pp.full_name, pp.display_name,
                      COALESCE(SUM(i.professional_fees),0) as billed
                    FROM profiles pp
                    LEFT JOIN assignments a ON a.partner_id=pp.id AND a.status='active' AND a.fiscal_year=$1
                      AND a.manager_id = ANY($2)
                    LEFT JOIN invoices i ON i.assignment_id=a.id
                    WHERE pp.role='partner' AND pp.is_active=true`;
            }

            pQuery += ` GROUP BY pp.id, pp.full_name, pp.display_name ORDER BY pp.full_name`;
            const pResult = await pool.query(pQuery, pParams);
            partnerBreakdown = pResult.rows;
        }

        // ── Manager breakdown ──
        let mQuery = `
            SELECT pm.id, pm.full_name, pm.display_name,
              COALESCE(SUM(i.professional_fees),0) as billed_amount,
              CASE WHEN SUM(a.total_fees) > 0 THEN ROUND(SUM(i.professional_fees)*100/SUM(a.total_fees),1) ELSE 0 END as billing_pct
            FROM profiles pm
            LEFT JOIN assignments a ON a.manager_id=pm.id AND a.status='active' AND a.fiscal_year=$1
            LEFT JOIN invoices i ON i.assignment_id=a.id
            WHERE pm.role IN ('manager', 'assistant_manager') AND pm.is_active=true`;
        const mParams: unknown[] = [fiscal_year];

        if (visibleIds !== null) {
            mParams.push(visibleIds);
            mQuery += ` AND pm.id = ANY($${mParams.length})`;
        }

        mQuery += ` GROUP BY pm.id, pm.full_name, pm.display_name ORDER BY billed_amount DESC`;
        const managerBreakdown = await pool.query(mQuery, mParams);

        // ── Category breakdown (for focused views) ──
        let categoryBreakdown: unknown[] = [];
        if (role === 'manager' || role === 'staff' || role === 'director') {
            let catQuery = `
                SELECT a.category,
                  COALESCE(SUM(i.professional_fees),0) as billed,
                  CASE WHEN SUM(a.total_fees)>0 THEN ROUND(SUM(i.professional_fees)*100/SUM(a.total_fees),1) ELSE 0 END as billing_pct
                FROM assignments a
                LEFT JOIN invoices i ON i.assignment_id=a.id
                WHERE a.status='active' AND a.fiscal_year=$1`;
            const catParams: unknown[] = [fiscal_year];

            if (visibleIds !== null) {
                catParams.push(visibleIds);
                catQuery += ` AND (a.manager_id = ANY($${catParams.length}) OR a.partner_id = ANY($${catParams.length}))`;
            }

            catQuery += ` GROUP BY a.category ORDER BY a.category`;
            const catResult = await pool.query(catQuery, catParams);
            categoryBreakdown = catResult.rows;
        }

        res.json({
            totalBilled: Number(totalBilled.rows[0].total),
            selfBilled: Number(selfBilled.rows[0].total),
            overdue: Number(overdueResult.rows[0].total),
            billingPct: 0,
            selfBillingPct: 0,
            partnerBreakdown,
            managerBreakdown: managerBreakdown.rows,
            categoryBreakdown,
        });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('Summary dashboard error:', error);
        res.status(500).json({ error: 'Server error', detail: error.message });
    }
});

// GET /api/dashboard/work-progress — role-aware work progress
router.get('/work-progress', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26' } = req.query;
        const role = req.user!.role;
        const userId = req.user!.id;

        const visibleIds = await getVisibleUserIds(req.user!);

        // If admin/partner, get all users' work progress
        // If director, get self + subordinates
        // If manager, get only self
        let workQuery = `
            SELECT
                wp.*,
                p.full_name as user_name,
                p.display_name,
                p.role as user_role
            FROM work_progress wp
            JOIN profiles p ON p.id = wp.user_id
            WHERE wp.fiscal_year = $1`;
        const workParams: unknown[] = [fiscal_year];

        if (visibleIds !== null) {
            workParams.push(visibleIds);
            workQuery += ` AND wp.user_id = ANY($${workParams.length})`;
        }

        workQuery += ` ORDER BY p.role, p.full_name`;

        const workProgressResult = await pool.query(workQuery, workParams);

        if (workProgressResult.rows.length === 0) {
            // Return empty result for single user
            return res.json((role === 'manager' || role === 'staff') ? {
                user_id: userId,
                user_name: req.user!.full_name,
                total_proposals: 0,
                completed_proposals: 0,
                pending_proposals: 0,
                completed_percentage: 0,
                pending_percentage: 0,
                total_amount: 0,
                completed_amount: 0,
                pending_amount: 0,
                completed_items: [],
                pending_items: []
            } : []);
        }

        // For admin/partner/director — return array of all visible users' progress
        if (role !== 'manager' && role !== 'staff') {
            const allProgress = workProgressResult.rows.map((wp: any) => ({
                user_id: wp.user_id,
                user_name: wp.user_name,
                display_name: wp.display_name,
                user_role: wp.user_role,
                total_proposals: Number(wp.total_proposals),
                completed_proposals: Number(wp.completed_proposals),
                pending_proposals: Number(wp.pending_proposals),
                completed_percentage: Number(wp.percentage_completed),
                pending_percentage: 100 - Number(wp.percentage_completed),
                total_amount: Number(wp.completed_amount) + Number(wp.pending_amount),
                completed_amount: Number(wp.completed_amount),
                pending_amount: Number(wp.pending_amount),
                completed_items: [],
                pending_items: []
            }));
            return res.json(allProgress);
        }

        // For manager — return single object
        const wp = workProgressResult.rows[0];
        const totalAmount = Number(wp.completed_amount) + Number(wp.pending_amount);

        res.json({
            user_id: wp.user_id,
            user_name: wp.user_name,
            display_name: wp.display_name,
            total_proposals: Number(wp.total_proposals),
            completed_proposals: Number(wp.completed_proposals),
            pending_proposals: Number(wp.pending_proposals),
            completed_percentage: Number(wp.percentage_completed),
            pending_percentage: 100 - Number(wp.percentage_completed),
            total_amount: totalAmount,
            completed_amount: Number(wp.completed_amount),
            pending_amount: Number(wp.pending_amount),
            completed_items: [],
            pending_items: []
        });
    } catch (err: unknown) {
        console.error('Work progress error:', err);
        res.status(500).json({ error: 'Failed to fetch work progress data' });
    }
});

// GET /api/dashboard/insights — advanced financial analytics
router.get('/insights', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26' } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);

        // 1. Monthly Revenue Trend (Billed vs Planned)
        let monthlyQuery = `
            SELECT 
                month,
                SUM(amount) as planned,
                SUM(billed_amount) as billed
            FROM fee_allocations fa
            JOIN assignments a ON a.id = fa.assignment_id
            WHERE fa.fiscal_year = $1`;
        const monthlyParams: unknown[] = [fiscal_year];
        if (visibleIds !== null) {
            monthlyParams.push(visibleIds);
            monthlyQuery += ` AND (a.manager_id = ANY($2) OR a.partner_id = ANY($2))`;
        }
        monthlyQuery += ` GROUP BY month ORDER BY month`;
        const monthlyResult = await pool.query(monthlyQuery, monthlyParams);

        // 2. Partner Performance (Billed vs Received)
        let partnerQuery = `
            SELECT 
                p.full_name as name,
                SUM(a.billed_amount) as billed,
                SUM(a.amount_receipt) as collected
            FROM profiles p
            JOIN assignments a ON a.partner_id = p.id
            WHERE a.fiscal_year = $1 AND p.role = 'partner'`;
        const partnerParams: unknown[] = [fiscal_year];
        if (visibleIds !== null) {
            partnerParams.push(visibleIds);
            partnerQuery += ` AND a.partner_id = ANY($2)`;
        }
        partnerQuery += ` GROUP BY p.id, p.full_name ORDER BY billed DESC`;
        const partnerResult = await pool.query(partnerQuery, partnerParams);

        // 3. Client Outstanding Dues (Top 10)
        let clientQuery = `
            SELECT 
                c.name,
                SUM(a.total_fees) as total,
                SUM(a.billed_amount) as billed,
                SUM(a.amount_receipt) as collected,
                SUM(a.billed_amount - a.amount_receipt) as outstanding
            FROM clients c
            JOIN assignments a ON a.client_id = c.id
            WHERE a.fiscal_year = $1 AND a.status != 'postponed'`;
        const clientParams: unknown[] = [fiscal_year];
        if (visibleIds !== null) {
            clientParams.push(visibleIds);
            clientQuery += ` AND (a.manager_id = ANY($2) OR a.partner_id = ANY($2))`;
        }
        clientQuery += ` GROUP BY c.id, c.name HAVING SUM(a.billed_amount - a.amount_receipt) > 0 ORDER BY outstanding DESC LIMIT 10`;
        const clientResult = await pool.query(clientQuery, clientParams);

        // 4. Category Revenue
        let categoryQuery = `
            SELECT 
                category,
                SUM(billed_amount) as value
            FROM assignments a
            WHERE fiscal_year = $1 AND status != 'postponed'`;
        const categoryParams: unknown[] = [fiscal_year];
        if (visibleIds !== null) {
            categoryParams.push(visibleIds);
            categoryQuery += ` AND (a.manager_id = ANY($2) OR a.partner_id = ANY($2))`;
        }
        categoryQuery += ` GROUP BY category ORDER BY value DESC`;
        const categoryResult = await pool.query(categoryQuery, categoryParams);

        // 5. Manager Workload (Active Assignments Count)
        let managerWorkloadQuery = `
            SELECT 
                p.full_name as name,
                COUNT(a.id) as active_assignments,
                SUM(a.total_fees) as total_load
            FROM profiles p
            JOIN assignments a ON a.manager_id = p.id
            WHERE a.fiscal_year = $1 AND a.status = 'active'
            AND p.role IN ('manager', 'assistant_manager')`;
        const managerWorkloadParams: unknown[] = [fiscal_year];
        if (visibleIds !== null) {
            managerWorkloadParams.push(visibleIds);
            managerWorkloadQuery += ` AND a.manager_id = ANY($2)`;
        }
        managerWorkloadQuery += ` GROUP BY p.id, p.full_name ORDER BY active_assignments DESC`;
        const managerWorkloadResult = await pool.query(managerWorkloadQuery, managerWorkloadParams);

        res.json({
            monthlyRevenue: monthlyResult.rows,
            partnerPerformance: partnerResult.rows,
            clientDues: clientResult.rows,
            categoryRevenue: categoryResult.rows,
            managerWorkload: managerWorkloadResult.rows
        });
    } catch (err: unknown) {
        console.error('Insights error:', err);
        res.status(500).json({ error: 'Failed to fetch insights data' });
    }
});

// GET /api/calendar/events — key dates for the audit calendar
router.get('/calendar/events', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26' } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);

        // 1. Assignment Deadlines
        let assignQuery = `
            SELECT 
                id,
                client_name || ' - ' || COALESCE(scope_item, 'Audit') as title,
                end_date as date,
                'assignment' as type,
                status
            FROM assignments
            WHERE fiscal_year = $1 AND end_date IS NOT NULL`;
        const assignParams: unknown[] = [fiscal_year];
        if (visibleIds !== null) {
            assignParams.push(visibleIds);
            assignQuery += ` AND (manager_id = ANY($2) OR partner_id = ANY($2))`;
        }
        const assignResults = await pool.query(assignQuery, assignParams);

        // 2. Proposal Dates
        let propQuery = `
            SELECT 
                id,
                client_name || ' - Proposal' as title,
                proposal_date as date,
                'proposal' as type,
                status
            FROM proposals
            WHERE proposal_date IS NOT NULL`; // Proposals might span years
        const propParams: unknown[] = [];
        if (visibleIds !== null) {
            propParams.push(visibleIds);
            propQuery += ` AND partner_id = ANY($1)`;
        }
        const propResults = await pool.query(propQuery, propParams);

        // 3. Billing Milestones (from fee_allocations)
        // We'll map month numbers to approximate dates in the fiscal year
        let feeQuery = `
            SELECT 
                a.id,
                a.client_name || ' - Billing' as title,
                fa.month,
                'billing' as type
            FROM fee_allocations fa
            JOIN assignments a ON a.id = fa.assignment_id
            WHERE fa.fiscal_year = $1 AND fa.amount > 0`;
        const feeParams: unknown[] = [fiscal_year];
        if (visibleIds !== null) {
            feeParams.push(visibleIds);
            feeQuery += ` AND (a.manager_id = ANY($2) OR a.partner_id = ANY($2))`;
        }
        const feeResults = await pool.query(feeQuery, feeParams);

        // Map fee months to actual dates (assuming 25th of the month)
        const mappedFees = feeResults.rows.map(f => {
            const year = f.month >= 4 ? 2025 : 2026; // Rough mapping for 2025-26 FY
            const date = new Date(year, f.month - 1, 25);
            return { ...f, date: date.toISOString() };
        });

        res.json({
            events: [
                ...assignResults.rows,
                ...propResults.rows,
                ...mappedFees
            ]
        });
    } catch (err: unknown) {
        console.error('Calendar events error:', err);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
});

// GET /api/documents — browse assignment documents grouped by client
router.get('/documents', async (req: Request, res: Response) => {
    try {
        const { fiscal_year } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);

        let query = `
            SELECT 
                a.id,
                a.client_name,
                a.scope_item || ' (' || a.fiscal_year || ')' as title,
                a.file_url,
                a.fiscal_year,
                a.category
            FROM assignments a
            WHERE a.file_url IS NOT NULL AND a.file_url != ''`;
        
        const params: unknown[] = [];
        if (fiscal_year) {
            params.push(fiscal_year);
            query += ` AND a.fiscal_year = $${params.length}`;
        }

        if (visibleIds !== null) {
            params.push(visibleIds);
            query += ` AND (a.manager_id = ANY($${params.length}) OR a.partner_id = ANY($${params.length}))`;
        }

        query += ` ORDER BY a.client_name, a.fiscal_year DESC`;
        
        const result = await pool.query(query, params);

        // Group by client
        const grouped = result.rows.reduce((acc: any, curr: any) => {
            if (!acc[curr.client_name]) {
                acc[curr.client_name] = [];
            }
            acc[curr.client_name].push(curr);
            return acc;
        }, {});

        res.json(grouped);
    } catch (err: unknown) {
        console.error('Documents fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

export default router;
