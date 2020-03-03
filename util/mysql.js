// MySQL Initialization
const mysql = require("mysql");
const util = require('util');

// Encrypted data
require('dotenv').config();

// Use pool to reuse connections and enhance the performance of executing commands
const pool = mysql.createPool({
  connectionLimit: 10, // default 10
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

pool.getConnection(function(err, connection) {
  if (err) throw err; // not connected!
  console.log(`MySQL pool connected at ${process.env.MYSQL_HOST}!`);
});


// Use util to promisify callback functions automatically
module.exports = {
	core: mysql,
	// con: mysqlCon,
	query: util.promisify(pool.query).bind(pool)
};