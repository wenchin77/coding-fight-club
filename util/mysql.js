const mysql = require("mysql");
require("dotenv").config();
const env = process.env.NODE_ENV || "development";

// Use pool to reuse connections and enhance the performance of executing commands
let dbConfig = {
  connectionLimit: 10, // default 10
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};
let dbTestConfig = {
  connectionLimit: 10, // default 10
  host: process.env.MYSQL_TEST_HOST,
  user: process.env.MYSQL_TEST_USER,
  password: process.env.MYSQL_TEST_PASSWORD,
  database: process.env.MYSQL_TEST_DATABASE
};
const pool = (env === "development") ? mysql.createPool(dbConfig) : mysql.createPool(dbTestConfig);

const connection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) reject(err);
      console.log("MySQL pool connected: threadId " + connection.threadId);
      const query = (sql, binding) => {
        return new Promise((resolve, reject) => {
          connection.query(sql, binding, (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
      };
      const release = () => {
        return new Promise((resolve, reject) => {
          if (err) reject(err);
          console.log("MySQL pool released: threadId " + connection.threadId);
          resolve(connection.release());
        });
      };
      resolve({ query, release });
    });
  });
};

const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

console.log('Node env:', env)

// Use util to promisify callback functions automatically
module.exports = {
  pool,
  connection,
  query
};
