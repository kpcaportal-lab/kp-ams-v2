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
        let totalBilledVal = 0;
        try {
            let totalBilledQuery = `
                SELECT COALESCE(SUM(i.professional_fees), SUM(i.net_amount), 0) as total
                FROM invoices i
                JOIN assignments a ON a.id = i.assignment_id
                WHERE a.fiscal_year=$1`;
            const totalBilledParams: unknown[] = [fiscal_year];

            if (visibleIds !== null) {
                totalBilledParams.push(visibleIds);
                totalBilledQuery += ` AND (a.manager_id = ANY($${totalBilledParams.length}) OR a.partner_id = ANY($${totalBilledParams.length}))`;
            }
            const resBilled = await pool.query(totalBilledQuery, totalBilledParams);
            totalBilledVal = Number(resBilled.rows[0]?.total || 0);
        } catch (e) {
            console.warn('⚠️ Total billed query failed, fallback to 0');
        }

        // ── Self billed ──
        let selfBilledVal = 0;
        try {
            const resSelf = await pool.query(
                `SELECT COALESCE(SUM(i.professional_fees), SUM(i.net_amount), 0) as total
                 FROM invoices i
                 JOIN assignments a ON a.id = i.assignment_id
                 WHERE a.fiscal_year=$1 AND (a.manager_id=$2 OR a.partner_id=$2)`,
                [fiscal_year, userId]
            );
            selfBilledVal = Number(resSelf.rows[0]?.total || 0);
        } catch (e) {}

        // ── Overdue ──
        let overdueVal = 0;
        try {
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
            overdueVal = Number(overdueResult.rows[0]?.total || 0);
        } catch (e) {}

        // ── Per-partner breakdown ──
        let partnerBreakdown: unknown[] = [];
        try {
            if (role !== 'manager' && role !== 'staff') {
                let pQuery = `
                    SELECT pp.id, pp.full_name, pp.display_name,
                      COALESCE(SUM(i.professional_fees), SUM(i.net_amount), 0) as billed
                    FROM profiles pp
                    LEFT JOIN assignments a ON a.partner_id=pp.id AND a.status='active' AND a.fiscal_year=$1
                    LEFT JOIN invoices i ON i.assignment_id=a.id
                    WHERE pp.role='partner' AND pp.is_active=true`;
                const pParams: unknown[] = [fiscal_year];

                if (role === 'director' && visibleIds !== null) {
                    pParams.push(visibleIds);
                    pQuery = `
                        SELECT pp.id, pp.full_name, pp.display_name,
                          COALESCE(SUM(i.professional_fees), SUM(i.net_amount), 0) as billed
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
        } catch (e) {}

        // ── Manager breakdown ──
        let managerBreakdown: any[] = [];
        try {
            let mQuery = `
                SELECT pm.id, pm.full_name, pm.display_name,
                  COALESCE(SUM(i.professional_fees), SUM(i.net_amount), 0) as billed_amount,
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
            const mResult = await pool.query(mQuery, mParams);
            managerBreakdown = mResult.rows;
        } catch (e) {}

        // ── Category breakdown ──
        let categoryBreakdown: any[] = [];
        try {
            if (role === 'manager' || role === 'staff' || role === 'director') {
                let catQuery = `
                    SELECT a.category,
                      COALESCE(SUM(i.professional_fees), SUM(i.net_amount), 0) as billed,
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
        } catch (e) {}

        // ── Total Received ──
        let totalReceivedVal = 0;
        try {
            let totalReceivedQuery = `
                SELECT COALESCE(SUM(amount_receipt), 0) as total
                FROM assignments
                WHERE fiscal_year=$1`;
            const totalReceivedParams: unknown[] = [fiscal_year];

            if (visibleIds !== null) {
                totalReceivedParams.push(visibleIds);
                totalReceivedQuery += ` AND (manager_id = ANY($${totalReceivedParams.length}) OR partner_id = ANY($${totalReceivedParams.length}))`;
            }
            const resReceived = await pool.query(totalReceivedQuery, totalReceivedParams);
            totalReceivedVal = Number(resReceived.rows[0]?.total || 0);
        } catch (e) {
            console.warn('⚠️ Total received query failed');
        }

        // ── Self Received ──
        let selfReceivedVal = 0;
        try {
            const resSelfRec = await pool.query(
                `SELECT COALESCE(SUM(amount_receipt), 0) as total
                 FROM assignments
                 WHERE fiscal_year=$1 AND (manager_id=$2 OR partner_id=$2)`,
                [fiscal_year, userId]
            );
            selfReceivedVal = Number(resSelfRec.rows[0]?.total || 0);
        } catch (e) {}

        const billingPct = totalBilledVal > 0 ? Math.round((totalReceivedVal / totalBilledVal) * 100) : 0;
        const selfBillingPct = selfBilledVal > 0 ? Math.round((selfReceivedVal / selfBilledVal) * 100) : 0;

        res.json({
            totalBilled: Number(totalBilledVal),
            totalReceived: Number(totalReceivedVal),
            selfBilled: Number(selfBilledVal),
            selfReceived: Number(selfReceivedVal),
            overdue: Number(overdueVal),
            billingPct,
            selfBillingPct,
            partnerBreakdown,
            managerBreakdown,
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

        let workProgressResult;
        try {
            workProgressResult = await pool.query(workQuery, workParams);
        } catch (dbErr: any) {
            console.warn('⚠️ work_progress table missing, using dynamic fallback');
            // Fallback: Generate basic work progress from assignments/proposals
            const fallbackQuery = `
                SELECT 
                    p.id as user_id, p.full_name as user_name, p.display_name, p.role as user_role,
                    (SELECT COUNT(*) FROM assignments a WHERE a.manager_id = p.id AND a.fiscal_year = $1) as total_proposals,
                    (SELECT COUNT(*) FROM assignments a WHERE a.manager_id = p.id AND a.fiscal_year = $1 AND a.status = 'active') as completed_proposals,
                    (SELECT COALESCE(SUM(total_fees), 0) FROM assignments a WHERE a.manager_id = p.id AND a.fiscal_year = $1) as completed_amount,
                    0 as pending_amount,
                    50 as percentage_completed
                FROM profiles p
                WHERE p.is_active = true AND p.role IN ('manager', 'partner', 'director')
                ${visibleIds ? ' AND p.id = ANY($2)' : ''}
            `;
            workProgressResult = await pool.query(fallbackQuery, visibleIds ? [fiscal_year, visibleIds] : [fiscal_year]);
        }

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
                total_proposals: Number(wp.total_proposals || 0),
                completed_proposals: Number(wp.completed_proposals || 0),
                pending_proposals: Number(wp.pending_proposals || 0),
                completed_percentage: Number(wp.percentage_completed || 0),
                pending_percentage: 100 - Number(wp.percentage_completed || 0),
                total_amount: Number(wp.completed_amount || 0) + Number(wp.pending_amount || 0),
                completed_amount: Number(wp.completed_amount || 0),
                pending_amount: Number(wp.pending_amount || 0),
                completed_items: [],
                pending_items: []
            }));
            return res.json(allProgress);
        }

        // For manager — return single object
        const wp = workProgressResult.rows[0];
        const totalAmount = Number(wp.completed_amount || 0) + Number(wp.pending_amount || 0);

        res.json({
            user_id: wp.user_id,
            user_name: wp.user_name,
            display_name: wp.display_name,
            total_proposals: Number(wp.total_proposals || 0),
            completed_proposals: Number(wp.completed_proposals || 0),
            pending_proposals: Number(wp.pending_proposals || 0),
            completed_percentage: Number(wp.percentage_completed || 0),
            pending_percentage: 100 - Number(wp.percentage_completed || 0),
            total_amount: totalAmount,
            completed_amount: Number(wp.completed_amount || 0),
            pending_amount: Number(wp.pending_amount || 0),
            completed_items: [],
            pending_items: []
        });
    } catch (err: unknown) {
        console.error('Work progress error:', err);
        res.status(500).json({ error: 'Failed to fetch work progress data' });
    }
});




// GET /api/dashboard/documents — browse assignment documents grouped by client
router.get('/documents', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26' } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);

        // Check for columns dynamically to avoid crashes
        let result;
        try {
            // First check if columns exist
            const colCheck = await pool.query(`
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'assignments' AND column_name IN ('file_url', 'scope_areas', 'scope_item')
            `);
            const hasFileUrl = colCheck.rows.some(c => c.column_name === 'file_url');
            
            if (!hasFileUrl) {
                console.warn('⚠️ assignments.file_url column missing, returning empty vault');
                return res.json({});
            }

            const hasScopeAreas = colCheck.rows.some(c => c.column_name === 'scope_areas');
            const hasScopeItem = colCheck.rows.some(c => c.column_name === 'scope_item');

            let titleExpr = "'Document'";
            if (hasScopeAreas && hasScopeItem) {
                titleExpr = "COALESCE(scope_areas, scope_item, 'Document')";
            } else if (hasScopeAreas) {
                titleExpr = "COALESCE(scope_areas, 'Document')";
            } else if (hasScopeItem) {
                titleExpr = "COALESCE(scope_item, 'Document')";
            }

            let query = `
                SELECT 
                    a.id,
                    c.name as client_name,
                    ${titleExpr} || ' (' || COALESCE(a.fiscal_year, 'N/A') || ')' as title,
                    a.file_url,
                    a.fiscal_year,
                    a.category
                FROM assignments a
                JOIN clients c ON c.id = a.client_id
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

            query += ` ORDER BY c.name, a.fiscal_year DESC`;
            result = await pool.query(query, params);
        } catch (dbErr: any) {
            console.error('Vault DB Error:', dbErr.message);
            return res.json({}); // Return empty instead of 500
        }

        // Group by client
        const grouped = result.rows.reduce((acc: any, curr: any) => {
            if (!acc[curr.client_name]) {
                acc[curr.client_name] = [];
            }
            acc[curr.client_name].push(curr);
            return acc;
        }, {});

        res.json(grouped);
    } catch (err: any) {
        console.error('Documents fetch error:', err);
        res.json({}); // Final fallback to empty object
    }
});

export default router;
