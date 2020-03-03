const { getLeaderboard, signup } = require("../routes/handler");
const errors = require('../util/errors');

const mockRequest = data => {
  return {
    body: data
  };
};

const mockResponse = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('signup', () => {
  const userData = {
    id: 1,
    username: 'test',
    email: '123@test.com',
    provider: 'native',
    token: '808a5639151c096faafcf16eba7607aa0034db440d89a4043776ac8e70898272',
    points: 123,
    level: 1,
    access_expired: 1585188829843
  };

  const countUsersByUserName0 = async (username) => {
    return 0;
  };

  const countUsersByUserName1 = async (username) => {
    return 1;
  };

  const countUsersByEmail0 = async (email) => {
    return 0;
  };

  const countUsersByEmail1 = async (email) => {
    return 1;
  };

  const insertUserSuccess = async (data) => {
    return userData;
  };

  const insertUserError = async (data) => {
    throw 'some error';
  };

  function userController(countName, countEmail, insertUser) {
    return {
      countUsersByUserName: countName,
      countUsersByEmail: countEmail,
      insertUser: insertUser,
    }
  };
  
  test("sign up success", async () => {
    const body = { username: '1234', email: '1234@com', password: '1234' };
    const req = mockRequest(body);
    const res = mockResponse();
    await signup(userController(countUsersByUserName0, countUsersByEmail0, insertUserSuccess))(req, res);
    expect(res.send).toHaveBeenCalledWith(userData);
    expect(res.status).toHaveBeenCalledWith(200);
  });
  test("username taken", async () => {
    const body = { username: '1234', email: '1234@com', password: '1234' };
    const req = mockRequest(body);
    const res = mockResponse();
    await signup(userController(countUsersByUserName1, countUsersByEmail0, insertUserSuccess))(req, res);
    expect(res.send).toHaveBeenCalledWith(errors.usernameTakenError);
    expect(res.status).toHaveBeenCalledWith(403);
  });
  test("email taken", async () => {
    const body = { username: '1234', email: '1234@com', password: '1234' };
    const req = mockRequest(body);
    const res = mockResponse();
    await signup(userController(countUsersByUserName0, countUsersByEmail1, insertUserSuccess))(req, res);
    expect(res.send).toHaveBeenCalledWith(errors.userEmailTakenError);
    expect(res.status).toHaveBeenCalledWith(403);
  });
  test("insert user error", async () => {
    const body = { username: '1234', email: '1234@com', password: '1234' };
    const req = mockRequest(body);
    const res = mockResponse();
    await signup(userController(countUsersByUserName0, countUsersByEmail0, insertUserError))(req, res);
    expect(res.send).toHaveBeenCalledWith(errors.serverError);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("getLeaderboard", () => {
  const leaderboardData = {
    0: {
      user_name: "testuser_0",
      points: 2117,
      level_name: "Master Fighter",
      created_at: "2020-02-17T03:10:22.000Z"
    },
    1: {
      user_name: "meow",
      points: 843,
      level_name: "Expert Fighter",
      created_at: "2020-02-21T08:28:17.000Z"
    },
    2: {
      user_name: "test224",
      points: 404,
      level_name: "Skilled Fighter",
      created_at: "2020-02-24T12:10:46.000Z"
    }
  };

  const userController = {
    selectLeaderboardUsers: async () => {
      return leaderboardData;
    }
  };

  const userControllerOnError = {
    selectLeaderboardUsers: async () => {
      throw "userControllerOnError error";
    }
  };
  test("should return json fake data", async () => {
    const req = mockRequest();
    const res = mockResponse();
    await getLeaderboard(userController)(req, res);
    expect(res.json).toHaveBeenCalledWith(leaderboardData);
  });
  test("should return 404 error", async () => {
    const req = mockRequest();
    const res = mockResponse();
    await getLeaderboard(userControllerOnError)(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith("userControllerOnError error");
  });
});
