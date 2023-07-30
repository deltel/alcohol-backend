import express from 'express';

import productRouter from './routes/products/products';
import userRouter from './routes/users';
import orderRouter from './routes/orders/orders';
import authRouter from './routes/auth';

import errorHandler from './error-handlers/error-handler';

const app = express();
app.use(express.json());

app.use('/v1/products', productRouter);
app.use('/v1/users', userRouter);
app.use('/v1/orders', orderRouter);

app.use('/', authRouter);

app.use(errorHandler);

export default app;
