import { extractToken, verifyToken } from '../utils/token';

export function auth(req: any, res: any, next: any) {
    try {
        verifyToken(extractToken(req.headers.authorization));
        next();
    } catch (e) {
        console.error('Invalid token', e);
        res.status(401).send({ error: 'Invalid token' });
    }
}
