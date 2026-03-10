import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/clients
router.get('/', async (req: Request, res: Response) => {
    try {
        const { search, status } = req.query;
        let query = 'SELECT c.*, p.full_name as added_by_name FROM clients c LEFT JOIN profiles p ON p.id = c.added_by WHERE 1=1';
        const params: any[] = [];
        if (search) { params.push(`%${search}%`); query += ` AND c.name ILIKE $${params.length}`; }
        if (status) { params.push(status); query += ` AND c.status = $${params.length}`; }
        query += ' ORDER BY c.created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
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
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// POST /api/clients
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, gstn, notes } = req.body;
        if (!name) return res.status(400).json({ error: 'Client name required' });
        const result = await pool.query(
            'INSERT INTO clients (name, gstn, notes, added_by) VALUES ($1,$2,$3,$4) RETURNING *',
            [name, gstn || null, notes || null, req.user!.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/clients/:id
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { name, gstn, notes, status } = req.body;
        const result = await pool.query(
            'UPDATE clients SET name=COALESCE($1,name), gstn=COALESCE($2,gstn), notes=COALESCE($3,notes), status=COALESCE($4,status), updated_at=NOW() WHERE id=$5 RETURNING *',
            [name, gstn, notes, status, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
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
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
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
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

export default router;
