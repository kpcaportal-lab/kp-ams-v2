import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// PATCH /api/profile
router.patch('/', async (req: Request, res: Response) => {
    try {
        const { display_name, phone_number, notification_preferences } = req.body;
        
        let updateFields = [];
        let params: unknown[] = [];
        let counter = 1;

        if (display_name !== undefined) {
            updateFields.push(`display_name = $${counter++}`);
            params.push(display_name);
        }
        if (phone_number !== undefined) {
            updateFields.push(`phone_number = $${counter++}`);
            params.push(phone_number);
        }
        // If we add notification_preferences to profiles table later, handle it here.
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(req.user!.id);

        const query = `
            UPDATE profiles 
            SET ${updateFields.join(', ')} 
            WHERE id = $${counter} 
            RETURNING id, full_name, display_name, email, role, phone_number, work_file_url;
        `;

        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err: unknown) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
