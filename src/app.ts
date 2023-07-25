import express from 'express';

import productRouter from './routes/products';
import customerRouter from './routes/customers';
import orderRouter from './routes/orders';
import errorHandler from './error-handlers/error-handler';

const app = express();
app.use(express.json());

app.use('/products', productRouter);
app.use('/customers', customerRouter);
app.use('/orders', orderRouter);

app.use(errorHandler);

export default app;
