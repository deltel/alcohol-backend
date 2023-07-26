import { RowDataPacket } from 'mysql2';
import pool from './pool';

export function query(query: string) {
    return pool.query<RowDataPacket[]>(query);
}

export function queryWithValues(queryTemplate: string, values: any) {
    return pool.query(queryTemplate, values);
}

export function executePreparedStatement(queryTemplate: string, values: any) {
    return pool.execute<RowDataPacket[]>(queryTemplate, values);
}
