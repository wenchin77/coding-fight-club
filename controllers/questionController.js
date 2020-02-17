// const AppError = require('../util/appError');
// sql 語句拆到 model/question 去
const questionModel = require('../models/question');
const fs = require('fs');

module.exports = {
  insertQuestion: async (question) => {
    try {
      let result = await questionModel.queryInsertQuestion(question);
      // const [rows, fields] = await questionModel.queryInsertQuestion(question);  
      console.log(result);
      return(`Question inserted: ${JSON.stringify(question)}`);
    } catch (err) {
      console.log(err);
      return('Question insert error!')
    }
  },
  
  insertTest: async (question_id, data, test_result) => {
    const dir = `./testcases/${question_id}`;

    // fs create new dir with question_id
    let checkDir = fs.existsSync(dir);
    if(!checkDir) {
      fs.mkdirSync(dir);
    }
    // fs create new testcase file
    let path0 = `${dir}/0.json`
    let checkFile = fs.existsSync(path0);

    const countFileNo = (dir) => {
      return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
          resolve(files.length);
          if (err) {reject(err)};
        });
      })
    }

    let testCaseFileNo = await countFileNo(dir);
    console.log('testCaseFileNo', testCaseFileNo)

    let testcaseID = checkFile ? testCaseFileNo : 0;
    console.log('testcaseID', testcaseID);

    let file = fs.openSync(`${dir}/${testcaseID}.json`, "w");
    fs.writeSync(file, data, (encoding = "utf-8"));
    fs.closeSync(file);

    // insert into db file name
    let test =  {
      question_id,
      test_case_path: `${dir}/${testcaseID}.json`,
      test_result
    }
    try {
      let result = await questionModel.queryInsertTest(test);
      console.log(result);
      return(`Test data inserted: ${JSON.stringify(test)}`);
    } catch (err) {
      console.log(err);
      return('Test insert error!');
    }
  },

  selectQuestions: async (category, difficulty) => {
    try {
      if (category === 'all') {
        let result = await questionModel.querySelectAllQuestions(difficulty);
        return result;
      }
      let result = await questionModel.querySelectQuestions(category, difficulty);
      return result;
    } catch (err) {
      console.log(err);
    }
  },

  selectQuestion: async (question_id) => {
    try {
      let result = await questionModel.querySelectQuestion(question_id);
      let questionObj = result[0];
      return questionObj;
    } catch (err) {
      console.log(err);
    }
  },

  selectSampleTestCases: async (question_id, is_large_case) => {
    try {
      let result = await questionModel.querySelectSampleTestCases(question_id, is_large_case);
      return result;
    } catch (err) {
      console.log(err);
    }
  },

  selectThresholdMs: async (question_id) => {
    try {
      let result = await questionModel.querySelectThresholdMs(question_id);
      return result;
    } catch (err) {
      console.log(err);
    }
  },


  


};
