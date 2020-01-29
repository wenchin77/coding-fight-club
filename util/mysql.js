const util = require('util');
// MySQL Initialization
const mysql = require("mysql");
// Encrypted data
require('dotenv').config();

const mysqlCon = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	database: process.env.MYSQL_DATABASE
});

mysqlCon.connect(function (err) {
	if (err) {
		throw err;
	}
	console.log("MySQL connected!");
});

module.exports = {
	core: mysql,
	con: mysqlCon,
	query: util.promisify(mysqlCon.query)
};
