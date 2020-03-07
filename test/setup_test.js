const app = require('../app');
// http testing
const supertest = require('supertest');
const request = supertest(app);

const env = process.env.NODE_ENV || "development"
const {truncateFakeData, createFakeData} = require('./fake_data_generator');

beforeAll(async() => {
  console.log('全域 beforeAll ：全域的第一個順序執行');
  if (env !== 'test') {
    throw 'not in test env';
  };
  await truncateFakeData();
  await createFakeData();
})
beforeEach(()=>{console.log('全域 beforeEach ：每次測試前都會執行，優先度大於區域的')})
afterAll(() => { console.log('全域 afterAll ：全域的最後一個順序執行') })
afterEach(()=>{console.log('全域 afterEach ：每次測試後都會執行，優先度低於區域的')})


