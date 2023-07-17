import express from 'express';

import productRouter from './routes/products';
import customerRouter from './routes/customers';
import orderRouter from './routes/orders';

const app = express();

app.use('/products', productRouter);
app.use('/customers', customerRouter);
app.use('/orders', orderRouter);

export default app;
