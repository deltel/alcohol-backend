import express from 'express';

import { executePreparedStatement, queryWithValues } from '../db/queries';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/token';

const router = express.Router();

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const [results] = await executePreparedStatement(
            'SELECT customer_id, password FROM `customers` WHERE email = ?',
            [email]
        );

        const hashedPassword = results[0].password;
        const passwordMatches = await comparePassword(password, hashedPassword);

        if (!passwordMatches) {
            res.status(401).send({ message: 'Invalid email or password' });
            return;
        }

        res.send({
            message: 'Successfully logged in',
            token: signToken({ sub: results[0].customer_id }),
        });
    } catch (e: any) {
        e.customMessage = 'Failed to login customer';
        next(e);
    }
});

router.post('/register', async (req, res, next) => {
    const { firstName, lastName, email, telephone, password } = req.body;

    try {
        const hashedPassword = await hashPassword(password);

        const insertValues: (string | number)[][] = [
            [firstName, lastName, email, telephone, hashedPassword],
        ];

        await queryWithValues(
            'INSERT INTO customers (first_name, last_name, email, telephone, password) VALUES ?',
            [insertValues]
        );

        console.log('Added new customer');

        res.send({ message: 'Successfully registered customer' });
    } catch (e: any) {
        e.customMessage = 'Failed to register customer';
        next(e);
    }
});

export default router;
