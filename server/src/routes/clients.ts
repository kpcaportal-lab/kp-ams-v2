import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/clients
router.get('/', async (req: Request, res: Response) => {
    try {
        const { search, status } = req.query;
        let query = `
            SELECT c.*, p.full_name as added_by_name,
                   cs.contact_name as "spocName", cs.email as "spocEmail", cs.phone as "spocPhone"
            FROM clients c 
            LEFT JOIN profiles p ON p.id = c.added_by 
            LEFT JOIN client_spocs cs ON cs.client_id = c.id AND cs.is_primary = true
            WHERE 1=1`;
        const params: unknown[] = [];
        
        const visibleIds = await getVisibleUserIds(req.user!);
        if (visibleIds !== null) {
            params.push(visibleIds);
            // Managers see clients they added or clients linked to their assignments/proposals
            query += ` AND (c.added_by = ANY($${params.length}) OR EXISTS (
                SELECT 1 FROM assignments a WHERE a.client_id = c.id AND (a.manager_id = ANY($${params.length}) OR a.partner_id = ANY($${params.length}))
            ) OR EXISTS (
                SELECT 1 FROM proposals p WHERE p.client_id = c.id AND (p.responsible_partner = ANY($${params.length}) OR p.prepared_by = ANY($${params.length}))
            ))`;
        }
        if (search) { params.push(`%${search}%`); query += ` AND c.name ILIKE $${params.length}`; }
        if (status) { params.push(status); query += ` AND c.status = $${params.length}`; }
        query += ' ORDER BY c.created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err: unknown) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/clients/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const client = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
        if (!client.rows.length) return res.status(404).json({ error: 'Not found' });
        const spocs = await pool.query('SELECT * FROM client_spocs WHERE client_id = $1 ORDER BY is_primary DESC, created_at ASC', [req.params.id]);
        const proposals = await pool.query(
            `SELECT p.*, pr.full_name as prepared_by_name, pa.full_name as partner_name 
       FROM proposals p 
       LEFT JOIN profiles pr ON pr.id = p.prepared_by 
       LEFT JOIN profiles pa ON pa.id = p.responsible_partner 
       WHERE p.client_id = $1 ORDER BY p.created_at DESC`, [req.params.id]);
        res.json({ ...client.rows[0], spocs: spocs.rows, proposals: proposals.rows });
    } catch (err: unknown) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// POST /api/clients
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, gstn, notes, industry, address, billing_details, spocName, spocEmail, spocPhone } = req.body;
        if (!name) return res.status(400).json({ error: 'Client name required' });
        const result = await pool.query(
            'INSERT INTO clients (name, gstn, notes, industry, address, billing_details, added_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
            [name, gstn || null, notes || null, industry || null, address || null, billing_details || null, req.user!.id]
        );
        const newClient = result.rows[0];

        // Create SPOC entry if SPOC data was provided
        if (spocName || spocEmail || spocPhone) {
            await pool.query(
                'INSERT INTO client_spocs (client_id, contact_name, email, phone, is_primary) VALUES ($1,$2,$3,$4,true)',
                [newClient.id, spocName || null, spocEmail || null, spocPhone || null]
            );
        }

        res.status(201).json(newClient);
    } catch (err: unknown) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/clients/:id
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { name, gstn, notes, industry, address, billing_details, status, spocName, spocEmail, spocPhone } = req.body;
        
        // Start transaction for atomic update
        await pool.query('BEGIN');

        const result = await pool.query(
            'UPDATE clients SET name=COALESCE($1,name), gstn=COALESCE($2,gstn), notes=COALESCE($3,notes), industry=COALESCE($4,industry), address=COALESCE($5,address), billing_details=COALESCE($6,billing_details), status=COALESCE($7,status), updated_at=NOW() WHERE id=$8 RETURNING *',
            [name, gstn, notes, industry, address, billing_details, status, req.params.id]
        );

        // Update primary SPOC if data provided
        if (spocName || spocEmail || spocPhone) {
            // Check if primary SPOC exists
            const spocCheck = await pool.query('SELECT id FROM client_spocs WHERE client_id=$1 AND is_primary=true', [req.params.id]);
            
            if (spocCheck.rows.length) {
                await pool.query(
                    'UPDATE client_spocs SET contact_name=COALESCE($1,contact_name), email=COALESCE($2,email), phone=COALESCE($3,phone), updated_at=NOW() WHERE id=$4',
                    [spocName, spocEmail, spocPhone, spocCheck.rows[0].id]
                );
            } else {
                await pool.query(
                    'INSERT INTO client_spocs (client_id, contact_name, email, phone, is_primary) VALUES ($1,$2,$3,$4,true)',
                    [req.params.id, spocName || null, spocEmail || null, spocPhone || null]
                );
            }
        }

        await pool.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err: unknown) { 
        await pool.query('ROLLBACK');
        console.error(err); 
        res.status(500).json({ error: 'Server error' }); 
    }
});

// POST /api/clients/:id/spocs
router.post('/:id/spocs', async (req: Request, res: Response) => {
    try {
        const { contact_name, email, phone, designation, is_primary } = req.body;
        if (is_primary) {
            await pool.query('UPDATE client_spocs SET is_primary=false WHERE client_id=$1', [req.params.id]);
        }
        const result = await pool.query(
            'INSERT INTO client_spocs (client_id,contact_name,email,phone,designation,is_primary) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
            [req.params.id, contact_name, email, phone, designation || null, is_primary || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: unknown) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/clients/:id/spocs/:spocId
router.put('/:id/spocs/:spocId', async (req: Request, res: Response) => {
    try {
        const { contact_name, email, phone, designation, is_active, is_primary } = req.body;
        if (is_primary) {
            await pool.query('UPDATE client_spocs SET is_primary=false WHERE client_id=$1', [req.params.id]);
        }
        const result = await pool.query(
            'UPDATE client_spocs SET contact_name=COALESCE($1,contact_name), email=COALESCE($2,email), phone=COALESCE($3,phone), designation=COALESCE($4,designation), is_active=COALESCE($5,is_active), is_primary=COALESCE($6,is_primary), updated_at=NOW() WHERE id=$7 AND client_id=$8 RETURNING *',
            [contact_name, email, phone, designation, is_active, is_primary, req.params.spocId, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err: unknown) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

export default router;
