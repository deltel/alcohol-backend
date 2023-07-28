import { JwtPayload } from 'jsonwebtoken';
import { extractToken, verifyToken } from '../utils/token';
import { UserRole } from '../contracts/user';

export function auth(req: any, res: any, next: any) {
    try {
        verifyToken(extractToken(req.headers.authorization));
        next();
    } catch (e) {
        console.error('Invalid token', e);
        res.status(401).send({ error: 'Invalid token' });
    }
}

export function isAdmin(req: any, res: any, next: any) {
    const payload = verifyToken(
        extractToken(req.headers.authorization)
    ) as JwtPayload;

    if (payload.role === UserRole.ADMIN) {
        next();
    } else {
        res.status(403).send({ error: 'Invalid role for this operation' });
    }
}

export function getUserId(req: any, _: any, next: any) {
    const payload = verifyToken(
        extractToken(req.headers.authorization)
    ) as JwtPayload;
    req.body.userId = payload.sub;
    next();
}
