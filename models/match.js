const mysql = require("../util/mysql.js");

module.exports = {
  queryInsertMatch: (data) => {
    return mysql.query('INSERT INTO match_table SET ?', data)
  }
}