import express from 'express';

import productRouter from './routes/products/products';
import userRouter from './routes/users';
import orderRouter from './routes/orders/orders';
import authRouter from './routes/auth';

import { errorHandler, pageNotFound } from './errors/error-handler';
import { validation } from './middleware/validation';

const app = express();
app.use(express.json());

app.use(validation);

app.use('/v1/products', productRouter);
app.use('/v1/users', userRouter);
app.use('/v1/orders', orderRouter);

app.use('/v1', authRouter);

app.use('', pageNotFound);

app.use(errorHandler);

export default app;
