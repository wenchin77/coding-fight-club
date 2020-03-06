const questionModel = require("../models/question");
const AWS = require("aws-sdk");
require("dotenv").config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
const bucket = process.env.AWS_S3_BUCKET;

function uploadFileToS3(filename, body) {
  // call S3 to retrieve upload file to specified bucket
  const params = { Bucket: bucket, Key: filename, Body: body };
  console.log(params)

  // call S3 to retrieve upload file to specified bucket
  s3.upload(params, (err, data) => {
    if (err) console.log(err);
    if (data) {
      console.log("S3: file uploaded successfully at", data.Location);
    }
  });
};

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

    try {
      let testCaseFileNo = await questionModel.queryCountTestFileNo(questionID);
      let testcaseID = testCaseFileNo[0]["COUNT(*)"];
      let filename = `testcases_${questionID}_${testcaseID}.json`;

      uploadFileToS3(filename, data);

      // insert into db file name
      let test = {
        question_id: questionID,
        test_case_path: filename,
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
