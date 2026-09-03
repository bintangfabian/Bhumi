import mysql from "mysql2/promise";

declare global {
  var __bhumiPool: mysql.Pool | undefined;
}

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 8889),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "root",
    database: process.env.DB_NAME ?? "bhumi_id",
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });
}

export const pool = global.__bhumiPool ?? createPool();

if (process.env.NODE_ENV !== "production") global.__bhumiPool = pool;
