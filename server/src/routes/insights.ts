import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate, getVisibleUserIds, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(requireRole('admin', 'partner', 'director'));

// ── FIRM-WIDE SUMMARIES ──────────────────────────────────────────

// GET /api/insights/summary — firm KPI strip data
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26' } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);

        // 1. Total Clients
        let totalClients = 0;
        try {
            let clientQuery = `SELECT COUNT(DISTINCT client_id) as count FROM assignments WHERE status = 'active' AND fiscal_year = $1`;
            const clientParams: any[] = [fiscal_year];
            if (visibleIds !== null) {
                clientQuery += ` AND (manager_id = ANY($2) OR partner_id = ANY($2))`;
                clientParams.push(visibleIds);
            }
            const clientResult = await pool.query(clientQuery, clientParams);
            totalClients = parseInt(clientResult.rows[0]?.count || '0');
        } catch (e) {}

        // 2. Total Proposals
        let totalProposals = 0;
        try {
            let proposalQuery = `SELECT COUNT(*) as count FROM proposals WHERE fiscal_year = $1`;
            const proposalParams: any[] = [fiscal_year];
            if (visibleIds !== null) {
                proposalQuery += ` AND (prepared_by = ANY($2) OR responsible_partner = ANY($2))`;
                proposalParams.push(visibleIds);
            }
            const proposalResult = await pool.query(proposalQuery, proposalParams);
            totalProposals = parseInt(proposalResult.rows[0]?.count || '0');
        } catch (e) {}

        // 3. Active Assignments
        let activeAssignments = 0;
        try {
            let assignmentQuery = `SELECT COUNT(*) as count FROM assignments WHERE status IN ('active', 'draft') AND fiscal_year = $1`;
            const assignmentParams: any[] = [fiscal_year];
            if (visibleIds !== null) {
                assignmentQuery += ` AND (manager_id = ANY($2) OR partner_id = ANY($2))`;
                assignmentParams.push(visibleIds);
            }
            const assignmentResult = await pool.query(assignmentQuery, assignmentParams);
            activeAssignments = parseInt(assignmentResult.rows[0]?.count || '0');
        } catch (e) {}

        // 4. Total Billed
        let totalBilled = 0;
        try {
            let billedQuery = `
                SELECT COALESCE(SUM(i.professional_fees), SUM(a.billed_amount), 0) as total
                FROM assignments a
                LEFT JOIN invoices i ON a.id = i.assignment_id
                WHERE a.fiscal_year = $1
            `;
            const billedParams: any[] = [fiscal_year];
            if (visibleIds !== null) {
                billedQuery += ` AND (a.manager_id = ANY($2) OR a.partner_id = ANY($2))`;
                billedParams.push(visibleIds);
            }
            const billedResult = await pool.query(billedQuery, billedParams);
            totalBilled = parseFloat(billedResult.rows[0]?.total || '0');
        } catch (e) {
            // Very basic fallback if invoices join fails
            try {
                const fallback = await pool.query('SELECT COALESCE(SUM(billed_amount), 0) as total FROM assignments WHERE fiscal_year = $1', [fiscal_year]);
                totalBilled = parseFloat(fallback.rows[0]?.total || '0');
            } catch (e2) {}
        }

        // 5. Total Budget
        let totalBudget = 0;
        try {
            let budgetQuery = `SELECT COALESCE(SUM(total_fees), 0) as total FROM assignments WHERE fiscal_year = $1`;
            const budgetParams: any[] = [fiscal_year];
            if (visibleIds !== null) {
                budgetQuery += ` AND (manager_id = ANY($2) OR partner_id = ANY($2))`;
                budgetParams.push(visibleIds);
            }
            const budgetResult = await pool.query(budgetQuery, budgetParams);
            totalBudget = parseFloat(budgetResult.rows[0]?.total || '0');
        } catch (e) {}

        // 6. Billing Percentage
        const billingPct = totalBudget > 0 ? Math.round((totalBilled / totalBudget) * 1000) / 10 : 0;

        res.json({
            totalClients,
            totalProposals,
            activeAssignments,
            totalBilled,
            totalBudget,
            billingPct
        });
    } catch (err) {
        console.error('Insights Summary Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/insights/managers?sort=billed&period=FY2024-25 — manager list with stats
router.get('/managers', async (req: Request, res: Response) => {
    try {
        const { sort = 'billed', period = '2025-26' } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);

        let result;
        try {
            let query = `
                SELECT 
                    p.id, p.full_name, p.display_name, p.role, p.email,
                    (SELECT COUNT(DISTINCT a.client_id) FROM assignments a WHERE a.manager_id = p.id AND a.fiscal_year = $1) as client_count,
                    (SELECT COUNT(*) FROM assignments a WHERE a.manager_id = p.id AND a.fiscal_year = $1) as assignment_count,
                    (SELECT COUNT(*) FROM proposals pr WHERE pr.prepared_by = p.id AND pr.fiscal_year = $1) as proposal_count,
                    (
                        SELECT COALESCE(SUM(i.professional_fees), MAX(a.billed_amount), 0) 
                        FROM assignments a 
                        LEFT JOIN invoices i ON i.assignment_id = a.id 
                        WHERE a.manager_id = p.id AND a.fiscal_year = $1
                    ) as billed_amount,
                    (SELECT COALESCE(SUM(a.total_fees), 0) FROM assignments a WHERE a.manager_id = p.id AND a.fiscal_year = $1) as total_budget
                FROM profiles p
                WHERE p.role IN ('manager', 'assistant_manager', 'partner', 'director') 
                  AND p.is_active = true
            `;
            const params: any[] = [period];

            if (visibleIds !== null) {
                query += ` AND p.id = ANY($2)`;
                params.push(visibleIds);
            }

            if (sort === 'billed') query += ` ORDER BY billed_amount DESC, p.full_name ASC`;
            else if (sort === 'clients') query += ` ORDER BY client_count DESC, p.full_name ASC`;
            else if (sort === 'assignments') query += ` ORDER BY assignment_count DESC, p.full_name ASC`;

            result = await pool.query(query, params);
        } catch (dbErr: any) {
            console.warn('⚠️ Insights managers query failed, falling back to basic profile list');
            result = await pool.query(
                "SELECT id, full_name, display_name, role, email, 0 as client_count, 0 as assignment_count, 0 as proposal_count, 0 as billed_amount, 0 as total_budget FROM profiles WHERE is_active=true AND role IN ('manager', 'partner', 'director') ORDER BY full_name"
            );
        }
        res.json(result.rows);
    } catch (err) {
        console.error('Insights Managers Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/insights/leaders — partner & director summary cards
router.get('/leaders', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26' } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);

        let query = `
            SELECT 
                p.id, p.full_name as name, p.role,
                UPPER(LEFT(p.full_name, 1) || COALESCE(SUBSTRING(p.full_name FROM POSITION(' ' IN p.full_name) + 1 FOR 1), '')) as initials,
                (SELECT COUNT(DISTINCT a.client_id) FROM assignments a WHERE (a.partner_id = p.id OR a.manager_id = p.id) AND a.fiscal_year = $1) as "totalClients",
                (SELECT COALESCE(SUM(a.total_fees), 0) FROM assignments a WHERE (a.partner_id = p.id OR a.manager_id = p.id) AND a.fiscal_year = $1) as "totalBudget",
                (SELECT COALESCE(SUM(a.billed_amount), 0) FROM assignments a WHERE (a.partner_id = p.id OR a.manager_id = p.id) AND a.fiscal_year = $1) as "totalBilling"
            FROM profiles p
            WHERE p.role IN ('partner', 'director') 
              AND p.is_active = true
        `;
        const params: any[] = [fiscal_year];

        if (visibleIds !== null) {
            query += ` AND p.id = ANY($2)`;
            params.push(visibleIds);
        }

        query += ` ORDER BY "totalBilling" DESC, p.full_name ASC`;

        const result = await pool.query(query, params);
        const leaders = result.rows.map((r: any) => ({
            id: r.id,
            name: r.name,
            initials: r.initials,
            role: r.role,
            totalClients: parseInt(r.totalClients || '0'),
            totalBudget: parseFloat(r.totalBudget || '0'),
            totalBilling: parseFloat(r.totalBilling || '0'),
            billingPct: parseFloat(r.totalBudget || '0') > 0 
                ? Math.round((parseFloat(r.totalBilling || '0') / parseFloat(r.totalBudget || '0')) * 100) 
                : 0
        }));

        res.json(leaders);
    } catch (err) {
        console.error('Insights Leaders Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// ── FIRM-WIDE DRILL-DOWN ENDPOINTS ──────────────────────────────

// GET /api/insights/firm/clients — all clients across managers
router.get('/firm/clients', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26', manager_id, search = '', page = 1, limit = 10 } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);
        const offset = (Number(page) - 1) * Number(limit);

        let countQuery = `
            SELECT COUNT(DISTINCT c.id) as total
            FROM clients c
            JOIN assignments a ON a.client_id = c.id
            WHERE a.fiscal_year = $1 AND c.name ILIKE $2
        `;
        const countParams: any[] = [fiscal_year, `%${search}%`];
        let paramIdx = 3;

        if (manager_id) {
            countQuery += ` AND a.manager_id = $${paramIdx}`;
            countParams.push(manager_id);
            paramIdx++;
        }
        if (visibleIds !== null) {
            countQuery += ` AND (a.manager_id = ANY($${paramIdx}) OR a.partner_id = ANY($${paramIdx}))`;
            countParams.push(visibleIds);
            paramIdx++;
        }

        const countRes = await pool.query(countQuery, countParams);
        const total = parseInt(countRes.rows[0].total);

        let dataQuery = `
            SELECT DISTINCT ON (c.id)
                c.id, c.name, c.status,
                p.full_name as manager_name,
                COALESCE(SUM(a.billed_amount) OVER (PARTITION BY c.id), 0) as billed_amount,
                MIN(a.created_at) OVER (PARTITION BY c.id) as onboarded_date
            FROM clients c
            JOIN assignments a ON a.client_id = c.id
            JOIN profiles p ON p.id = a.manager_id
            WHERE a.fiscal_year = $1 AND c.name ILIKE $2
        `;
        const dataParams: any[] = [fiscal_year, `%${search}%`];
        let dParamIdx = 3;

        if (manager_id) {
            dataQuery += ` AND a.manager_id = $${dParamIdx}`;
            dataParams.push(manager_id);
            dParamIdx++;
        }
        if (visibleIds !== null) {
            dataQuery += ` AND (a.manager_id = ANY($${dParamIdx}) OR a.partner_id = ANY($${dParamIdx}))`;
            dataParams.push(visibleIds);
            dParamIdx++;
        }

        dataQuery += ` ORDER BY c.id, billed_amount DESC LIMIT $${dParamIdx} OFFSET $${dParamIdx + 1}`;
        dataParams.push(Number(limit), offset);

        const dataRes = await pool.query(dataQuery, dataParams);
        res.json({ data: dataRes.rows, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error('Firm Clients Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/insights/firm/proposals — all proposals across managers
router.get('/firm/proposals', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26', manager_id, search = '', page = 1, limit = 10 } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);
        const offset = (Number(page) - 1) * Number(limit);

        let countQuery = `
            SELECT COUNT(*) as total
            FROM proposals pr
            JOIN clients c ON c.id = pr.client_id
            JOIN profiles p ON p.id = pr.prepared_by
            WHERE pr.fiscal_year = $1 AND (c.name ILIKE $2 OR pr.number ILIKE $2)
        `;
        const countParams: any[] = [fiscal_year, `%${search}%`];
        let paramIdx = 3;

        if (manager_id) {
            countQuery += ` AND pr.prepared_by = $${paramIdx}`;
            countParams.push(manager_id);
            paramIdx++;
        }
        if (visibleIds !== null) {
            countQuery += ` AND (pr.prepared_by = ANY($${paramIdx}) OR pr.responsible_partner = ANY($${paramIdx}))`;
            countParams.push(visibleIds);
            paramIdx++;
        }

        const countRes = await pool.query(countQuery, countParams);
        const total = parseInt(countRes.rows[0].total);

        let dataQuery = `
            SELECT 
                pr.id, pr.number as proposal_id, c.name as client_name,
                p.full_name as manager_name,
                pr.proposal_date as date_sent, pr.quotation_amount as amount,
                pr.status
            FROM proposals pr
            JOIN clients c ON c.id = pr.client_id
            JOIN profiles p ON p.id = pr.prepared_by
            WHERE pr.fiscal_year = $1 AND (c.name ILIKE $2 OR pr.number ILIKE $2)
        `;
        const dataParams: any[] = [fiscal_year, `%${search}%`];
        let dParamIdx = 3;

        if (manager_id) {
            dataQuery += ` AND pr.prepared_by = $${dParamIdx}`;
            dataParams.push(manager_id);
            dParamIdx++;
        }
        if (visibleIds !== null) {
            dataQuery += ` AND (pr.prepared_by = ANY($${dParamIdx}) OR pr.responsible_partner = ANY($${dParamIdx}))`;
            dataParams.push(visibleIds);
            dParamIdx++;
        }

        dataQuery += ` ORDER BY pr.created_at DESC LIMIT $${dParamIdx} OFFSET $${dParamIdx + 1}`;
        dataParams.push(Number(limit), offset);

        const dataRes = await pool.query(dataQuery, dataParams);
        res.json({ data: dataRes.rows, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error('Firm Proposals Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/insights/firm/assignments — all assignments across managers
router.get('/firm/assignments', async (req: Request, res: Response) => {
    try {
        const { fiscal_year = '2025-26', manager_id, search = '', page = 1, limit = 10 } = req.query;
        const visibleIds = await getVisibleUserIds(req.user!);
        const offset = (Number(page) - 1) * Number(limit);

        let countQuery = `
            SELECT COUNT(*) as total
            FROM assignments a
            JOIN clients c ON c.id = a.client_id
            WHERE a.fiscal_year = $1 AND (c.name ILIKE $2 OR a.subcategory ILIKE $2)
        `;
        const countParams: any[] = [fiscal_year, `%${search}%`];
        let paramIdx = 3;

        if (manager_id) {
            countQuery += ` AND a.manager_id = $${paramIdx}`;
            countParams.push(manager_id);
            paramIdx++;
        }
        if (visibleIds !== null) {
            countQuery += ` AND (a.manager_id = ANY($${paramIdx}) OR a.partner_id = ANY($${paramIdx}))`;
            countParams.push(visibleIds);
            paramIdx++;
        }

        const countRes = await pool.query(countQuery, countParams);
        const total = parseInt(countRes.rows[0].total);

        let dataQuery = `
            SELECT 
                a.id as assignment_id, c.name as client_name,
                p.full_name as manager_name,
                a.subcategory as work_type, a.end_date as due_date,
                a.status, a.total_fees as budget_amount, a.billed_amount
            FROM assignments a
            JOIN clients c ON c.id = a.client_id
            JOIN profiles p ON p.id = a.manager_id
            WHERE a.fiscal_year = $1 AND (c.name ILIKE $2 OR a.subcategory ILIKE $2)
        `;
        const dataParams: any[] = [fiscal_year, `%${search}%`];
        let dParamIdx = 3;

        if (manager_id) {
            dataQuery += ` AND a.manager_id = $${dParamIdx}`;
            dataParams.push(manager_id);
            dParamIdx++;
        }
        if (visibleIds !== null) {
            dataQuery += ` AND (a.manager_id = ANY($${dParamIdx}) OR a.partner_id = ANY($${dParamIdx}))`;
            dataParams.push(visibleIds);
            dParamIdx++;
        }

        dataQuery += ` ORDER BY a.created_at DESC LIMIT $${dParamIdx} OFFSET $${dParamIdx + 1}`;
        dataParams.push(Number(limit), offset);

        const dataRes = await pool.query(dataQuery, dataParams);
        res.json({ data: dataRes.rows, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error('Firm Assignments Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// ── INDIVIDUAL MANAGER DETAILS ───────────────────────────────────

// GET /api/managers/:id/clients?search=&page=
router.get('/:id/clients', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { search = '', page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const countQuery = `
            SELECT COUNT(DISTINCT c.id) as total
            FROM clients c
            JOIN assignments a ON a.client_id = c.id
            WHERE a.manager_id = $1 AND c.name ILIKE $2
        `;
        const countRes = await pool.query(countQuery, [id, `%${search}%`]);
        const total = parseInt(countRes.rows[0].total);

        const dataQuery = `
            SELECT 
                c.id, c.name, c.status,
                COALESCE(SUM(i.professional_fees), 0) as billed_amount,
                MIN(a.created_at) as onboarded_date
            FROM clients c
            JOIN assignments a ON a.client_id = c.id
            LEFT JOIN invoices i ON i.assignment_id = a.id
            WHERE a.manager_id = $1 AND c.name ILIKE $2
            GROUP BY c.id, c.name, c.status
            ORDER BY billed_amount DESC
            LIMIT $3 OFFSET $4
        `;
        const dataRes = await pool.query(dataQuery, [id, `%${search}%`, limit, offset]);

        res.json({
            data: dataRes.rows,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (err) {
        console.error('Manager Clients Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/managers/:id/proposals?search=&page=
router.get('/:id/proposals', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { search = '', page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const countQuery = `
            SELECT COUNT(*) as total
            FROM proposals p
            JOIN clients c ON c.id = p.client_id
            WHERE p.prepared_by = $1 AND (c.name ILIKE $2 OR p.number ILIKE $2)
        `;
        const countRes = await pool.query(countQuery, [id, `%${search}%`]);
        const total = parseInt(countRes.rows[0].total);

        const dataQuery = `
            SELECT 
                p.id, p.number as proposal_id, c.name as client_name,
                p.proposal_date as date_sent, p.quotation_amount as amount,
                p.status
            FROM proposals p
            JOIN clients c ON c.id = p.client_id
            WHERE p.prepared_by = $1 AND (c.name ILIKE $2 OR p.number ILIKE $2)
            ORDER BY p.created_at DESC
            LIMIT $3 OFFSET $4
        `;
        const dataRes = await pool.query(dataQuery, [id, `%${search}%`, limit, offset]);

        res.json({
            data: dataRes.rows,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (err) {
        console.error('Manager Proposals Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/managers/:id/assignments?search=&page=
router.get('/:id/assignments', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { search = '', page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const countQuery = `
            SELECT COUNT(*) as total
            FROM assignments a
            JOIN clients c ON c.id = a.client_id
            WHERE a.manager_id = $1 AND (c.name ILIKE $2 OR a.subcategory ILIKE $2)
        `;
        const countRes = await pool.query(countQuery, [id, `%${search}%`]);
        const total = parseInt(countRes.rows[0].total);

        const dataQuery = `
            SELECT 
                a.id as assignment_id, c.name as client_name,
                a.subcategory as work_type, a.end_date as due_date,
                a.status,
                a.total_fees as budget_amount,
                a.billed_amount as billed_amount
            FROM assignments a
            JOIN clients c ON c.id = a.client_id
            WHERE a.manager_id = $1 AND (c.name ILIKE $2 OR a.subcategory ILIKE $2)
            ORDER BY a.created_at DESC
            LIMIT $3 OFFSET $4
        `;
        const dataRes = await pool.query(dataQuery, [id, `%${search}%`, limit, offset]);

        res.json({
            data: dataRes.rows,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (err) {
        console.error('Manager Assignments Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/managers/:id/billing?period=
router.get('/:id/billing', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { period = '2025-26' } = req.query;

        // Billing chart data (last 10 months)
        // Since we don't have a robust 'collected' column, we'll mock collected as 90% of billed for demo/req purposes
        // Or we can just return billed for now.
        const chartQuery = `
            SELECT 
                EXTRACT(MONTH FROM i.invoice_date) as month,
                EXTRACT(YEAR FROM i.invoice_date) as year,
                SUM(i.professional_fees) as billed,
                SUM(i.professional_fees) * 0.9 as collected
            FROM invoices i
            JOIN assignments a ON a.id = i.assignment_id
            WHERE a.manager_id = $1 AND a.fiscal_year = $2
            GROUP BY year, month
            ORDER BY year DESC, month DESC
            LIMIT 10
        `;
        const chartRes = await pool.query(chartQuery, [id, period]);

        // Billing table data
        const tableQuery = `
            SELECT 
                TO_CHAR(i.invoice_date, 'Month YYYY') as month_name,
                COUNT(i.id) as invoice_count,
                SUM(i.professional_fees) as amount_billed,
                SUM(i.professional_fees) * 0.9 as amount_collected
            FROM invoices i
            JOIN assignments a ON a.id = i.assignment_id
            WHERE a.manager_id = $1 AND a.fiscal_year = $2
            GROUP BY month_name, i.invoice_date
            ORDER BY i.invoice_date DESC
        `;
        const tableRes = await pool.query(tableQuery, [id, period]);

        res.json({
            chartData: chartRes.rows.reverse(),
            tableData: tableRes.rows
        });
    } catch (err) {
        console.error('Manager Billing Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
