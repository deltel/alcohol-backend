import express from 'express';

import {
    Order,
    OrderDetails,
    OrderSummary,
    OrderType,
} from '../../contracts/order';
import { queryWithValues, executePreparedStatement } from '../../db/queries';
import pool from '../../db/pool';

import { getUserId, isAdmin } from '../../middleware/auth';
import { Intervals } from '../../constants/pagination';
import InternalServerError from '../../errors/InternalServerError';

const router = express.Router();
router.use(isAdmin);

router.post('', getUserId, async (req, res, next) => {
    const userId = req.body.userId;
    const connection = await pool.getConnection();

    try {
        console.log('Starting order transaction');
        await connection.beginTransaction();
        console.log('Successfully started order transaction');

        const insertValues: (string | number)[][] = req.body.orders.map(
            (order: Order) => [
                order.productId,
                userId,
                order.dateOrdered,
                order.purchaseLocation,
                order.datePaid,
                OrderType.RESTOCK,
                order.quantity,
                order.cost,
                order.revenue,
                order.profit,
            ]
        );

        await queryWithValues(
            `
                INSERT INTO orders 
                    (product_id, user_id, date_ordered, purchase_location, date_paid, order_type, quantity, cost, revenue, profit) 
                VALUES ?
            `,
            [insertValues],
            connection
        );
        console.log('Successfully added orders');

        const updateValues = req.body.orders.map((order: Order) => [
            order.quantity,
            order.cost,
            order.value,
            order.productId,
        ]);

        await Promise.all(
            updateValues.map((order: (string | number)[]) =>
                queryWithValues(
                    `
                        UPDATE products 
                        SET stock_level = stock_level + ?, total_cost = total_cost + ?, total_value = total_value + ? 
                        WHERE product_id = ?
                    `,
                    [...order],
                    connection
                )
            )
        );
        console.log('Successfully updated all products');

        await connection.commit();
        console.log('Transaction successful');

        res.status(201).send({ message: 'created new order' });
    } catch (e: any) {
        console.log(
            'Failed to complete order transaction ... rolling back changes'
        );

        await connection.rollback();
        console.log('Changes rolled back');

        next(new InternalServerError('Failed to register order', e));
    }
});

router.get('', async (req, res, next) => {
    let { pageSize, pageOffset, paymentStatus } = req.query;
    pageSize = Intervals[pageSize as string] ?? Intervals['10'];
    pageOffset = Intervals[pageOffset as string] ?? Intervals['0'];

    try {
        const query =
            paymentStatus === 'unpaid'
                ? `
            SELECT order_id, user_id, order_type, revenue, date_paid, amount_paid 
            FROM orders 
            WHERE order_type = 'sale' AND (date_paid IS NULL OR amount_paid <> revenue) 
            ORDER BY order_id 
            LIMIT ? 
            OFFSET ?
        `
                : `
            SELECT order_id, user_id, order_type, revenue, date_paid, amount_paid 
            FROM orders 
            ORDER BY order_id 
            LIMIT ? 
            OFFSET ?
        `;
        const [results] = await executePreparedStatement(query, [
            pageSize,
            pageOffset,
        ]);

        const orders: OrderSummary[] = results.map((order) => ({
            orderId: order.order_id,
            userId: order.user_id,
            revenue: order.revenue,
            datePaid: order.date_paid,
            amountPaid: order.amount_paid,
            orderType: order.order_type,
        }));

        res.send({ orders });
    } catch (e: any) {
        next(new InternalServerError('Failed to retrieve orders', e));
    }
});

router.post('/:orderId', isAdmin, async (req, res, next) => {
    const connection = await pool.getConnection();

    try {
        const orderId = req.params.orderId;
        const paymentAmount = req.body.amount;

        const orderData = {
            revenue: null,
            userId: null,
            productId: null,
            profit: null,
        };

        console.log('Starting payment transaction');
        await connection.beginTransaction();
        console.log('Successfully started payment transaction');

        let [results] = await executePreparedStatement(
            'SELECT revenue, user_id, product_id FROM `orders` WHERE order_id = ?',
            [orderId],
            connection
        );

        orderData.revenue = results[0].revenue;
        orderData.userId = results[0].user_id;
        orderData.productId = results[0].product_id;

        console.log('Successfully retrieved order data');

        await executePreparedStatement(
            'UPDATE orders SET date_paid = CURDATE(), amount_paid = amount_paid + ? WHERE order_id = ?',
            [paymentAmount, orderId],
            connection
        );
        console.log('Successfully updated order payment information');

        await executePreparedStatement(
            'UPDATE `users` SET balance = balance - ? WHERE user_id = ?',
            [paymentAmount, orderData.userId],
            connection
        );
        console.log('Successfully updated customer balance');

        await connection.commit();
        console.log('Transaction successful');

        res.send({ message: 'payment made' });
    } catch (e: any) {
        console.log(
            'Failed to complete payment transaction ... rolling back changes'
        );

        await connection.rollback();
        console.log('Changes rolled back');

        next(new InternalServerError('Failed to register payment', e));
    }
});

router.get('/:orderId', async (req, res, next) => {
    try {
        const [results] = await executePreparedStatement(
            `
                SELECT product_name, CONCAT(first_name, " ", last_name) AS customer_name, date_ordered, purchase_location, date_paid, order_type, quantity, cost, revenue, profit, amount_paid 
                FROM orders 
                INNER JOIN products 
                ON orders.product_id = products.product_id 
                INNER JOIN users 
                ON orders.user_id = users.user_id 
                WHERE order_id = ?
            `,
            [req.params.orderId]
        );

        const order: OrderDetails = {
            productName: results[0].product_name,
            dateOrdered: results[0].date_ordered,
            datePaid: results[0].date_paid,
            amountPaid: results[0].amount_paid,
            orderType: results[0].order_type,
            profit: results[0].profit,
            purchaseLocation: results[0].purchase_location,
            quantity: results[0].quantity,
            revenue: results[0].revenue,
            customerName: results[0].customer_name,
        };

        console.log('Retrieved order details');

        res.send({ order });
    } catch (e: any) {
        next(new InternalServerError('Failed to retrieve order', e));
    }
});

export default router;
