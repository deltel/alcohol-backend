import express from 'express';

import { ProductPreview, CustomerProduct } from '../../contracts/product';
import { executePreparedStatement, query } from '../../db/queries';
import { auth } from '../../middleware/auth';
import { Intervals } from '../../constants/pagination';
import InternalServerError from '../../errors/InternalServerError';

const router = express.Router();
router.use(auth);

router.get('/', async (req, res, next) => {
    let { pageSize, pageOffset } = req.query;
    pageSize = Intervals[pageSize as string] ?? Intervals['10'];
    pageOffset = Intervals[pageOffset as string] ?? Intervals['0'];

    try {
        const [results] = await executePreparedStatement(
            'SELECT product_id, product_name, stock_level FROM `products` ORDER BY stock_level DESC LIMIT ? OFFSET ?',
            [pageSize, pageOffset]
        );

        const products: ProductPreview[] = results.map((product) => ({
            productId: product.product_id,
            productName: product.product_name,
            stockLevel: product.stock_level,
        }));

        console.log('Retrieved products');
        res.send({ products });
    } catch (e: any) {
        next(new InternalServerError('Failed to fetch products', undefined, e));
    }
});

router.get('/total', async (_, res, next) => {
    try {
        const [results] = await query(
            'SELECT COUNT(*) AS total FROM `products`'
        );

        console.log('Retrieved total products');

        res.send({ total: results[0].total });
    } catch (e: any) {
        next(
            new InternalServerError(
                'Failed to fetch the total number of products',
                undefined,
                e
            )
        );
    }
});

router.get('/:productId', async (req, res, next) => {
    try {
        const [results] = await executePreparedStatement(
            'SELECT product_id, product_name, stock_level, selling_price, volume FROM `products` WHERE `product_id` = ?',
            [req.params.productId]
        );

        const product: CustomerProduct = {
            productId: results[0].product_id,
            productName: results[0].product_name,
            stockLevel: results[0].stock_level,
            sellingPrice: parseFloat(results[0].selling_price),
            volume: results[0].volume,
        };

        console.log('Retrieved product for customer');

        res.send({ product });
    } catch (e: any) {
        next(
            new InternalServerError('Failed to retrieve product', undefined, e)
        );
    }
});

export default router;
