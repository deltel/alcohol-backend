import express from 'express';
const router = express.Router();

router.get('/', (_, res) => {
    res.send('Get all customers');
});

router.get('/customer', (_, res) => {
    res.send('Get a customer');
});

router.get('/customer-favourites', (_, res) => {
    res.send('Get most popular orders for customer');
});

export default router;
