import jwt from 'jsonwebtoken';
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
