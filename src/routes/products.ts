import express from 'express';

import connection from '../db/connection';

const router = express.Router();

router.get('/', (_, res) => {
    connection.query('SELECT * FROM `products`', function (error, results) {
        if (error) {
            console.error('error querying table', error);
            res.send({ error: 'An error occurred' });
        }

        res.send({ products: results });
    });
});

router.get('/product', (_, res) => {
    res.send('Get product');
});

export default router;
