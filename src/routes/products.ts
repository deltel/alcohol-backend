import express from 'express';

import connection from '../db/connection';
import { Product, ProductPreview } from '../contracts/product';
import { RowDataPacket } from 'mysql2';
import { ProductOrder, RestockOrder } from '../contracts/order';

const router = express.Router();

router.get('/', (_, res) => {
    connection.query<RowDataPacket[]>(
        'SELECT product_id, product_name, stock_level FROM `products`',
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
            }

            const products: ProductPreview[] = results.map((product) => ({
                productId: product.product_id,
                productName: product.product_name,
                stockLevel: product.stock_level,
            }));

            console.log('Retrieved products');

            res.send({ products });
        }
    );
});

router.get('/:productId', (req, res) => {
    connection.execute<RowDataPacket[]>(
        'SELECT product_id, product_name, stock_level, total_cost, total_orders, total_profit, total_revenue, total_value FROM `products` WHERE `product_id` = ?',
        [req.params.productId],
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
            }

            const product: Product = {
                productId: results[0].product_id,
                productName: results[0].product_name,
                stockLevel: results[0].stock_level,
                totalCost: parseFloat(results[0].total_cost),
                totalOrders: results[0].total_orders,
                totalProfit: parseFloat(results[0].total_profit),
                totalRevenue: parseFloat(results[0].total_revenue),
                totalValue: parseFloat(results[0].total_value),
            };

            console.log('Retrieved product');

            res.send({ product });
        }
    );
});

router.get('/:productId/orders', (req, res) => {
    const productId = req.params.productId;
    connection.execute<RowDataPacket[]>(
        'SELECT date_ordered, date_paid, product_name, order_type, purchase_location, quantity, revenue, profit FROM orders INNER JOIN products ON orders.product_id = products.product_id WHERE orders.product_id = ?',
        [productId],
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
            }

            const orders: ProductOrder[] = results.map((order) => ({
                dateOrdered: order.date_ordered,
                datePaid: order.date_paid,
                productName: order.product_name,
                orderType: order.order_type,
                purchaseLocation: order.purchase_location,
                quantity: order.quantity,
                revenue: parseFloat(order.revenue),
                profit: parseFloat(order.profit),
            }));

            console.log(`Retrieved orders for product id ${productId}`);

            res.send({ orders });
        }
    );
});

router.get('/:productId/orders/recent', (req, res) => {
    const productId = req.params.productId;
    connection.execute<RowDataPacket[]>(
        "SELECT date_ordered, product_name, purchase_location, quantity, cost FROM orders INNER JOIN products ON orders.product_id = products.product_id WHERE orders.product_id = ? AND order_type = 'restock' ORDER BY date_ordered DESC LIMIT 10",
        [productId],
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
            }

            const orders: RestockOrder[] = results.map((order) => ({
                dateOrdered: order.date_ordered,
                productName: order.product_name,
                purchaseLocation: order.purchase_location,
                quantity: order.quantity,
                cost: parseFloat(order.cost),
            }));

            console.log(
                `Retrieved most recent restocking orders for product id ${productId}`
            );

            res.send({ orders });
        }
    );
});

export default router;
