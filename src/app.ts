import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

import productRouter from './routes/products/products';
import userRouter from './routes/users';
import orderRouter from './routes/orders/orders';
import authRouter from './routes/auth';

import { errorHandler, pageNotFound } from './errors/error-handler';
import { validation } from './middleware/validation';

const app = express();
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        exposedHeaders: ['x-csrf-token'],
        credentials: true,
        methods: ['GET', 'POST', 'PATCH'],
    })
);
app.options(
    '/v1/login',
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ['POST'],
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(validation);

app.use('/v1/products', productRouter);
app.use('/v1/users', userRouter);
app.use('/v1/orders', orderRouter);

app.use('/v1', authRouter);

app.get('/', (_, res) => {
    res.send('Hello World!');
});

app.use('', pageNotFound);

app.use(errorHandler);

app.disable('x-powered-by');

export default app;
