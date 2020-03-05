const questionModel = require("../models/question");
const fs = require("fs");
require("dotenv").config();

module.exports = {
  insertQuestion: async (req, res) => {
    if (req.body.admin !== process.env.ADMIN_PASSWORD) {
      res.send('Access forbidden');
      return;
    };
    let question = {
      question_name: req.body.title,
      question_text: req.body.description,
      question_code: req.body.code,
      question_const: req.body.const,
      difficulty: req.body.difficulty,
      category: req.body.category
    };
    try {
      let result = await questionModel.queryInsertQuestion(question);
      console.log(result);
      res.send(`Question inserted: ${JSON.stringify(question)}`);
    } catch (err) {
      res.send(err);
    }
  },

  insertTest: async (req, res) => {
    if (req.body.admin !== process.env.ADMIN_PASSWORD) {
      res.send('Access forbidden');
      return;
    };
    let questionID = req.body.question_id;
    let data = req.body.test_data;
    let testResult = req.body.test_result;
    let large = req.body.is_large_case;

    const dir = `./testcases/${questionID}`;

    // fs create new dir with questionID
    let checkDir = fs.existsSync(dir);
    if (!checkDir) {
      fs.mkdirSync(dir);
    }
    // fs create new testcase file
    let path0 = `${dir}/0.json`;
    let checkFile = fs.existsSync(path0);
    try {
      const countFileNo = dir => {
        return new Promise((resolve, reject) => {
          fs.readdir(dir, (err, files) => {
            resolve(files.length);
            if (err) {
              reject(err);
            }
          });
        });
      };

      let testCaseFileNo = await countFileNo(dir);
      let testcaseID = checkFile ? testCaseFileNo : 0;

      let file = fs.openSync(`${dir}/${testcaseID}.json`, "w");
      fs.writeSync(file, data, (encoding = "utf-8"));
      fs.closeSync(file);

      // insert into db file name
      let test = {
        question_id: questionID,
        test_case_path: `${dir}/${testcaseID}.json`,
        test_result: testResult,
        is_large_case: large
      };
      let result = await questionModel.queryInsertTest(test);
      console.log(result);
      res.send(`Test data inserted: ${JSON.stringify(test)}`);
    } catch (err) {
      res.send(err);
    }
  },

  selectQuestions: async (req, res) => {
    let category = req.params.category;
    let difficulty = req.query.difficulty;
    try {
      if (category === "all") {
        let allQuestions = await questionModel.querySelectAllQuestions();
        res.send({allQuestions});
        return;
      }
      let questions = await questionModel.querySelectQuestions(
        category,
        difficulty
      );
      // 之後放 cache 以後從 cache 拿出來篩 random
      let randomIndex = Math.floor((Math.random() * questions.length));
      let question = questions[randomIndex];
      res.send({question});
    } catch (err) {
      console.log(err);
    }
  },

  selectQuestion: async question_id => {
    try {
      let result = await questionModel.querySelectQuestion(question_id);
      let questionObj = result[0];
      return questionObj;
    } catch (err) {
      console.log(err);
    }
  }
};
