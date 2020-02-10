const questionController = require('../controllers/questionController');

// create an array -----------------------------
let array = [];
for (i=0;i<500000;i++) {
  array.push(i);
}
array.push(10000000)
for (i=500000;i<800000;i++) {
  array.push(i);
}
array.push(1000001);
for (i=800000;i<1000000;i++) {
  array.push(i);
}

console.log(array);
console.log(array.length);
console.log(array[500000])
console.log(array[800001])


// organize test -----------------------------
let question_id = 21
let data = `[${array}], 11000001`
let test_result = '[500000,800001]'

// // insert -----------------------------
// const getInsertResult = async (question_id, data, test_result) => {
//   let result = await questionController.insertTest(question_id, data, test_result);
//   console.log(result);
// }
// getInsertResult(question_id, data, test_result);

