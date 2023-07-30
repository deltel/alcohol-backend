import express from 'express';

import { executePreparedStatement, queryWithValues } from '../db/queries';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/token';

const router = express.Router();

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const [results] = await executePreparedStatement(
            'SELECT user_id, role, password FROM `users` WHERE email = ?',
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
            token: signToken({
                sub: results[0].user_id,
                role: results[0].role,
            }),
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
            'INSERT INTO `users` (first_name, last_name, email, telephone, password) VALUES ?',
            [insertValues]
        );

        console.log('Added new user');

        res.status(201).send({ message: 'Successfully registered user' });
    } catch (e: any) {
        e.customMessage = 'Failed to register user';
        next(e);
    }
});

export default router;
