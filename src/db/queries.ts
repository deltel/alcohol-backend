import { RowDataPacket } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
import pool from './pool';

export function query(query: string, connection?: PoolConnection) {
    if (connection) {
        return connection.query<RowDataPacket[]>(query);
    }

    return pool.query<RowDataPacket[]>(query);
}

export function queryWithValues(
    queryTemplate: string,
    values: any,
    connection?: PoolConnection
) {
    if (connection) {
        return connection.query(queryTemplate, values);
    }

    return pool.query(queryTemplate, values);
}

export function executePreparedStatement(
    queryTemplate: string,
    values: any,
    connection?: PoolConnection
) {
    if (connection) {
        return connection.execute<RowDataPacket[]>(queryTemplate, values);
    }

    return pool.execute<RowDataPacket[]>(queryTemplate, values);
}
