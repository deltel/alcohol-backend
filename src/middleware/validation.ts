import {
    validateAdminOrder,
    validateCustomerOrder,
    validateLogin,
    validateProduct,
    validateRegistration,
    validateUser,
} from '../validation/requests';

export function validation(req: any, _: any, next: any) {
    if (req.path === '/v1/register') {
        validateRegistration(req.body);
    } else if (req.path === '/v1/login') {
        validateLogin(req.body);
    } else if (req.path === '/v1/orders/new') {
        validateCustomerOrder(req.body);
    } else if (req.path === '/v1/users/admin/orders/new') {
        validateAdminOrder(req.body);
    } else if (req.path === '/v1/users/admin/products/new') {
        validateProduct(req.body);
    } else if (req.path === '/v1/users/new') {
        validateUser(req.body);
    }

    next();
}
