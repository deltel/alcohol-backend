import { Messages } from '../constants/errors';
import { AdminOrder, CustomerOrderRequest } from '../contracts/order';
import { ProductRequest } from '../contracts/product';
import { Login, Registration, UserRequest } from '../contracts/user';
import InternalServerError from '../errors/InternalServerError';
import {
    isAlphaNumeric,
    isEmpty,
    isNonNegative,
    isPositive,
    strongPassword,
    validDate,
    validEmail,
    validCustomerName,
    validOrderType,
    validTelephone,
    validGenericName,
    validUserRole,
} from './validators';

export function validateRegistration(requestBody: Registration) {
    const errors: any = {};
    if (!validCustomerName(requestBody.firstName)) {
        errors.firstName = Messages.NAME;
    }
    if (!validCustomerName(requestBody.lastName)) {
        errors.lastName = Messages.NAME;
    }
    if (!validEmail(requestBody.email)) {
        errors.email = Messages.EMAIL;
    }
    if (!validTelephone(requestBody.telephone)) {
        errors.telephone = Messages.TELEPHONE;
    }
    if (!strongPassword(requestBody.password)) {
        errors.password = Messages.PASSWORD;
    }

    if (!isEmpty(errors))
        throw new InternalServerError(
            'Invalid request body',
            errors,
            undefined,
            400
        );
}

export function validateUser(requestBody: UserRequest) {
    const errors: any = {};
    if (!validCustomerName(requestBody.firstName)) {
        errors.firstName = Messages.NAME;
    }
    if (!validCustomerName(requestBody.lastName)) {
        errors.lastName = Messages.NAME;
    }
    if (!validUserRole(requestBody.role)) {
        errors.lastName = Messages.ROLE;
    }
    if (!validEmail(requestBody.email)) {
        errors.email = Messages.EMAIL;
    }
    if (!validTelephone(requestBody.telephone)) {
        errors.telephone = Messages.TELEPHONE;
    }
    if (!strongPassword(requestBody.password)) {
        errors.password = Messages.PASSWORD;
    }

    if (!isEmpty(errors))
        throw new InternalServerError(
            'Invalid request body',
            errors,
            undefined,
            400
        );
}

export function validateLogin(requestBody: Login) {
    const errors: any = {};
    if (isEmpty(requestBody.email) || !validEmail(requestBody.email)) {
        errors.email = Messages.LOGIN;
    } else if (isEmpty(requestBody.password)) {
        errors.password = Messages.LOGIN;
    }

    if (!isEmpty(errors))
        throw new InternalServerError(
            'Invalid request body',
            errors,
            undefined,
            400
        );
}

export function validateCustomerOrder(requestBody: {
    orders: CustomerOrderRequest[];
}) {
    const errors: any = {};

    if (isEmpty(requestBody) || isEmpty(requestBody.orders))
        throw new InternalServerError(
            'Invalid request body',
            { properties: 'Empty request body' },
            undefined,
            400
        );

    for (const order of requestBody.orders) {
        if (Object.keys(order).length !== 4 || isEmpty(order.productId)) {
            errors.properties = 'Incorrect details provided for order(s)';
        }
        if (!validDate(order.dateOrdered)) {
            errors.dateOrdered =
                'Incorrect format provided for date. Format should be YYYY-MM-DD';
        }
        if (!isNonNegative(order.revenue)) {
            errors.revenue = 'Revenue must be non-negative';
        }
        if (!isPositive(order.quantity)) {
            errors.quantity = 'Quantity must be positive';
        }

        if (!isEmpty(errors))
            throw new InternalServerError(
                'Invalid request body',
                errors,
                undefined,
                400
            );
    }
}

export function validateAdminOrder(requestBody: { orders: AdminOrder[] }) {
    const errors: any = {};

    if (isEmpty(requestBody) || isEmpty(requestBody.orders))
        throw new InternalServerError(
            'Invalid request body',
            { properties: 'Empty request body' },
            undefined,
            400
        );

    for (const order of requestBody.orders) {
        if (
            Object.keys(order).length !== 11 ||
            isEmpty(order.productId) ||
            isEmpty(order.userId)
        ) {
            errors.properties = 'Incorrect details provided for order(s)';
        }
        if (!validDate(order.dateOrdered)) {
            errors.dateOrdered =
                'Incorrect format provided for date. Format should be YYYY-MM-DD';
        }
        if (order.datePaid && !validDate(order.datePaid)) {
            errors.datePaid =
                'Incorrect format provided for date. Format should be YYYY-MM-DD';
        }
        if (!validOrderType(order.orderType)) {
            errors.orderType = 'Invalid order type';
        }
        if (!validGenericName(order.purchaseLocation)) {
            errors.purchaseLocation = Messages.BUSSINESS_NAME;
        }
        if (!isPositive(order.quantity)) {
            errors.quantity = 'Quantity must be positive';
        }
        if (!isNonNegative(order.revenue)) {
            errors.revenue = 'Revenue must be non-negative';
        }
        if (!isNonNegative(order.profit)) {
            errors.profit = 'Profit must be non-negative';
        }
        if (!isNonNegative(order.cost)) {
            errors.cost = 'Cost must be non-negative';
        }
        if (!isNonNegative(order.value)) {
            errors.value = 'Value must be non-negative';
        }

        if (!isEmpty(errors))
            throw new InternalServerError(
                'Invalid request body',
                errors,
                undefined,
                400
            );
    }
}

export function validateProduct(requestBody: ProductRequest) {
    const errors: any = {};
    if (!validGenericName(requestBody.productName)) {
        errors.productName = Messages.ALPHANUMERIC;
    } else if (!validGenericName(requestBody.volume)) {
        errors.volume = Messages.ALPHANUMERIC;
    } else if (!isNonNegative(requestBody.unitCost)) {
        errors.unitCost = Messages.NONNEGATIVE;
    } else if (!isNonNegative(requestBody.stockLevel)) {
        errors.stockLevel = Messages.NONNEGATIVE;
    } else if (!isNonNegative(requestBody.sellingPrice)) {
        errors.sellingPrice = Messages.NONNEGATIVE;
    } else if (!isNonNegative(requestBody.wholesalePrice)) {
        errors.wholesalePrice = Messages.NONNEGATIVE;
    } else if (!isNonNegative(requestBody.totalCost)) {
        errors.totalCost = Messages.NONNEGATIVE;
    } else if (!isNonNegative(requestBody.totalOrders)) {
        errors.totalOrders = Messages.NONNEGATIVE;
    } else if (!isNonNegative(requestBody.totalValue)) {
        errors.totalValue = Messages.NONNEGATIVE;
    } else if (!isNonNegative(requestBody.totalRevenue)) {
        errors.totalRevenue = Messages.NONNEGATIVE;
    } else if (!isNonNegative(requestBody.totalProfit)) {
        errors.totalProfit = Messages.NONNEGATIVE;
    }

    if (!isEmpty(errors))
        throw new InternalServerError(
            'Invalid request body',
            errors,
            undefined,
            400
        );
}
