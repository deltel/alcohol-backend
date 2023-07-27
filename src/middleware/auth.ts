import { JwtPayload } from 'jsonwebtoken';
import { extractToken, verifyToken } from '../utils/token';
import { UserRole } from '../contracts/user';

export function auth(req: any, res: any, next: any) {
    try {
        const payload = verifyToken(
            extractToken(req.headers.authorization)
        ) as JwtPayload;
        req.body.role = payload.role;
        next();
    } catch (e) {
        console.error('Invalid token', e);
        res.status(401).send({ error: 'Invalid token' });
    }
}

export function isAdmin(req: any, res: any, next: any) {
    if (req.body.role === UserRole.ADMIN) {
        next();
    } else {
        res.status(403).send({ error: 'Invalid role for this operation' });
    }
}
