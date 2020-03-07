require("dotenv").config();
const env = process.env.NODE_ENV || "development";
console.log(env);
const {
  user_table,
  match_table,
  match_detail,
  level_table,
  question,
  test
} = require("./fake_data.js");

const mysql = require("../util/mysql.js");

function _insertFakeUser() {
  console.log("inserting fake user...");
  return new Promise((resolve, reject) => {
    let insert = mysql.query(
      "INSERT INTO user_table (id, provider, email, user_password, user_name, picture, github_url, token, access_expired) VALUES ?",
      [user_table.map(x => Object.values(x))]
    );
    resolve(insert);
  });
}

function _insertFakeLevel() {
  console.log("inserting fake level...");
  return new Promise((resolve, reject) => {
    let insert = mysql.query(
      "INSERT INTO level_table (id, level_name, min_points) VALUES ?",
      [level_table.map(x => Object.values(x))]
    );
    resolve(insert);
  });
}

function _insertFakeMatch() {
  console.log("inserting fake match...");
  return new Promise((resolve, reject) => {
    let insert = mysql.query(
      "INSERT INTO match_table (id, question_id, match_key, winner_user_id, match_start_time, match_status) VALUES ?",
      [match_table.map(x => Object.values(x))]
    );
    resolve(insert);
  });
}

function _insertFakeMatchDetail() {
  console.log("inserting fake match detail...");
  return new Promise((resolve, reject) => {
    let insert = mysql.query(
      "INSERT INTO match_detail (id, match_id, user_id, answer_code, small_correctness, large_correctness, correctness, large_passed, large_exec_time, performance, answer_time, points) VALUES ?",
      [match_detail.map(x => Object.values(x))]
    );
    resolve(insert);
  });
}

function _insertFakeQuestion() {
  console.log("inserting fake question...");
  return new Promise((resolve, reject) => {
    let insert = mysql.query(
      "INSERT INTO question (id, question_name, question_text, question_code, question_const, difficulty, category) VALUES ?",
      [question.map(x => Object.values(x))]
    );
    resolve(insert);
  });
}

function _insertFakeTest() {
  console.log("inserting fake test...");
  return new Promise((resolve, reject) => {
    let insert = mysql.query(
      "INSERT INTO test (id, question_id, test_case_path, test_result, threshold_ms, is_large_case) VALUES ?",
      [test.map(x => Object.values(x))]
    );
    resolve(insert);
  });
}

async function createFakeData() {
  if (env !== "test") {
    console.log("Not in test env");
    return;
  }
  try {
    console.log("creating fake data...");
    await _insertFakeUser();
    await _insertFakeLevel();
    await _insertFakeQuestion();
    await _insertFakeTest();
    await _insertFakeMatch();
    await _insertFakeMatchDetail();
  } catch (err) {
    console.log(err);
  }
}

async function truncateFakeData() {
  if (env !== "test") {
    console.log("Not in test env");
    return;
  }

  console.log("truncating fake data...");
  const setForeignKey = status => {
    return new Promise((resolve, reject) => {
      let set = mysql.query("SET FOREIGN_KEY_CHECKS = ?", status);
      resolve(set);
    });
  };

  const truncateTable = table => {
    return new Promise((resolve, reject) => {
      let truncate = mysql.query(`TRUNCATE TABLE ${table}`);
      resolve(truncate);
    });
  };

  try {
    await setForeignKey(0);
    await truncateTable("user_table");
    await truncateTable("level_table");
    await truncateTable("match_table");
    await truncateTable("match_detail");
    await truncateTable("question");
    await truncateTable("test");
    await setForeignKey(1);
    console.log("truncated all fake data!");
  } catch (err) {
    console.log(err);
  }
}

module.exports = { createFakeData, truncateFakeData };
