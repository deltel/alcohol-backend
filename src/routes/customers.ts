import express from 'express';
import connection from '../db/connection';
import { RowDataPacket } from 'mysql2';
import { Customer, CustomerPreview } from '../contracts/customer';

const router = express.Router();

router.get('/', (_, res) => {
    connection.query<RowDataPacket[]>(
        'SELECT customer_id, first_name, last_name, balance FROM `customers`',
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
            }

            const customers: CustomerPreview[] = results.map((customer) => ({
                customerId: customer.customer_id,
                customerName: `${customer.first_name} ${customer.last_name}`,
                balance: parseFloat(customer.balance),
            }));

            console.log('Retrieved customers');

            res.send({ customers });
        }
    );
});

router.get('/:customerId', (req, res) => {
    connection.execute<RowDataPacket[]>(
        'SELECT customer_id, first_name, last_name, balance_due_date, balance, (SELECT COUNT(order_id) FROM `orders` WHERE orders.customer_id = ?) AS total_orders, (SELECT SUM(revenue) FROM `orders` WHERE orders.customer_id = ?) AS total_revenue FROM `customers` WHERE customer_id = ?',
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
                customerName: `${results[0].first_name} ${results[0].last_name}`,
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
    res.send('Get most popular orders for customer');
});

export default router;
