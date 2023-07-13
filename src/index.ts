import 'dotenv/config';

import app from './app';

const port = process.env.PORT;

app.get('/', (_, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Application started on port ${port}`);
});
