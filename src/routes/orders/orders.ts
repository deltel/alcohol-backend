import express from 'express';

import {
    CustomerOrderRequest,
    DateOrder,
    Order,
    OrderType,
} from '../../contracts/order';
import { queryWithValues, executePreparedStatement } from '../../db/queries';
import pool from '../../db/pool';

import { auth, getUserId } from '../../middleware/auth';
import InternalServerError from '../../errors/InternalServerError';

const router = express.Router();
router.use(auth);

router.get('', async (req, res, next) => {
    try {
        const date = req.query.date as string;
        const [results] = await executePreparedStatement(
            "SELECT CONCAT(first_name, ' ', last_name) AS full_name, GROUP_CONCAT(CONCAT(product_name, ': ', quantity)) AS details, SUM(revenue) AS revenue FROM orders INNER JOIN products ON orders.product_id = products.product_id INNER JOIN `users` ON orders.user_id = users.user_id WHERE orders.date_ordered = ? AND orders.order_type = 'sale' GROUP BY full_name",
            [date]
        );

        const orders: DateOrder[] = results.map((order) => ({
            customerName: order.customer_name,
            details: order.details,
            revenue: parseFloat(order.revenue),
        }));

        console.log(`Retrieved all orders for date ${date}`);

        res.send({ orders });
    } catch (e: any) {
        next(
            new InternalServerError('Failed to retrieve orders', undefined, e)
        );
    }
});

router.post('/new', getUserId, async (req, res, next) => {
    const connection = await pool.getConnection();

    try {
        console.log('Starting order transaction');
        await connection.beginTransaction();
        console.log('Successfully started order transaction');

        const insertValues: (string | number)[][] = req.body.orders.map(
            (order: CustomerOrderRequest) => [
                order.productId,
                req.body.userId,
                order.dateOrdered,
                'in store',
                OrderType.SALE,
                order.quantity,
                order.revenue,
            ]
        );

        await queryWithValues(
            'INSERT INTO orders (product_id, user_id, date_ordered, purchase_location, order_type, quantity, revenue) VALUES ?',
            [insertValues],
            connection
        );
        console.log('Successfully added orders');

        const updateValues = req.body.orders.map((order: Order) => [
            order.quantity,
            order.revenue,
            order.quantity,
            order.productId,
        ]);

        const queryString =
            'UPDATE products SET stock_level = stock_level - ?, total_value = total_value - ?, total_orders = total_orders + ? WHERE product_id = ?';

        await Promise.all(
            updateValues.map((order: (string | number)[]) => {
                return queryWithValues(queryString, [...order], connection);
            })
        );
        console.log('Successfully updated all products');

        const customerBalance = req.body.orders.reduce(
            (accumulator: number, currentValue: Order) =>
                accumulator + currentValue.revenue,
            0
        );

        await executePreparedStatement(
            'UPDATE `users` SET balance = balance + ? WHERE user_id = ?',
            [customerBalance, req.body.userId],
            connection
        );
        console.log('Successfully updated customer balance');

        await connection.commit();
        console.log('Transaction successful');

        res.status(201).send({ message: 'created new order' });
    } catch (e: any) {
        console.log(
            'Failed to complete order transaction ... rolling back changes'
        );

        await connection.rollback();
        console.log('Changes rolled back');

        next(new InternalServerError('Failed to register order', undefined, e));
    }
});

export default router;
