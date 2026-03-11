import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
export const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
/**
 * Get the list of user IDs that the logged-in user is allowed to see data for.
 * - admin / partner → null (= no filter, see everything)
 * - director → [self, ...managers reporting to self]
 * - manager → [self]
 */
export const getVisibleUserIds = async (user) => {
    if (user.role === 'admin' || user.role === 'partner') {
        return null; // No filter — see all
    }
    if (user.role === 'director') {
        const result = await pool.query('SELECT id FROM profiles WHERE reports_to = $1 AND is_active = true', [user.id]);
        const subordinateIds = result.rows.map((r) => r.id);
        return [user.id, ...subordinateIds];
    }
    if (user.role === 'staff') {
        const result = await pool.query('SELECT reports_to FROM profiles WHERE id = $1', [user.id]);
        if (result.rows.length > 0 && result.rows[0].reports_to) {
            return [user.id, result.rows[0].reports_to];
        }
        return [user.id];
    }
    // Manager: only self
    return [user.id];
};
/**
 * Build a SQL WHERE clause fragment for filtering by visible user IDs.
 * Returns { clause: string, params: any[] } to inject into queries.
 *
 * Usage:
 *   const vis = await getVisibleUserFilter(user, 'a.manager_id', 'a.partner_id');
 *   query += vis.clause;
 *   params.push(...vis.params);
 */
export const getVisibleUserFilter = async (user, managerCol, partnerCol, paramOffset = 0) => {
    const ids = await getVisibleUserIds(user);
    if (ids === null) {
        return { clause: '', params: [] }; // No filter needed
    }
    const paramIdx = paramOffset + 1;
    return {
        clause: ` AND (${managerCol} = ANY($${paramIdx}) OR ${partnerCol} = ANY($${paramIdx}))`,
        params: [ids],
    };
};
/**
 * Middleware to auto-log mutating API requests to audit_logs.
 * Attach after authenticate middleware.
 */
export const auditLog = (action, entityType) => {
    return async (req, _res, next) => {
        // Log asynchronously — don't block the request
        if (req.user) {
            const entityId = req.params.id || req.body?.id || null;
            pool.query(`INSERT INTO audit_logs (user_id, user_email, user_role, action, entity_type, entity_id, details, ip_address, user_agent)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
                req.user.id,
                req.user.email,
                req.user.role,
                action,
                entityType,
                entityId,
                JSON.stringify({ method: req.method, path: req.path, body: req.body }),
                req.ip || req.headers['x-forwarded-for'] || 'unknown',
                req.headers['user-agent'] || 'unknown'
            ]).catch(err => console.error('Audit log error:', err));
        }
        next();
    };
};
/**
 * Helper to log a single audit event (for use inside route handlers).
 */
export const logAuditEvent = async (user, action, entityType, entityId, details = {}, req) => {
    try {
        await pool.query(`INSERT INTO audit_logs (user_id, user_email, user_role, action, entity_type, entity_id, details, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
            user.id,
            user.email,
            user.role,
            action,
            entityType,
            entityId,
            JSON.stringify(details),
            req?.ip || req?.headers['x-forwarded-for'] || 'unknown',
            req?.headers['user-agent'] || 'unknown'
        ]);
    }
    catch (err) {
        console.error('Audit log error:', err);
    }
};
