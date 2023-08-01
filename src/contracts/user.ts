export enum UserRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
}

export interface User {
    userId: string;
    role: UserRole;
    fullName: string;
    email: string;
    telephone: string;
    balance: number;
    dueDate: string;
    totalOrders: number;
    totalRevenue: number;
}

export type UserPreview = Pick<User, 'userId' | 'fullName' | 'balance'>;

export interface Registration {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    password: string;
}

export type UserRequest = Registration & { role: UserRole };

export type Login = Pick<Registration, 'email' | 'password'>;
