const app = require("../../app");
const socket = require("../../socket");
const io = require('socket.io-client');

const request = require("supertest");
const errors = require("../../util/errors");
const env = process.env.NODE_ENV || "development";
const { truncateFakeData, createFakeData } = require("../fake_data_generator");

let testServer;
let client1;

beforeAll(async () => {
  console.log("Start socket_test.js");
  if (env !== "test") {
    throw "not in test env";
  }
  await truncateFakeData();
  await createFakeData();
  // setup socket server
  testServer = app.listen(3000, () => {
    console.log('Test server running on port 3000...');
  })
  socket.init(testServer);
});

beforeEach((done) => {
  // setup socket client
  client1 = io.connect("localhost:3000", {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
    query: {token: 'test1accesstoken'}
  });
  
  client1.on('connect', () => {
    client1.emit('online', 'test1accesstoken');
    console.log('client1 connected!');
    done();
  });
});

describe('socket.io test', () => {
  test('should get no stranger message', (done) => {
    console.log('test 1 starts ===========')
    client1.emit('online', 'test1accesstoken');
    let getStrangerData = {
      token: 'test1accesstoken',
      category: 'array',
      difficulty: 'easy'
    }
    client1.emit("getStranger", getStrangerData);
    client1.on('noStranger', (data) => {
      expect(data).toBe(errors.noStrangerFound.message);
      done();
    })
  });
});

describe("Test signup api", () => {
  test("Sign up success", async () => {
    const testUser = { username: "aaa1234", email: "1234@a.com", password: "1234" };
    const res = await request(app)
      .post("/api/v1/user/signup")
      .send(testUser)
      .set("Accept", "application/json")
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(testUser.username);
    expect(res.body.email).toBe(testUser.email);
  });
  test("Sign up failed: username taken", async () => {
    const testUser = { username: "aaa1234", email: "2234@a.com", password: "1234" };
    const res = await request(app)
      .post("/api/v1/user/signup")
      .send(testUser)
      .set("Accept", "application/json")
    expect(res.status).toBe(403);
    expect(res.text).toBe(errors.usernameTakenError.message);
  });
  test("Sign up failed: email taken", async () => {
    const testUser = { username: "bbb1234", email: "1234@a.com", password: "1234" };
    const res = await request(app)
      .post("/api/v1/user/signup")
      .send(testUser)
      .set("Accept", "application/json")
    expect(res.status).toBe(403);
    expect(res.text).toBe(errors.userEmailTakenError.message);
  });
  // mock sql error
  test("Sign up failed: insert user error", async () => {
    const testUser = { username: "ccc1234567890", email: "4234@a.com", password: "1234" };
    const res = await request(app)
      .post("/api/v1/user/signup")
      .send(testUser)
      .set("Accept", "application/json")
    expect(res.status).toBe(500);
    expect(res.text).toBe(errors.serverError.message);
  });
});
