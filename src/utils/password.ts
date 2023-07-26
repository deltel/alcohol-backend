import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export function comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
}
