import express from 'express';
import connection from '../db/connection';
import { RowDataPacket } from 'mysql2';

import { Customer, CustomerPreview } from '../contracts/customer';
import { FavouriteProduct } from '../contracts/product';
import { CustomerOrder } from '../contracts/order';

const router = express.Router();

router.get('/', (_, res) => {
    connection.query<RowDataPacket[]>(
        "SELECT CONCAT(customer_id, ' ', first_name) AS customer_name, last_name, balance FROM `customers`",
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
            }

            const customers: CustomerPreview[] = results.map((customer) => ({
                customerId: customer.customer_id,
                customerName: customer.customer_name,
                balance: parseFloat(customer.balance),
            }));

            console.log('Retrieved customers');

            res.send({ customers });
        }
    );
});

router.get('/:customerId', (req, res) => {
    connection.execute<RowDataPacket[]>(
        "SELECT customer_id, CONCAT(customer_id, ' ', first_name) AS customer_name, balance_due_date, balance, (SELECT COUNT(order_id) FROM `orders` WHERE orders.customer_id = ?) AS total_orders, (SELECT SUM(revenue) FROM `orders` WHERE orders.customer_id = ?) AS total_revenue FROM `customers` WHERE customer_id = ?",
        [req.params.customerId, req.params.customerId, req.params.customerId],
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
            }

            const customer: Customer = {
                customerId: results[0].customer_id,
                customerName: results[0].customer_name,
                balance: parseFloat(results[0].balance),
                dueDate: results[0].balance_due_date,
                totalOrders: results[0].total_orders,
                totalRevenue: parseFloat(results[0].total_revenue ?? '0'),
            };

            console.log('Retrieved customer');

            res.send({ customer });
        }
    );
});

router.get('/:customerId/favourites', (req, res) => {
    const customerId = req.params.customerId;
    connection.execute<RowDataPacket[]>(
        'SELECT products.product_name AS product_name, SUM(orders.revenue) AS revenue, SUM(orders.quantity) AS quantity FROM products INNER JOIN orders ON orders.product_id = products.product_id WHERE orders.customer_id = ? GROUP BY products.product_name ORDER BY quantity DESC LIMIT 3',
        [customerId],
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
            }

            const favourites: FavouriteProduct[] = results.map((product) => ({
                productName: product.product_name,
                totalRevenue: parseFloat(product.revenue),
            }));

            console.log(`Retrieved favourites for customer id ${customerId}`);

            res.send({ favourites });
        }
    );
});

router.get('/:customerId/orders', (req, res) => {
    const customerId = req.params.customerId;
    connection.execute<RowDataPacket[]>(
        'SELECT date_ordered, date_paid, product_name, quantity, revenue, profit FROM orders INNER JOIN products ON orders.product_id = products.product_id WHERE orders.customer_id = ?',
        [customerId],
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
            }

            const orders: CustomerOrder[] = results.map((order) => ({
                dateOrdered: order.date_ordered,
                datePaid: order.date_paid,
                productName: order.product_name,
                quantity: order.quantity,
                revenue: parseFloat(order.revenue),
                profit: parseFloat(order.profit),
            }));

            console.log(`Retrieved orders for customer id ${customerId}`);

            res.send({ orders });
        }
    );
});

export default router;
