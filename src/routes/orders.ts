import express from 'express';

import { DateOrder, Order, OrderType } from '../contracts/order';
import { queryWithValues, executePreparedStatement } from '../db/queries';
import { auth, isAdmin } from '../middleware/auth';

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
        e.customMessage = 'Failed to retrieve orders';
        next(e);
    }
});

router.post('/new', async (req, res, next) => {
    try {
        const insertValues: (string | number)[][] = req.body.orders.map(
            (order: Order) => [
                order.productId,
                order.userId,
                order.dateOrdered,
                order.purchaseLocation,
                order.datePaid,
                order.orderType,
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

        const updateValues =
            req.body.orders[0].orderType === OrderType.RESTOCK
                ? req.body.orders.map((order: Order) => [
                      order.quantity,
                      order.cost,
                      order.value,
                      order.productId,
                  ])
                : req.body.orders.map((order: Order) => [
                      order.quantity,
                      order.revenue,
                      order.quantity,
                      order.productId,
                  ]);

        const queryString =
            req.body.orders[0].orderType === OrderType.RESTOCK
                ? 'UPDATE products SET stock_level = stock_level + ?, total_cost = total_cost + ?, total_value = total_value + ? WHERE product_id = ?'
                : 'UPDATE products SET stock_level = stock_level - ?, total_value = total_value - ?, total_orders = total_orders + ? WHERE product_id = ?';

        updateValues.forEach(async (order: (string | number)[]) => {
            await queryWithValues(queryString, [...order]);

            console.log('Successfully updated product');
        });

        if (req.body.orders[0].orderType === OrderType.SALE) {
            const customerBalance = req.body.orders.reduce(
                (accumulator: number, currentValue: Order) =>
                    accumulator + currentValue.revenue,
                0
            );

            await executePreparedStatement(
                'UPDATE `users` SET balance = balance + ? WHERE user_id = ?',
                [customerBalance, req.body.orders[0].userId]
            );
            console.log('Successfully updated customer balance');
        }

        res.send({ message: 'created new order' });
    } catch (e: any) {
        e.customMessage = 'Failed to register order';
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

export default router;
