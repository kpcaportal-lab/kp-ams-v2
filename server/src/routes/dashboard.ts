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
        const totalBilledParams: any[] = [fiscal_year];

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
             WHERE a.fiscal_year=$1 AND a.${(role === 'manager' || role === 'staff') ? 'manager_id' : 'partner_id'}=$2`,
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
        const overdueParams: any[] = [fiscal_year, currentFiscalMonth];

        if (visibleIds !== null) {
            overdueParams.push(visibleIds);
            overdueQuery += ` AND (a.manager_id = ANY($${overdueParams.length}) OR a.partner_id = ANY($${overdueParams.length}))`;
        }

        const overdueResult = await pool.query(overdueQuery, overdueParams);

        // ── Per-partner breakdown (admin, partner, director) ──
        let partnerBreakdown: any[] = [];
        if (role !== 'manager' && role !== 'staff') {
            let pQuery = `
                SELECT pp.id, pp.full_name, pp.display_name,
                  COALESCE(SUM(i.professional_fees),0) as billed
                FROM profiles pp
                LEFT JOIN assignments a ON a.partner_id=pp.id AND a.status='active' AND a.fiscal_year=$1
                LEFT JOIN invoices i ON i.assignment_id=a.id
                WHERE pp.role='partner' AND pp.is_active=true`;
            const pParams: any[] = [fiscal_year];

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
            WHERE pm.role='manager' AND pm.is_active=true`;
        const mParams: any[] = [fiscal_year];

        if (visibleIds !== null) {
            mParams.push(visibleIds);
            mQuery += ` AND pm.id = ANY($${mParams.length})`;
        }

        mQuery += ` GROUP BY pm.id, pm.full_name, pm.display_name ORDER BY billed_amount DESC`;
        const managerBreakdown = await pool.query(mQuery, mParams);

        // ── Category breakdown (for focused views) ──
        let categoryBreakdown: any[] = [];
        if (role === 'manager' || role === 'staff' || role === 'director') {
            let catQuery = `
                SELECT a.category,
                  COALESCE(SUM(i.professional_fees),0) as billed,
                  CASE WHEN SUM(a.total_fees)>0 THEN ROUND(SUM(i.professional_fees)*100/SUM(a.total_fees),1) ELSE 0 END as billing_pct
                FROM assignments a
                LEFT JOIN invoices i ON i.assignment_id=a.id
                WHERE a.status='active' AND a.fiscal_year=$1`;
            const catParams: any[] = [fiscal_year];

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
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
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
        const workParams: any[] = [fiscal_year];

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
            const allProgress = workProgressResult.rows.map(wp => ({
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
    } catch (err) {
        console.error('Work progress error:', err);
        res.status(500).json({ error: 'Failed to fetch work progress data' });
    }
});

export default router;
