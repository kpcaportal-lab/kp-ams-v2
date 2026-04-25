import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * General API rate limiter: 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req: Request) => {
        // Skip rate limiting for health check
        return req.path === '/health';
    }
});

/**
 * Strict authentication limiter: 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // increased from 5 to 20 for stability
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Create/Update limiter: 50 requests per 15 minutes per IP
 */
export const createLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: 'Too many create/update requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
