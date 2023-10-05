import express from 'express';

import {
    Product,
    ProductRequest,
    ProductRequestColumnMapping,
} from '../../contracts/product';
import { ProductOrder, RestockOrder } from '../../contracts/order';
import { executePreparedStatement, queryWithValues } from '../../db/queries';
import { isAdmin } from '../../middleware/auth';
import { Intervals } from '../../constants/pagination';
import InternalServerError from '../../errors/InternalServerError';

const router = express.Router();
router.use(isAdmin);

router.get('/:productId', isAdmin, async (req, res, next) => {
    try {
        const [results] = await executePreparedStatement(
            'SELECT product_id, product_name, stock_level, unit_cost, selling_price, wholesale_price, total_cost, total_orders, total_profit, total_revenue, total_value, volume FROM `products` WHERE `product_id` = ?',
            [req.params.productId]
        );

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
    } catch (e: any) {
        next(
            new InternalServerError('Failed to retrieve product', undefined, e)
        );
    }
});

router.get('/:productId/orders/recent', isAdmin, async (req, res, next) => {
    try {
        const productId = req.params.productId;
        const [results] = await executePreparedStatement(
            "SELECT date_ordered, product_name, purchase_location, quantity, cost FROM orders INNER JOIN products ON orders.product_id = products.product_id WHERE orders.product_id = ? AND order_type = 'restock' ORDER BY date_ordered DESC LIMIT 10",
            [productId]
        );

        const orders: RestockOrder[] = results.map((order) => ({
            dateOrdered: order.date_ordered,
            purchaseLocation: order.purchase_location,
            quantity: order.quantity,
            cost: parseFloat(order.cost),
        }));
        const productName = results[0].product_name;

        console.log(
            `Retrieved most recent restocking orders for product id ${productId}`
        );

        res.send({ productName, orders });
    } catch (e: any) {
        next(
            new InternalServerError('Failed to get recent orders', undefined, e)
        );
    }
});

router.get('/:productId/orders', isAdmin, async (req, res, next) => {
    const { pageSize = Intervals[10], pageOffset = Intervals[0] } = req.query;
    try {
        const productId = req.params.productId;
        const [results] = await executePreparedStatement(
            'SELECT date_ordered, date_paid, product_name, order_type, purchase_location, quantity, revenue, profit FROM orders INNER JOIN products ON orders.product_id = products.product_id WHERE orders.product_id = ? ORDER BY date_ordered LIMIT ? OFFSET ?',
            [productId, pageSize, pageOffset]
        );

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
    } catch (e: any) {
        next(
            new InternalServerError('Failed to retrieve orders', undefined, e)
        );
    }
});

router.post('/new', async (req, res, next) => {
    const {
        productName,
        volume,
        stockLevel,
        unitCost,
        sellingPrice,
        wholesalePrice,
        totalValue,
        totalOrders,
        totalCost,
        totalRevenue,
        totalProfit,
    } = req.body;
    try {
        const insertValues: (string | number)[][] = [
            [
                productName,
                volume,
                stockLevel,
                unitCost,
                sellingPrice,
                wholesalePrice,
                totalValue,
                totalOrders,
                totalCost,
                totalRevenue,
                totalProfit,
            ],
        ];

        await queryWithValues(
            'INSERT INTO products (product_name, volume, stock_level, unit_cost, selling_price, wholesale_price, total_value, total_orders, total_cost, total_revenue, total_profit) VALUES ?',
            [insertValues]
        );

        console.log('Added new product');

        res.status(201).send({ message: 'Successfully added new product' });
    } catch (e: any) {
        next(new InternalServerError('Failed to add product', undefined, e));
    }
});

router.patch('/:productId', isAdmin, async (req, res, next) => {
    const productId = req.params.productId;
    try {
        console.log('Updating product with id', productId);
        const fields = Object.keys(req.body);

        const columnNames = fields.map(
            (field) =>
                ProductRequestColumnMapping[field as keyof ProductRequest]
        );

        const columns = columnNames.join(' = ?, ');
        const updateValues = Object.values(req.body);

        await executePreparedStatement(
            `UPDATE products SET ${columns} = ? WHERE product_id = ${productId}`,
            updateValues
        );

        console.log('Successfully updated product with id', productId);
        res.status(200).send({ message: 'Successfully updated product' });
    } catch (e: any) {
        console.log('Failed to update product with id', productId);
        next(new InternalServerError('Failed to modify product', undefined, e));
    }
});

export default router;
