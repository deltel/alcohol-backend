import { JwtPayload, sign } from 'jsonwebtoken';

export function signToken(payload: JwtPayload) {
    return sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' });
}
