import express from 'express';
import { RowDataPacket } from 'mysql2';

import connection from '../db/connection';
import { DateOrder, Order, OrderType } from '../contracts/order';

const router = express.Router();

router.get('', (req, res) => {
    const date = req.query.date as string;
    connection.execute<RowDataPacket[]>(
        "SELECT CONCAT(first_name, ' ', last_name) AS customer_name, GROUP_CONCAT(CONCAT(product_name, ': ', quantity)) AS details, SUM(revenue) AS revenue FROM orders INNER JOIN products ON orders.product_id = products.product_id INNER JOIN customers ON orders.customer_id = customers.customer_id WHERE orders.date_ordered = ? AND orders.order_type = 'sale' GROUP BY customer_name",
        [date],
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
            }

            const orders: DateOrder[] = results.map((order) => ({
                customerName: order.customer_name,
                details: order.details,
                revenue: parseFloat(order.revenue),
            }));

            console.log(`Retrieved all orders for date ${date}`);

            res.send({ orders });
        }
    );
});

router.post('/new', (req, res) => {
    const insertValues: (string | number)[][] = req.body.orders.map(
        (order: Order) => [
            order.productId,
            order.customerId,
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

    connection.query(
        'INSERT INTO orders (product_id, customer_id, date_ordered, purchase_location, date_paid, order_type, quantity, cost, revenue, profit) VALUES ?',
        [insertValues],
        function (error) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
                return;
            }

            console.log('Successfully added orders');
        }
    );

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

    updateValues.forEach((order: (string | number)[]) => {
        connection.query(queryString, [...order], function (error) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
                return;
            }

            console.log('Successfully updated product');
        });
    });

    if (req.body.orders[0].orderType === OrderType.SALE) {
        const customerBalance = req.body.orders.reduce(
            (accumulator: number, currentValue: Order) =>
                accumulator + currentValue.revenue,
            0
        );

        connection.execute(
            'UPDATE customers SET balance = balance + ? WHERE customer_id = ?',
            [customerBalance, req.body.orders[0].customerId],
            function (error) {
                if (error) {
                    console.error('error querying table', error);
                    res.send({
                        error: 'An error occurred while querying database',
                    });
                    return;
                }

                console.log('Successfully updated customer balance');
            }
        );
    }
    res.send('created new order');
});

router.post('/:orderId/pay', (req, res) => {
    const orderId = req.params.orderId;

    const orderData = {
        revenue: null,
        customerId: null,
        productId: null,
        profit: null,
    };

    connection.execute<RowDataPacket[]>(
        'SELECT revenue, customer_id, product_id FROM orders WHERE order_id = ?',
        [orderId],
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
                return;
            }

            orderData.revenue = results[0].revenue;
            orderData.customerId = results[0].customer_id;
            orderData.productId = results[0].product_id;

            console.log('Successfully retrieved order data');

            connection.execute<RowDataPacket[]>(
                'SELECT selling_price - unit_cost AS profit FROM products WHERE product_id = ?',
                [orderData.productId],
                function (error, results) {
                    if (error) {
                        console.error('error querying table', error);
                        res.send({
                            error: 'An error occurred while querying database',
                        });
                        return;
                    }

                    orderData.profit = results[0].profit;

                    console.log('Successfully retrieved the profit');

                    connection.execute(
                        'UPDATE orders SET date_paid = CURDATE(), profit = ? WHERE order_id = ?',
                        [orderData.profit, orderId],
                        function (error) {
                            if (error) {
                                console.error('error querying table', error);
                                res.send({
                                    error: 'An error occurred while querying database',
                                });
                                return;
                            }

                            console.log('Successfully updated paid order');

                            connection.execute(
                                'UPDATE customers SET balance = balance - ? WHERE customer_id = ?',
                                [orderData.revenue, orderData.customerId],
                                function (error) {
                                    if (error) {
                                        console.error(
                                            'error querying table',
                                            error
                                        );
                                        res.send({
                                            error: 'An error occurred while querying database',
                                        });
                                        return;
                                    }

                                    console.log(
                                        'Successfully updated customer balance'
                                    );

                                    connection.execute(
                                        'UPDATE products SET total_revenue = total_revenue + ?, total_profit = total_profit + ? WHERE product_id = ?',
                                        [
                                            orderData.revenue,
                                            orderData.profit,
                                            orderData.productId,
                                        ],
                                        function (error) {
                                            if (error) {
                                                console.error(
                                                    'error querying table',
                                                    error
                                                );
                                                res.send({
                                                    error: 'An error occurred while querying database',
                                                });
                                                return;
                                            }

                                            console.log(
                                                'Successfully updated profits for product'
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );

    res.send('payment made');
});

export default router;
