import { JwtPayload, sign, verify } from 'jsonwebtoken';

export function signToken(payload: JwtPayload) {
    return sign(payload, process.env.JWT_SECRET!, { expiresIn: '2h' });
}

export function verifyToken(token: string) {
    return verify(token, process.env.JWT_SECRET!);
}
