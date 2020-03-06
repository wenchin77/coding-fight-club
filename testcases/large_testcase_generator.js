const questionModel = require('../models/question');

// create an array -----------------------------
let array = [];
for (let i=-1000000;i<1200000;i+=2) {
  array.push(i);
}
// array.push(10000000)
// for (let i=500000;i<800000;i++) {
//   array.push(i);
// }
// array.push(1000001);
// for (let i=800000;i<1000000;i++) {
//   array.push(i);
// }

console.log(array);
console.log('length', array.length);
console.log('555555 th item', array[555555])
console.log('400000 th item', array[400000])


// organize test -----------------------------
let question_id = 35
let data = `[${array}], -200001`
let test_result = '400000'

// insert -----------------------------
// ONLY INSERT IF READY!!!!!!!!
// insert -----------------------------
// to be updated with s3!!!!!!!!!!!
// const insert = async (questionID, data, testResult) => {
//   let is_large_case = 1;
//   let result = await questionController.insertTest(questionID, data, testResult, is_large_case);
//   console.log(result);

//     let large = 1;
//     try {
//       let testCaseFileNo = await questionModel.queryCountTestFileNo(questionID);
//       let testcaseID = testCaseFileNo[0]["COUNT(*)"];
//       let filename = `testcases_${questionID}_${testcaseID}.json`;

//       uploadFileToS3(filename, data);

//       // insert into db file name
//       let test = {
//         question_id: questionID,
//         test_case_path: filename,
//         test_result: testResult,
//         is_large_case: large
//       };
//       let result = await questionModel.queryInsertTest(test);
//       console.log(result);
//       res.send(`Test data inserted: ${JSON.stringify(test)}`);
//     } catch (err) {
//       res.send(err);
//     }
// }
// insert(question_id, data, test_result);

