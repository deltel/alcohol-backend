import express from 'express';
import { RowDataPacket } from 'mysql2';

import connection from '../db/connection';
import { DateOrder } from '../contracts/order';

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

export default router;
