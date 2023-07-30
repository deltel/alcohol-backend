import express from 'express';

import { User, UserPreview } from '../contracts/user';
import { FavouriteProduct } from '../contracts/product';
import { CustomerOrder } from '../contracts/order';

import { executePreparedStatement, queryWithValues } from '../db/queries';
import { auth, isAdmin } from '../middleware/auth';
import { hashPassword } from '../utils/password';
import { Intervals } from '../constants/pagination';

import orderRouter from './orders/admin';
import productRouter from './products/admin';

const router = express.Router();

router.use(auth);
router.use('/admin/orders', orderRouter);
router.use('/admin/products', productRouter);

router.get('/', isAdmin, async (req, res, next) => {
    const { pageSize = Intervals[10], pageOffset = Intervals[0] } = req.query;
    try {
        const [results] = await executePreparedStatement(
            "SELECT user_id, CONCAT(first_name, ' ', last_name) AS full_name, last_name, balance FROM `users` ORDER BY user_id LIMIT ? OFFSET ?",
            [pageSize, pageOffset]
        );

        const users: UserPreview[] = results.map((user) => ({
            userId: user.user_id,
            fullName: user.full_name,
            balance: parseFloat(user.balance),
        }));

        console.log('Retrieved users');

        res.send({ users });
    } catch (e: any) {
        e.customMessage = 'Failed to retrieve users';
        next(e);
    }
});

router.get('/:userId', async (req, res, next) => {
    try {
        const [results] = await executePreparedStatement(
            "SELECT user_id, role, CONCAT(first_name, ' ', last_name) AS full_name, email, telephone, balance_due_date, balance, (SELECT COUNT(order_id) FROM `orders` WHERE orders.user_id = ?) AS total_orders, (SELECT SUM(revenue) FROM `orders` WHERE orders.user_id = ?) AS total_revenue FROM `users` WHERE user_id = ?",
            [req.params.userId, req.params.userId, req.params.userId]
        );

        const customer: User = {
            userId: results[0].user_id,
            role: results[0].role,
            fullName: results[0].full_name,
            email: results[0].email,
            telephone: results[0].telephone,
            balance: parseFloat(results[0].balance),
            dueDate: results[0].balance_due_date,
            totalOrders: results[0].total_orders,
            totalRevenue: parseFloat(results[0].total_revenue ?? '0'),
        };

        console.log('Retrieved customer');

        res.send({ customer });
    } catch (e: any) {
        e.customMessage = 'Failed to retrieve customer';
        next(e);
    }
});

router.get('/:userId/favourites', async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const [results] = await executePreparedStatement(
            'SELECT products.product_name AS product_name, SUM(orders.revenue) AS revenue, SUM(orders.quantity) AS quantity FROM products INNER JOIN orders ON orders.product_id = products.product_id WHERE orders.user_id = ? GROUP BY products.product_name ORDER BY quantity DESC LIMIT 3',
            [userId]
        );

        const favourites: FavouriteProduct[] = results.map((product) => ({
            productName: product.product_name,
            totalRevenue: parseFloat(product.revenue),
        }));

        console.log(`Retrieved favourites for customer id ${userId}`);

        res.send({ favourites });
    } catch (e: any) {
        e.customMessage = 'Failed to retrieve favourites';
        next(e);
    }
});

router.get('/:userId/orders', async (req, res, next) => {
    const { pageSize = Intervals[10], pageOffset = Intervals[0] } = req.query;
    try {
        const userId = req.params.userId;
        const [results] = await executePreparedStatement(
            'SELECT orders.product_id, date_ordered, date_paid, product_name, quantity, revenue, profit FROM orders INNER JOIN products ON orders.product_id = products.product_id WHERE orders.user_id = ? ORDER BY date_ordered LIMIT ? OFFSET ?',
            [userId, pageSize, pageOffset]
        );

        const orders: CustomerOrder[] = results.map((order) => ({
            productId: order.product_id,
            dateOrdered: order.date_ordered,
            datePaid: order.date_paid,
            productName: order.product_name,
            quantity: order.quantity,
            revenue: parseFloat(order.revenue),
            profit: parseFloat(order.profit),
        }));

        console.log(`Retrieved orders for customer id ${userId}`);

        res.send({ orders });
    } catch (e: any) {
        e.customMessage = 'Failed to retrieve orders';
        next(e);
    }
});

router.post('/new', isAdmin, async (req, res, next) => {
    const { firstName, lastName, email, role, telephone, password } = req.body;

    try {
        const hashedPassword = await hashPassword(password);

        const insertValues: (string | number)[][] = [
            [firstName, lastName, email, role, telephone, hashedPassword],
        ];

        await queryWithValues(
            'INSERT INTO `users` (first_name, last_name, email, role, telephone, password) VALUES ?',
            [insertValues]
        );

        console.log('Added new user');

        res.send({ message: 'Successfully created user' });
    } catch (e: any) {
        e.customMessage = 'Failed to create user';
        next(e);
    }
});

export default router;
