import express from 'express';
import { RowDataPacket } from 'mysql2';

import connection from '../db/connection';

import { Product, ProductPreview, CustomerProduct } from '../contracts/product';
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

router.get('/:productId/admin', (req, res) => {
    connection.execute<RowDataPacket[]>(
        'SELECT product_id, product_name, stock_level, unit_cost, selling_price, wholesale_price, total_cost, total_orders, total_profit, total_revenue, total_value, volume FROM `products` WHERE `product_id` = ?',
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
                unitCost: parseFloat(results[0].unit_cost),
                sellingPrice: parseFloat(results[0].selling_price),
                wholesalePrice: parseFloat(results[0].wholesale_price),
                totalCost: parseFloat(results[0].total_cost),
                totalOrders: results[0].total_orders,
                totalProfit: parseFloat(results[0].total_profit),
                totalRevenue: parseFloat(results[0].total_revenue),
                totalValue: parseFloat(results[0].total_value),
                volume: results[0].volume,
            };

            console.log('Retrieved product for admin');

            res.send({ product });
        }
    );
});

router.get('/:productId', (req, res) => {
    connection.execute<RowDataPacket[]>(
        'SELECT product_id, product_name, stock_level, selling_price, volume FROM `products` WHERE `product_id` = ?',
        [req.params.productId],
        function (error, results) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
            }

            const product: CustomerProduct = {
                productId: results[0].product_id,
                productName: results[0].product_name,
                stockLevel: results[0].stock_level,
                sellingPrice: parseFloat(results[0].selling_price),
                volume: results[0].volume,
            };

            console.log('Retrieved product for customer');

            res.send({ product });
        }
    );
});

router.post('/new', (req, res) => {
    const insertValues: (string | number)[][] = [
        Object.values(req.body.product),
    ];

    connection.query(
        'INSERT INTO products (product_name, volume, stock_level, unit_cost, selling_price, wholesale_price, total_value, total_orders, total_cost, total_revenue, total_profit) VALUES ?',
        [insertValues],
        function (error) {
            if (error) {
                console.error('error querying table', error);
                res.send({
                    error: 'An error occurred while querying database',
                });
                return;
            }

            console.log('Added new product');

            res.send('Successfully added new product');
        }
    );
});

export default router;
