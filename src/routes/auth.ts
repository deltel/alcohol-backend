import express from 'express';
import { v4 as uuidv4 } from 'uuid';

import { executePreparedStatement, queryWithValues } from '../db/queries';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/token';
import InternalServerError from '../errors/InternalServerError';
import { isEmpty } from '../validation/validators';

const router = express.Router();

router.post('/login', async (req, res, next) => {
    console.log('logging in');
    const { email, password } = req.body;
    try {
        const [results] = await executePreparedStatement(
            'SELECT user_id, role, password FROM `users` WHERE email = ?',
            [email]
        );

        if (isEmpty(results)) {
            res.status(400).send({ message: 'Invalid email or password' });
            return;
        }

        const hashedPassword = results[0].password;
        const passwordMatches = await comparePassword(password, hashedPassword);

        if (!passwordMatches) {
            res.status(400).send({ message: 'Invalid email or password' });
            return;
        }

        console.log('successfully logged in');

        const csrfToken = uuidv4();

        const jwt = signToken({
            sub: results[0].user_id,
            role: results[0].role,
            csrfToken,
        });

        res.setHeader(
            'Set-Cookie',
            `jwt=${jwt}; Max-Age=7200; Secure; HttpOnly`
        );
        res.setHeader('X-CSRF-Token', csrfToken);

        res.send({
            message: 'Successfully logged in',
        });
    } catch (e: any) {
        console.log('failed to log in');
        next(new InternalServerError('Failed to login customer', undefined, e));
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
        next(new InternalServerError('Failed to register user', undefined, e));
    }
});

export default router;
