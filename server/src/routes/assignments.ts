import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate, getVisibleUserIds, logAuditEvent } from '../middleware/auth.js';
import { validateCreateAssignment, validateUpdateAssignment } from '../middleware/validation.js';

const router = Router();
router.use(authenticate);

// GET /api/assignments — role-filtered
router.get('/', async (req: Request, res: Response) => {
    try {
        const role = req.user!.role;
        const userId = req.user!.id;
        const { status, category, fiscal_year, partner_id, manager_id, subcategory, assessment_year } = req.query;

        let query = `
      SELECT a.*, c.name as client_name,
        pm.full_name as manager_name, pp.full_name as partner_name,
        p.number as proposal_number
      FROM assignments a
      LEFT JOIN clients c ON c.id = a.client_id
      LEFT JOIN profiles pm ON pm.id = a.manager_id
      LEFT JOIN profiles pp ON pp.id = a.partner_id
      LEFT JOIN proposals p ON p.id = a.proposal_id
      WHERE 1=1`;

        const params: unknown[] = [];
        // Apply RBAC filter
        const visibleIds = await getVisibleUserIds(req.user!);
        if (visibleIds !== null) {
            params.push(visibleIds);
            query += ` AND (a.manager_id = ANY($${params.length}) OR a.partner_id = ANY($${params.length}) OR a.created_by = ANY($${params.length}))`;
        }

        if (status) { params.push(status); query += ` AND a.status = $${params.length}`; }
        if (category) { params.push(category); query += ` AND a.category = $${params.length}`; }
        if (fiscal_year) { params.push(fiscal_year); query += ` AND a.fiscal_year = $${params.length}`; }
        if (partner_id) { params.push(partner_id); query += ` AND a.partner_id = $${params.length}`; }
        if (manager_id) { params.push(manager_id); query += ` AND a.manager_id = $${params.length}`; }
        if (subcategory) { params.push(subcategory); query += ` AND a.subcategory = $${params.length}`; }
        if (assessment_year) { params.push(assessment_year); query += ` AND a.assessment_year = $${params.length}`; }

        query += ' ORDER BY a.created_at DESC';
        
        let result;
        try {
            result = await pool.query(query, params);
        } catch (dbErr: any) {
            if (dbErr.code === '42703') {
                console.warn('⚠️ Some columns missing in assignments query, falling back to basic select');
                const fallbackQuery = `
                    SELECT a.id, a.client_id, a.category, a.total_fees, a.status, a.fiscal_year, 
                           a.manager_id, a.partner_id, a.created_at,
                           c.name as client_name,
                           pm.full_name as manager_name, pp.full_name as partner_name
                    FROM assignments a
                    LEFT JOIN clients c ON c.id = a.client_id
                    LEFT JOIN profiles pm ON pm.id = a.manager_id
                    LEFT JOIN profiles pp ON pp.id = a.partner_id
                    WHERE 1=1
                    ${visibleIds ? ` AND (a.manager_id = ANY($1) OR a.partner_id = ANY($1))` : ''}
                    ORDER BY a.created_at DESC
                `;
                result = await pool.query(fallbackQuery, visibleIds ? [visibleIds] : []);
            } else {
                throw dbErr;
            }
        }
        res.json(result.rows);
    } catch (err: unknown) { console.error('Assignments GET error:', err); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/assignments/:id
router.get('/:id', async (req: Request, res: Response) => {
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

        if (!result.rows.length) return res.status(404).json({ error: 'Not found' });

        // Visibility check
        const visibleIds = await getVisibleUserIds(req.user!);
        if (visibleIds !== null) {
            const isAuthorized = 
                visibleIds.includes(result.rows[0].created_by) || 
                visibleIds.includes(result.rows[0].manager_id) || 
                visibleIds.includes(result.rows[0].partner_id);
            
            if (!isAuthorized) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const allocations = await pool.query(
            'SELECT * FROM fee_allocations WHERE assignment_id=$1 AND fiscal_year=$2 ORDER BY month',
            [req.params.id, result.rows[0].fiscal_year]
        );

        const invoices = await pool.query(
            'SELECT * FROM invoices WHERE assignment_id=$1 ORDER BY invoice_date DESC',
            [req.params.id]
        );

        const history = await pool.query(
            `SELECT ch.*, p.full_name as changed_by_name 
       FROM change_history ch LEFT JOIN profiles p ON p.id = ch.changed_by
       WHERE ch.entity_id=$1 ORDER BY ch.changed_at DESC`,
            [req.params.id]
        );

        res.json({
            ...result.rows[0],
            allocations: allocations.rows,
            invoices: invoices.rows,
            history: history.rows
        });
    } catch (err: unknown) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// POST /api/assignments
router.post('/', ...validateCreateAssignment, async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const {
            proposal_id, client_id, gstn, category, scope_areas, total_fees,
            billing_cycle, partner_id, manager_id, start_date, end_date, notes, fiscal_year,
            subcategory, assessment_year, scope_item
        } = req.body;

        // Start transaction
        await client.query('BEGIN');

        // Insert assignment
        const result = await client.query(`
      INSERT INTO assignments (
        proposal_id, client_id, gstn, category, scope_areas, total_fees,
        billing_cycle, partner_id, manager_id, start_date, end_date, notes, fiscal_year, status,
        subcategory, assessment_year, scope_item, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'draft',$14,$15,$16, $17) RETURNING *`,
            [proposal_id, client_id, gstn, category || 'A', scope_areas || scope_item, total_fees,
                billing_cycle, partner_id || req.user!.id, manager_id || req.user!.id, start_date || null, end_date || null,
                notes || null, fiscal_year || '2025-26',
                subcategory || 'other', assessment_year || fiscal_year || '2025-26', scope_item || scope_areas,
                req.user!.id]
        );

        // Initialize 12 fee allocation rows within transaction
        const fiscalYr = fiscal_year || '2025-26';
        const assignmentId = result.rows[0].id;
        
        for (let i = 1; i <= 12; i++) {
            await client.query(
                'INSERT INTO fee_allocations (assignment_id,month,fiscal_year,amount) VALUES ($1,$2,$3,0) ON CONFLICT DO NOTHING',
                [assignmentId, i, fiscalYr]
            );
        }

        // Commit transaction
        await client.query('COMMIT');

        // Audit log (outside transaction for non-critical operation)
        await logAuditEvent(req.user!, 'create', 'assignment', assignmentId, { client_id, total_fees }, req);

        res.status(201).json(result.rows[0]);
    } catch (err: unknown) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// PUT /api/assignments/:id
router.put('/:id', ...validateUpdateAssignment, async (req: Request, res: Response) => {
    try {
        const old = await pool.query('SELECT * FROM assignments WHERE id=$1', [req.params.id]);
        if (!old.rows.length) return res.status(404).json({ error: 'Not found' });

        // Visibility check
        const visibleIds = await getVisibleUserIds(req.user!);
        if (visibleIds !== null) {
            const isAuthorized = 
                visibleIds.includes(old.rows[0].created_by) || 
                visibleIds.includes(old.rows[0].manager_id) || 
                visibleIds.includes(old.rows[0].partner_id);
            
            if (!isAuthorized) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const fields = ['category', 'scope_areas', 'total_fees', 'billing_cycle', 'partner_id',
            'manager_id', 'start_date', 'end_date', 'notes', 'gstn', 'subcategory', 'assessment_year', 'scope_item',
            'billed_amount', 'out_of_pocket', 'amount_receipt'];
        const updates: string[] = [];
        const params: unknown[] = [];
        const changedFields: Array<{ field: string; old: unknown; new: unknown }> = [];

        for (const f of fields) {
            if (req.body[f] !== undefined && req.body[f] !== old.rows[0][f]) {
                changedFields.push({ field: f, old: old.rows[0][f], new: req.body[f] });
                params.push(req.body[f]);
                updates.push(`${f} = $${params.length}`);
            }
        }

        if (updates.length) {
            params.push(req.params.id);
            await pool.query(
                `UPDATE assignments SET ${updates.join(', ')}, updated_at=NOW() WHERE id=$${params.length}`,
                params
            );
            for (const ch of changedFields) {
                await pool.query(
                    'INSERT INTO change_history (entity_type,entity_id,field_name,old_value,new_value,changed_by,reason) VALUES ($1,$2,$3,$4,$5,$6,$7)',
                    ['assignment', req.params.id, ch.field, String(ch.old), String(ch.new), req.user!.id, req.body.reason || null]
                );
            }
            // Audit log
            await logAuditEvent(req.user!, 'update', 'assignment', req.params.id, { changedFields }, req);
        }

        const updated = await pool.query('SELECT * FROM assignments WHERE id=$1', [req.params.id]);
        res.json(updated.rows[0]);
    } catch (err: unknown) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// PATCH /api/assignments/:id/confirm
router.patch('/:id/confirm', async (req: Request, res: Response) => {
    try {
        const check = await pool.query('SELECT created_by, manager_id, partner_id FROM assignments WHERE id=$1', [req.params.id]);
        if (!check.rows.length) return res.status(404).json({ error: 'Not found' });

        // Visibility check
        const visibleIds = await getVisibleUserIds(req.user!);
        if (visibleIds !== null) {
            const isAuthorized = 
                visibleIds.includes(check.rows[0].created_by) || 
                visibleIds.includes(check.rows[0].manager_id) || 
                visibleIds.includes(check.rows[0].partner_id);
            
            if (!isAuthorized) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        await pool.query(
            'UPDATE assignments SET status=\'active\', updated_at=NOW() WHERE id=$1 AND status=\'draft\'',
            [req.params.id]
        );
        await pool.query(
            'INSERT INTO change_history (entity_type,entity_id,field_name,old_value,new_value,changed_by) VALUES ($1,$2,$3,$4,$5,$6)',
            ['assignment', req.params.id, 'status', 'draft', 'active', req.user!.id]
        );
        await logAuditEvent(req.user!, 'update', 'assignment', req.params.id, { action: 'confirm', status: 'active' }, req);
        res.json({ success: true });
    } catch (err: unknown) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/assignments/:id/allocations
router.put('/:id/allocations', async (req: Request, res: Response) => {
    try {
        const { allocations, fiscal_year } = req.body;
        const assignment = await pool.query('SELECT total_fees, created_by, manager_id, partner_id FROM assignments WHERE id=$1', [req.params.id]);
        if (!assignment.rows.length) return res.status(404).json({ error: 'Not found' });

        // Visibility check
        const visibleIds = await getVisibleUserIds(req.user!);
        if (visibleIds !== null) {
            const isAuthorized = 
                visibleIds.includes(assignment.rows[0].created_by) || 
                visibleIds.includes(assignment.rows[0].manager_id) || 
                visibleIds.includes(assignment.rows[0].partner_id);
            
            if (!isAuthorized) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const totalAllocated = allocations.reduce((sum: number, a: { amount: number }) => sum + Number(a.amount), 0);
        const totalFees = Number(assignment.rows[0].total_fees);

        if (Math.abs(totalAllocated - totalFees) > 1) {
            return res.status(400).json({
                error: `Allocation sum (${totalAllocated}) must equal total fees (${totalFees})`
            });
        }

        for (const alloc of allocations) {
            await pool.query(
                `UPDATE fee_allocations SET amount=$1, updated_at=NOW() 
         WHERE assignment_id=$2 AND month=$3 AND fiscal_year=$4`,
                [alloc.amount, req.params.id, alloc.month, fiscal_year || '2025-26']
            );
        }

        await pool.query(
            'INSERT INTO change_history (entity_type,entity_id,field_name,old_value,new_value,changed_by) VALUES ($1,$2,$3,$4,$5,$6)',
            ['fee_allocation', req.params.id, 'monthly_allocation', 'previous', JSON.stringify(allocations), req.user!.id]
        );
        await logAuditEvent(req.user!, 'update', 'fee_allocation', req.params.id, { allocations }, req);

        res.json({ success: true });
    } catch (err: unknown) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// PATCH /api/assignments/:id/vault — Upload working paper link
router.patch('/:id/vault', async (req: Request, res: Response) => {
    try {
        const { file_url } = req.body;
        if (!file_url) return res.status(400).json({ error: 'file_url is required' });

        // Visibility check
        const assignment = await pool.query('SELECT created_by, manager_id, partner_id FROM assignments WHERE id=$1', [req.params.id]);
        if (!assignment.rows.length) return res.status(404).json({ error: 'Not found' });

        const visibleIds = await getVisibleUserIds(req.user!);
        if (visibleIds !== null) {
            const isAuthorized = 
                visibleIds.includes(assignment.rows[0].created_by) || 
                visibleIds.includes(assignment.rows[0].manager_id) || 
                visibleIds.includes(assignment.rows[0].partner_id);
            
            if (!isAuthorized) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        try {
            await pool.query(
                'UPDATE assignments SET file_url=$1, updated_at=NOW() WHERE id=$2',
                [file_url, req.params.id]
            );
        } catch (dbErr: any) {
            if (dbErr.code === '42703' || dbErr.message.includes('file_url')) {
                return res.status(501).json({ error: 'The Document Vault storage is not yet enabled on this server instance (missing file_url column).' });
            }
            throw dbErr;
        }
        
        await logAuditEvent(req.user!, 'update', 'assignment', req.params.id, { action: 'vault_upload', file_url }, req);
        res.json({ success: true, file_url });
    } catch (err: any) {
        console.error('Vault upload failed:', err);
        res.status(500).json({ error: 'Failed to update vault', detail: err.message });
    }
});

export default router;
