import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate, getVisibleUserIds, logAuditEvent } from '../middleware/auth.js';
const router = Router();
router.use(authenticate);
// GET /api/assignments — role-filtered
router.get('/', async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;
        const { status, category, fiscal_year, partner_id, manager_id, subcategory, assessment_year } = req.query;
        let query = `
      SELECT a.*, c.name as client_name, c.gstn,
        pm.full_name as manager_name, pp.full_name as partner_name,
        p.number as proposal_number
      FROM assignments a
      LEFT JOIN clients c ON c.id = a.client_id
      LEFT JOIN profiles pm ON pm.id = a.manager_id
      LEFT JOIN profiles pp ON pp.id = a.partner_id
      LEFT JOIN proposals p ON p.id = a.proposal_id
      WHERE 1=1`;
        const params = [];
        // ── RBAC filtering ──
        const visibleIds = await getVisibleUserIds(req.user);
        if (visibleIds !== null) {
            params.push(visibleIds);
            query += ` AND (a.manager_id = ANY($${params.length}) OR a.partner_id = ANY($${params.length}))`;
        }
        if (status) {
            params.push(status);
            query += ` AND a.status = $${params.length}`;
        }
        if (category) {
            params.push(category);
            query += ` AND a.category = $${params.length}`;
        }
        if (fiscal_year) {
            params.push(fiscal_year);
            query += ` AND a.fiscal_year = $${params.length}`;
        }
        if (partner_id) {
            params.push(partner_id);
            query += ` AND a.partner_id = $${params.length}`;
        }
        if (manager_id) {
            params.push(manager_id);
            query += ` AND a.manager_id = $${params.length}`;
        }
        if (subcategory) {
            params.push(subcategory);
            query += ` AND a.subcategory = $${params.length}`;
        }
        if (assessment_year) {
            params.push(assessment_year);
            query += ` AND a.assessment_year = $${params.length}`;
        }
        query += ' ORDER BY a.created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// GET /api/assignments/:id
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT a.*, c.name as client_name,
        pm.full_name as manager_name, pm.email as manager_email,
        pp.full_name as partner_name,
        p.number as proposal_number
      FROM assignments a
      LEFT JOIN clients c ON c.id = a.client_id
      LEFT JOIN profiles pm ON pm.id = a.manager_id
      LEFT JOIN profiles pp ON pp.id = a.partner_id
      LEFT JOIN proposals p ON p.id = a.proposal_id
      WHERE a.id = $1`, [req.params.id]);
        if (!result.rows.length)
            return res.status(404).json({ error: 'Not found' });
        const allocations = await pool.query('SELECT * FROM fee_allocations WHERE assignment_id=$1 AND fiscal_year=$2 ORDER BY month', [req.params.id, result.rows[0].fiscal_year]);
        const invoices = await pool.query('SELECT * FROM invoices WHERE assignment_id=$1 ORDER BY invoice_date DESC', [req.params.id]);
        const history = await pool.query(`SELECT ch.*, p.full_name as changed_by_name 
       FROM change_history ch LEFT JOIN profiles p ON p.id = ch.changed_by
       WHERE ch.entity_id=$1 ORDER BY ch.changed_at DESC`, [req.params.id]);
        res.json({
            ...result.rows[0],
            allocations: allocations.rows,
            invoices: invoices.rows,
            history: history.rows
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/assignments
router.post('/', async (req, res) => {
    try {
        const { proposal_id, client_id, gstn, category, scope_areas, total_fees, billing_cycle, partner_id, manager_id, start_date, end_date, notes, fiscal_year, subcategory, assessment_year, scope_item } = req.body;
        const result = await pool.query(`
      INSERT INTO assignments (
        proposal_id, client_id, gstn, category, scope_areas, total_fees,
        billing_cycle, partner_id, manager_id, start_date, end_date, notes, fiscal_year, status,
        subcategory, assessment_year, scope_item
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'draft',$14,$15,$16) RETURNING *`, [proposal_id, client_id, gstn, category || 'A', scope_areas || scope_item, total_fees,
            billing_cycle, partner_id, manager_id, start_date || null, end_date || null,
            notes || null, fiscal_year || '2025-26',
            subcategory || 'other', assessment_year || fiscal_year || '2025-26', scope_item || scope_areas]);
        // Initialize 12 empty fee allocation rows
        const fiscalYr = fiscal_year || '2025-26';
        const allocationInserts = Array.from({ length: 12 }, (_, i) => pool.query('INSERT INTO fee_allocations (assignment_id,month,fiscal_year,amount) VALUES ($1,$2,$3,0) ON CONFLICT DO NOTHING', [result.rows[0].id, i + 1, fiscalYr]));
        await Promise.all(allocationInserts);
        // Audit log
        await logAuditEvent(req.user, 'create', 'assignment', result.rows[0].id, { client_id, total_fees }, req);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// PUT /api/assignments/:id
router.put('/:id', async (req, res) => {
    try {
        const old = await pool.query('SELECT * FROM assignments WHERE id=$1', [req.params.id]);
        if (!old.rows.length)
            return res.status(404).json({ error: 'Not found' });
        const fields = ['category', 'scope_areas', 'total_fees', 'billing_cycle', 'partner_id',
            'manager_id', 'start_date', 'end_date', 'notes', 'gstn', 'subcategory', 'assessment_year', 'scope_item'];
        const updates = [];
        const params = [];
        const changedFields = [];
        for (const f of fields) {
            if (req.body[f] !== undefined && req.body[f] !== old.rows[0][f]) {
                changedFields.push({ field: f, old: old.rows[0][f], new: req.body[f] });
                params.push(req.body[f]);
                updates.push(`${f} = $${params.length}`);
            }
        }
        if (updates.length) {
            params.push(req.params.id);
            await pool.query(`UPDATE assignments SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${params.length}`, params);
            for (const ch of changedFields) {
                await pool.query('INSERT INTO change_history (entity_type,entity_id,field_name,old_value,new_value,changed_by,reason) VALUES ($1,$2,$3,$4,$5,$6,$7)', ['assignment', req.params.id, ch.field, String(ch.old), String(ch.new), req.user.id, req.body.reason || null]);
            }
            // Audit log
            await logAuditEvent(req.user, 'update', 'assignment', req.params.id, { changedFields }, req);
        }
        const updated = await pool.query('SELECT * FROM assignments WHERE id=$1', [req.params.id]);
        res.json(updated.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// PATCH /api/assignments/:id/confirm
router.patch('/:id/confirm', async (req, res) => {
    try {
        await pool.query('UPDATE assignments SET status=\'active\', updated_at=NOW() WHERE id=$1 AND status=\'draft\'', [req.params.id]);
        await pool.query('INSERT INTO change_history (entity_type,entity_id,field_name,old_value,new_value,changed_by) VALUES ($1,$2,$3,$4,$5,$6)', ['assignment', req.params.id, 'status', 'draft', 'active', req.user.id]);
        await logAuditEvent(req.user, 'update', 'assignment', req.params.id, { action: 'confirm', status: 'active' }, req);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// PUT /api/assignments/:id/allocations
router.put('/:id/allocations', async (req, res) => {
    try {
        const { allocations, fiscal_year } = req.body;
        const assignment = await pool.query('SELECT total_fees FROM assignments WHERE id=$1', [req.params.id]);
        if (!assignment.rows.length)
            return res.status(404).json({ error: 'Not found' });
        const totalAllocated = allocations.reduce((sum, a) => sum + Number(a.amount), 0);
        const totalFees = Number(assignment.rows[0].total_fees);
        if (Math.abs(totalAllocated - totalFees) > 1) {
            return res.status(400).json({
                error: `Allocation sum (${totalAllocated}) must equal total fees (${totalFees})`
            });
        }
        for (const alloc of allocations) {
            await pool.query(`UPDATE fee_allocations SET amount=$1, updated_at=NOW() 
         WHERE assignment_id=$2 AND month=$3 AND fiscal_year=$4`, [alloc.amount, req.params.id, alloc.month, fiscal_year || '2025-26']);
        }
        await pool.query('INSERT INTO change_history (entity_type,entity_id,field_name,old_value,new_value,changed_by) VALUES ($1,$2,$3,$4,$5,$6)', ['fee_allocation', req.params.id, 'monthly_allocation', 'previous', JSON.stringify(allocations), req.user.id]);
        await logAuditEvent(req.user, 'update', 'fee_allocation', req.params.id, { allocations }, req);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
export default router;
