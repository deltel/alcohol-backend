import { JwtPayload } from 'jsonwebtoken';
import { verifyToken } from '../utils/token';
import { UserRole } from '../contracts/user';
import InternalServerError from '../errors/InternalServerError';

export function auth({ cookies, headers }: any, res: any, next: any) {
    try {
        const payload = verifyToken(cookies.jwt) as JwtPayload;
        const xCsrfToken = headers['x-csrf-token'];

        if (payload.csrfToken !== xCsrfToken) {
            next(new InternalServerError('Invalid session'));
            return;
        }

        next();
    } catch (e) {
        console.error('Invalid token', e);
        res.status(401).send({ error: 'Invalid token' });
    }
}

export function isAdmin({ cookies }: any, res: any, next: any) {
    const payload = verifyToken(cookies.jwt) as JwtPayload;

    if (payload.role === UserRole.ADMIN) {
        next();
    } else {
        res.status(403).send({ error: 'Invalid role for this operation' });
    }
}

export function getUserId({ cookies, body }: any, _: any, next: any) {
    const payload = verifyToken(cookies.jwt) as JwtPayload;
    body.userId = payload.sub;
    next();
}
