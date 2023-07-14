import express from 'express';

import productRouter from './routes/products';
import customerRouter from './routes/customers';

const app = express();

app.use('/products', productRouter);
app.use('/customers', customerRouter);

export default app;
