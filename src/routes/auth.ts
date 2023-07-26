import express from 'express';

import { executePreparedStatement } from '../db/queries';
import { comparePassword } from '../utils/password';
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

export default router;
