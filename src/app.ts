import express from 'express';

import productRouter from './routes/products/products';
import userRouter from './routes/users';
import orderRouter from './routes/orders/orders';
import authRouter from './routes/auth';

import errorHandler from './error-handlers/error-handler';

const app = express();
app.use(express.json());

app.use('/products', productRouter);
app.use('/users', userRouter);
app.use('/orders', orderRouter);

app.use('/', authRouter);

app.use(errorHandler);

export default app;
