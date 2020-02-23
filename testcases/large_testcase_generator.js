const questionController = require('../controllers/questionController');

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
// const getInsertResult = async (question_id, data, test_result) => {
//   let is_large_case = 1;
//   let result = await questionController.insertTest(question_id, data, test_result, is_large_case);
//   console.log(result);
// }
// getInsertResult(question_id, data, test_result);

