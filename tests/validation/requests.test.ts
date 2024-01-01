import { OrderType } from '../../src/contracts/order';
import InternalServerError from '../../src/errors/InternalServerError';
import {
    validateAdminOrder,
    validateCustomerOrder,
    validateLogin,
    validateProduct,
    validateRegistration,
} from '../../src/validation/requests';

describe('requests', () => {
    describe('registration', () => {
        test('is invalid', () => {
            function isValid() {
                validateRegistration({
                    firstName: '',
                    lastName: '',
                    email: 'janedoe@anon',
                    telephone: '87611123a45',
                    password: 'amongu',
                });
            }

            expect(isValid).toThrow(InternalServerError);
        });
    });

    describe('login', () => {
        test('is invalid', () => {
            function isValid() {
                validateLogin({
                    email: 'janedoe',
                    password: '',
                });
            }

            expect(isValid).toThrow(InternalServerError);
        });
    });

    describe('custom order', () => {
        test('is invalid', () => {
            function isValid() {
                validateCustomerOrder({
                    orders: [],
                });
            }

            function isValid1() {
                validateCustomerOrder({
                    orders: [
                        {
                            dateOrdered: '2020/01/01',
                            productId: '1',
                            userId: '1',
                            quantity: 1,
                            revenue: 2000,
                        },
                    ],
                });
            }

            function isValid2() {
                validateCustomerOrder({
                    orders: [
                        {
                            dateOrdered: '2020/01/01',
                            productId: '1',
                            userId: '1',
                            quantity: 0,
                            revenue: -0.1,
                        },
                    ],
                });
            }

            expect(isValid).toThrow(InternalServerError);
            expect(isValid1).toThrow(InternalServerError);
            expect(isValid2).toThrow(InternalServerError);
        });
    });

    describe('admin order', () => {
        test('is invalid', () => {
            function isValid() {
                validateAdminOrder({
                    orders: [],
                });
            }

            function isValid1() {
                validateAdminOrder({
                    orders: [
                        {
                            dateOrdered: '2020/01/01',
                            productId: '',
                            userId: '',
                            quantity: 0,
                            revenue: -2000,
                            cost: -1,
                            datePaid: '',
                            orderType: OrderType.SALE,
                            profit: -1,
                            purchaseLocation: '',
                            value: -0.1,
                        },
                    ],
                });
            }

            expect(isValid).toThrow(InternalServerError);
            expect(isValid1).toThrow(InternalServerError);
        });
    });

    describe('product', () => {
        test('is invalid', () => {
            function isValid() {
                validateProduct({
                    productName: '',
                    sellingPrice: -1,
                    stockLevel: -1,
                    totalCost: -1,
                    totalOrders: -1,
                    totalProfit: -1,
                    totalRevenue: -1,
                    totalValue: -1,
                    unitCost: -1,
                    volume: '',
                    wholesalePrice: -1,
                });
            }

            expect(isValid).toThrow(InternalServerError);
        });
    });
});
