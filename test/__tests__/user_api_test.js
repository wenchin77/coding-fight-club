const app = require("../../app");
// http testing
const request = require("supertest");
const errors = require("../../util/errors")

const env = process.env.NODE_ENV || "development";
const { truncateFakeData, createFakeData } = require("../fake_data_generator");


beforeAll(async (done) => {
  if (env !== "test") {
    throw "not in test env";
  }
  await truncateFakeData();
  await createFakeData();
  if (require.main === module) {
    app.listen(3000, () => {
      console.log('Test server running on port 3000...');
    })
  };
  done();
});

// afterAll((done) => {
//   close server????
// });

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
