// MySQL Initialization
const mysql = require("mysql");
const util = require('util');
// const mysql = require("promise-mysql");
// Encrypted data
require("dotenv").config();

// Use pool to reuse connections and enhance the performance of executing commands
let dbConfig = {
  connectionLimit: 10, // default 10
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};
const pool = mysql.createPool(dbConfig);
pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log(`MySQL pool connected at ${process.env.MYSQL_HOST}!`);
});

// Use util to promisify callback functions automatically
module.exports = {
  pool,
  query: util.promisify(pool.query).bind(pool)
};

// module.exports = async () => {
//   try {
//     let pool;
//     let con;
//     if (pool) con = pool.getConnection();
//     else {
//       pool = await mysql.createPool(dbConfig);
//       con = pool.getConnection();
//     }
//     return con;
//   } catch (ex) {
//     throw ex;
//   }
// };
