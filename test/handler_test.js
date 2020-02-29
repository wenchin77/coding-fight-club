const { getLeaderboard } = require("../routes/handler");

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

describe("getLeaderboard", () => {
  const fakeData = {
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
      return fakeData;
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
    expect(res.json).toHaveBeenCalledWith(fakeData);
  });
  test("should return 404 error", async () => {
    const req = mockRequest();
    const res = mockResponse();
    await getLeaderboard(userControllerOnError)(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith("userControllerOnError error");
  });
});
