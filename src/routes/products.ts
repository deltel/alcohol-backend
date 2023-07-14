import express from 'express';

import connection from '../db/connection';
import { Product, ProductPreview } from '../contracts/products';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

router.get('/', (_, res) => {
    connection.query<RowDataPacket[]>(
        'SELECT * FROM `products`',
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

export default router;
