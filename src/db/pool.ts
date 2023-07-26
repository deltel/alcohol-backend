import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    connectionLimit: +process.env.CONNECTION_LIMIT!,
    maxIdle: +process.env.MAX_IDLE!,
    idleTimeout: +process.env.IDLE_TIMEOUT!,
});

export default pool;
