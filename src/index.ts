import 'dotenv/config';

import { createHttpTerminator } from 'http-terminator';

import app from './app';

const port = process.env.PORT;

const server = app.listen(port, () => {
    console.log(`Application started on port ${port}`);
});

const httpTerminator = createHttpTerminator({
    server,
});

process.on('SIGTERM', async () => {
    console.debug('SIGTERM signal received: closing HTTP server');
    await httpTerminator.terminate();
});
