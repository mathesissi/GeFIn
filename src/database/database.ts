import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gefin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log('Conexão com banco de dados configurada');
