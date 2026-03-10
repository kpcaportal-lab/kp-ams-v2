import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/dashboard/summary — role-aware aggregate dashboard data
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26' } = req.query;
        const role = req.user!.role;
        const userId = req.user!.id;

        // Total billed (all invoices)
        const totalBilled = await pool.query(
            `SELECT COALESCE(SUM(i.professional_fees),0) as total
       FROM invoices i
       JOIN assignments a ON a.id = i.assignment_id
       WHERE a.fiscal_year=$1`,
            [fiscal_year]
        );

        // Self billed
        const selfBilled = await pool.query(
            `SELECT COALESCE(SUM(i.professional_fees),0) as total
       FROM invoices i
       JOIN assignments a ON a.id = i.assignment_id
       WHERE a.fiscal_year=$1 AND a.${role === 'manager' ? 'manager_id' : 'partner_id'}=$2`,
            [fiscal_year, userId]
        );

        // Overdue: sum of allocations in past months where billed_amount < amount
        const currentDate = new Date();
        const calMonth = currentDate.getMonth() + 1;
        const currentFiscalMonth = calMonth >= 4 ? calMonth - 3 : calMonth + 9;

        const overdueQuery = await pool.query(
            `SELECT COALESCE(SUM(fa.amount - fa.billed_amount),0) as total
       FROM fee_allocations fa
       JOIN assignments a ON a.id = fa.assignment_id
       WHERE a.status='active' AND fa.fiscal_year=$1
       AND fa.month < $2 AND fa.amount > fa.billed_amount
       AND a.${role === 'manager' ? 'manager_id' : 'partner_id'}=$3`,
            [fiscal_year, currentFiscalMonth, userId]
        );

        // Per-partner breakdown (for admin/partner/director)
        let partnerBreakdown: any[] = [];
        if (role !== 'manager') {
            const pResult = await pool.query(`
        SELECT pp.id, pp.full_name, pp.display_name,
          COALESCE(SUM(i.professional_fees),0) as billed
        FROM profiles pp
        LEFT JOIN assignments a ON a.partner_id=pp.id AND a.status='active' AND a.fiscal_year=$1
        LEFT JOIN invoices i ON i.assignment_id=a.id
        WHERE pp.role='partner' AND pp.is_active=true
        GROUP BY pp.id, pp.full_name, pp.display_name
        ORDER BY pp.full_name`, [fiscal_year]
            );
            partnerBreakdown = pResult.rows;
        }

        // Manager breakdown table
        const managerBreakdown = await pool.query(`
      SELECT pm.id, pm.full_name, pm.display_name,
        COALESCE(SUM(i.professional_fees),0) as billed_amount,
        CASE WHEN SUM(a.total_fees) > 0 THEN ROUND(SUM(i.professional_fees)*100/SUM(a.total_fees),1) ELSE 0 END as billing_pct
      FROM profiles pm
      LEFT JOIN assignments a ON a.manager_id=pm.id AND a.status='active' AND a.fiscal_year=$1
      LEFT JOIN invoices i ON i.assignment_id=a.id
      WHERE pm.role='manager' AND pm.is_active=true
      GROUP BY pm.id, pm.full_name, pm.display_name
      ORDER BY billed_amount DESC`, [fiscal_year]
        );

        // Category breakdown (for manager view)
        let categoryBreakdown: any[] = [];
        if (role === 'manager') {
            const catResult = await pool.query(`
        SELECT a.category,
          COALESCE(SUM(i.professional_fees),0) as billed,
          CASE WHEN SUM(a.total_fees)>0 THEN ROUND(SUM(i.professional_fees)*100/SUM(a.total_fees),1) ELSE 0 END as billing_pct
        FROM assignments a
        LEFT JOIN invoices i ON i.assignment_id=a.id
        WHERE a.manager_id=$1 AND a.status='active' AND a.fiscal_year=$2
        GROUP BY a.category ORDER BY a.category`, [userId, fiscal_year]
            );
            categoryBreakdown = catResult.rows;
        }

        res.json({
            totalBilled: Number(totalBilled.rows[0].total),
            selfBilled: Number(selfBilled.rows[0].total),
            overdue: Number(overdueQuery.rows[0].total),
            billingPct: 0, // Simplified - will calculate based on available data if needed
            selfBillingPct: 0, // Simplified - will calculate based on available data if needed
            partnerBreakdown,
            managerBreakdown: managerBreakdown.rows,
            categoryBreakdown,
        });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/dashboard/work-progress — User-specific work progress from database
router.get('/work-progress', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26' } = req.query;
        const userId = req.user!.id;

        // Get work progress for the authenticated user
        const workProgressResult = await pool.query(`
            SELECT
                wp.*,
                p.full_name as user_name,
                p.display_name
            FROM work_progress wp
            JOIN profiles p ON p.id = wp.user_id
            WHERE wp.user_id = $1 AND wp.fiscal_year = $2
        `, [userId, fiscal_year]);

        if (workProgressResult.rows.length === 0) {
            return res.json({
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
            });
        }

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
            completed_items: [], // TODO: Add detailed items if needed
            pending_items: []   // TODO: Add detailed items if needed
        });
    } catch (err) {
        console.error('Work progress error:', err);
        res.status(500).json({ error: 'Failed to fetch work progress data' });
    }
});

export default router;
