import validator from 'validator';
import { OrderType } from '../contracts/order';
import { UserRole } from '../contracts/user';

export function validEmail(email: string) {
    return validator.isEmail(email);
}

export function isEmpty(obj: string | {} | []) {
    if (typeof obj === 'string') {
        return validator.isEmpty(obj, { ignore_whitespace: true });
    } else if (Array.isArray(obj)) {
        return obj.length === 0;
    }

    return Object.keys(obj).length === 0;
}

export function validLength(
    str: string,
    options: { min: number; max: number } = { min: 8, max: 40 }
) {
    return validator.isLength(str, options);
}

export function isNumeric(numberStr: string) {
    return validator.isNumeric(numberStr);
}

export function strongPassword(password: string) {
    return validator.isStrongPassword(password);
}

export function validTelephone(telephone: string) {
    return validLength(telephone, { min: 10, max: 10 }) && isNumeric(telephone);
}

export function lettersOnly(str: string) {
    return validator.isAlpha(str);
}

export function validCustomerName(name: string) {
    return (
        !isEmpty(name) &&
        lettersOnly(name) &&
        validLength(name, { min: 1, max: 20 })
    );
}

export function validDate(date: string) {
    return validator.isDate(date, {
        format: 'YYYY-MM-DD',
        delimiters: ['-'],
        strictMode: true,
    });
}

export function isNonNegative(value: number) {
    return typeof value === 'number' && value >= 0;
}

export function isPositive(value: number) {
    return typeof value === 'number' && value > 0;
}

export function validOrderType(orderType: string) {
    return orderType === OrderType.RESTOCK || orderType === OrderType.SALE;
}

export function validUserRole(role: string) {
    return role === UserRole.ADMIN || role === UserRole.CUSTOMER;
}

export function isAlphaNumeric(name: string) {
    return validator.isAlphanumeric(name, undefined, { ignore: ' -' });
}

export function validGenericName(name: string) {
    return (
        !isEmpty(name) &&
        isAlphaNumeric(name) &&
        validLength(name, { min: 1, max: 20 })
    );
}
