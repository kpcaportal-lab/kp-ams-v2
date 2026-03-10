import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

export interface AuthUser {
    id: string;
    email: string;
    role: string;
    full_name: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
