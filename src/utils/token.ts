import { JwtPayload, sign, verify } from 'jsonwebtoken';

export function signToken(payload: JwtPayload) {
    return sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' });
}

export function verifyToken(token: string) {
    return verify(token, process.env.JWT_SECRET!);
}

export function extractToken(authorizationValue: string) {
    return authorizationValue.split(' ')[1];
}
