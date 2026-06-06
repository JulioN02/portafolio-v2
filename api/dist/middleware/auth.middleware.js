import jwt from 'jsonwebtoken';
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
    }
    next();
};
//# sourceMappingURL=auth.middleware.js.map