import express from 'express';
const router = express.Router();

router.get('/', (_, res) => {
    res.send('Get all orders for product');
});

router.get('/date', (_, res) => {
    res.send('Get all orders for date');
});

router.get('/product', (_, res) => {
    res.send('Get all orders for product');
});

router.get('/customer', (_, res) => {
    res.send('Get all orders for customer');
});

export default router;
