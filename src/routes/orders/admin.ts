import express from 'express';

import {
    Order,
    OrderDetails,
    OrderSummary,
    OrderType,
} from '../../contracts/order';
import { queryWithValues, executePreparedStatement } from '../../db/queries';
import { isAdmin } from '../../middleware/auth';
import { Intervals } from '../../constants/pagination';

const router = express.Router();
router.use(isAdmin);

router.post('/new', async (req, res, next) => {
    try {
        const insertValues: (string | number)[][] = req.body.orders.map(
            (order: Order) => [
                order.productId,
                order.userId,
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
            'INSERT INTO orders (product_id, user_id, date_ordered, purchase_location, date_paid, order_type, quantity, cost, revenue, profit) VALUES ?',
            [insertValues]
        );
        console.log('Successfully added orders');

        const updateValues = req.body.orders.map((order: Order) => [
            order.quantity,
            order.cost,
            order.value,
            order.productId,
        ]);

        updateValues.forEach(async (order: (string | number)[]) => {
            await queryWithValues(
                'UPDATE products SET stock_level = stock_level + ?, total_cost = total_cost + ?, total_value = total_value + ? WHERE product_id = ?',
                [...order]
            );

            console.log('Successfully updated product');
        });

        res.send({ message: 'created new order' });
    } catch (e: any) {
        e.customMessage = 'Failed to register order';
        next(e);
    }
});

router.get('', async (req, res, next) => {
    const { pageSize = Intervals[10], pageOffset = Intervals[0] } = req.query;
    try {
        const [results] = await executePreparedStatement(
            'SELECT order_id, user_id, order_type, revenue, date_paid FROM orders ORDER BY order_id LIMIT ? OFFSET ?',
            [pageSize, pageOffset]
        );

        const orders: OrderSummary[] = results.map((order) => ({
            orderId: order.order_id,
            userId: order.user_id,
            revenue: order.revenue,
            datePaid: order.date_paid,
            orderType: order.order_type,
        }));

        res.send({ orders });
    } catch (e: any) {
        e.customMessage = 'Failed to retrieve orders';
        next(e);
    }
});

router.post('/:orderId/pay', isAdmin, async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        const orderData = {
            revenue: null,
            userId: null,
            productId: null,
            profit: null,
        };

        let [results] = await executePreparedStatement(
            'SELECT revenue, user_id, product_id FROM `orders` WHERE order_id = ?',
            [orderId]
        );

        orderData.revenue = results[0].revenue;
        orderData.userId = results[0].user_id;
        orderData.productId = results[0].product_id;

        console.log('Successfully retrieved order data');

        [results] = await executePreparedStatement(
            'SELECT selling_price - unit_cost AS profit FROM `products` WHERE product_id = ?',
            [orderData.productId]
        );
        orderData.profit = results[0].profit;

        console.log('Successfully retrieved the profit');

        await executePreparedStatement(
            'UPDATE orders SET date_paid = CURDATE(), profit = ? WHERE order_id = ?',
            [orderData.profit, orderId]
        );
        console.log('Successfully updated paid order');

        await executePreparedStatement(
            'UPDATE `users` SET balance = balance - ? WHERE user_id = ?',
            [orderData.revenue, orderData.userId]
        );

        console.log('Successfully updated customer balance');

        await executePreparedStatement(
            'UPDATE products SET total_revenue = total_revenue + ?, total_profit = total_profit + ? WHERE product_id = ?',
            [orderData.revenue, orderData.profit, orderData.productId]
        );

        console.log('Successfully updated profits for product');

        res.send({ message: 'payment made' });
    } catch (e: any) {
        e.customMessage = 'Failed to register payment';
        next(e);
    }
});

router.get('/:orderId', async (req, res, next) => {
    try {
        const [results] = await executePreparedStatement(
            'SELECT product_name, CONCAT(first_name, " ", last_name) AS customer_name, date_ordered, purchase_location, date_paid, order_type, quantity, cost, revenue, profit FROM `orders` INNER JOIN products ON orders.product_id = products.product_id INNER JOIN users ON orders.user_id = users.user_id WHERE order_id = ?',
            [req.params.orderId]
        );

        const order: OrderDetails = {
            productName: results[0].product_name,
            dateOrdered: results[0].date_ordered,
            datePaid: results[0].date_paid,
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
        e.customMessage = 'Failed to retrieve order';
        next(e);
    }
});

export default router;
