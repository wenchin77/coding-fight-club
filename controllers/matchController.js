const fs = require("fs");
const cryptoRandomString = require("crypto-random-string");
const matchModel = require("../models/match");
const questionModel = require("../models/question");
const errors = require("../util/errors");

module.exports = {
  insertMatch: async (req, res) => {
    let data = {
      question_id: req.body.questionID,
      match_key: req.body.matchKey,
      match_status: -1
    };
    try {
      await matchModel.queryInsertMatch(data);
      res.status(200).send("OK");
    } catch (err) {
      console.log(err);
      res
        .status(errors.serverError.statusCode)
        .send(errors.serverError.message);
    }
  },

  updateMatch: async (key, match_start_time, match_status) => {
    try {
      // can combine these two qeuries???
      let data = {
        match_start_time,
        match_status
      };
      await matchModel.queryUpdateMatch(key, data);
      let getMatchID = await matchModel.queryGetMatchID(key);
      return getMatchID[0].id;
    } catch (err) {
      console.log(err);
      throw errors.serverError;
    }
  },

  getMatchId: async key => {
    try {
      let getMatchID = await matchModel.queryGetMatchID(key);
      return getMatchID[0].id;
    } catch (err) {
      console.log(err);
      throw errors.serverError;
    }
  },

  getKey: (req, res) => {
    try {
      let key = cryptoRandomString({ length: 10, type: "numeric" });
      res.json(key);
    } catch (err) {
      console.log(err);
    }
  },

  getQuestionDetail: async (matchKey, submitBoolean) => {
    try {
      // get questionID with matchKey
      let matchQuestionIdResult = await matchModel.queryGetMatchQuestion(
        matchKey
      );
      let questionID = matchQuestionIdResult[0].question_id;

      // get question details with questionID
      let questionResult = await questionModel.querySelectQuestion(questionID);
      let getQuestionResult = questionResult[0];

      // get sample test case with questionID
      let smallSampleCases = await questionModel.querySelectSampleTestCases(
        questionID,
        0
      );
      let largeSampleCases = await questionModel.querySelectSampleTestCases(
        questionID,
        1
      );

      let questionObject = {
        questionID: questionID,
        question: getQuestionResult.question_name,
        description: getQuestionResult.question_text,
        code: getQuestionResult.question_code,
        difficulty: getQuestionResult.difficulty,
        category: getQuestionResult.category,
        const: getQuestionResult.question_const
      };

      // senario: both users join (send sampleCases[0])
      if (!submitBoolean) {
        let sampleCase = smallSampleCases[0];
        questionObject.sampleCase = fs.readFileSync(sampleCase.test_case_path, {
          encoding: "utf-8"
        });
        questionObject.sampleExpected = sampleCase.test_result;
        return questionObject;
      }

      // senario: a user submits (send sampleCases)
      questionObject.smallSampleCases = smallSampleCases;
      questionObject.largeSampleCases = largeSampleCases;
      return questionObject;
    } catch (err) {
      console.log(err);
      throw errors.serverError;
    }
  },

  insertMatchDetail: async (matchID, user) => {
    try {
      let rowNumber = await matchModel.queryCountMatchDetailRows(matchID, user);
      // make sure there are no duplicated rows
      if (rowNumber[0]["COUNT (*)"] === 0) {
        await matchModel.queryInsertMatchDetail(matchID, user);
      }
    } catch (err) {
      console.log(err);
      throw errors.serverError;
    }
  },

  getMatchStartTime: async key => {
    try {
      let result = await matchModel.queryGetMatchStartTime(key);
      return result[0].match_start_time;
    } catch (err) {
      console.log(err);
    }
  },

  calculatePoints: async (matchKey, totalCorrectness, largeExecTimeArr) => {
    try {
      let perfPoints = 0;
      let largePassedNo = 0;
      // get questionID with matchKey
      let matchQuestionIdResult = await matchModel.queryGetMatchQuestion(
        matchKey
      );
      let questionID = matchQuestionIdResult[0].question_id;
      let largeThreshold = await questionModel.querySelectThresholdMs(
        questionID
      );
      for (let i = 0; i < largeThreshold.length; i++) {
        // large test failed: -1 in largeExecTimeArr
        if (
          parseInt(largeExecTimeArr[i]) >= 0 &&
          parseInt(largeExecTimeArr[i]) <= largeThreshold[i].threshold_ms
        ) {
          perfPoints += 100 / largeThreshold.length;
          largePassedNo += 1;
        }
      }
      let largePassed = `${largePassedNo}/${largeExecTimeArr.length}`;
      let points = (totalCorrectness + perfPoints) / 2;
      let calculated = {
        perfPoints,
        points,
        largePassed
      };
      return calculated;
    } catch (err) {
      console.log(err);
    }
  },

  updateMatchDetail: async (
    matchID,
    user,
    answer_code,
    small_correctness,
    large_correctness,
    correctness,
    large_passed,
    large_exec_time,
    performance,
    answer_time,
    points
  ) => {
    let data = {
      answer_code,
      small_correctness,
      large_correctness,
      correctness,
      large_passed,
      large_exec_time,
      performance,
      answer_time,
      points
    };
    console.log(data);
    try {
      await matchModel.queryUpdateMatchDetail(matchID, user, data);
      await matchModel.queryAddUserPoints(user, points);
    } catch (err) {
      console.log(err);
      throw errors.serverError;
    }
  },

  getMatchDetailPastExecTime: async (req, res) => {
    let questionID = req.query.questionid;
    try {
      let result = await matchModel.queryGetMatchDetailPastExecTime(questionID);
      if (!result[0]) {
        res.send("N/A");
        return;
      }
      let timeAdded = 0;
      for (let i = 0; i < result.length; i++) {
        timeAdded += parseInt(result[i].large_exec_time);
      }
      let avgTime = timeAdded / result.length;
      res.status(200).json(avgTime);
    } catch (err) {
      console.log(err);
      res
        .status(errors.serverError.statusCode)
        .send(errors.serverError.message);
    }
  },

  updateMatchWinner: async (key, winner) => {
    try {
      let status = 1; // match ended
      await matchModel.queryUpdateMatchWinner(key, winner, status);
    } catch (err) {
      console.log(err);
      throw errors.serverError;
    }
  },

  getMatchDetails: async (req, res) => {
    let matchID = req.query.matchid;
    try {
      let result = await matchModel.queryGetMatchDetails(matchID);
      res.status(200).json(result);
    } catch (err) {
      console.log(err);
      res
        .status(errors.serverError.statusCode)
        .send(errors.serverError.message);
    }
  },

  getMatchSummary: async (req, res) => {
    let userId = parseInt(req.query.userid);
    try {
      let result = await matchModel.queryGetMatchSummary(userId, 10);
      res.status(200).json(result);
    } catch (err) {
      console.log(err);
      res
        .status(errors.serverError.statusCode)
        .send(errors.serverError.message);
    }
  },

  getMatchHistory: async (req, res) => {
    let userId = parseInt(req.query.userid);
    try {
      let result = await matchModel.queryGetMatchSummary(userId, 100);
      res.status(200).json(result);
    } catch (err) {
      console.log(err);
      res
        .status(errors.serverError.statusCode)
        .send(errors.serverError.message);
    }
  },

  getMatchStatus: async key => {
    try {
      let result = await matchModel.queryGetMatchStatus(key);
      if (result.length > 0) {
        return result[0].match_status;
      }
      return 1;
    } catch (err) {
      console.log(err);
      throw errors.serverError;
    }
  },

  deleteTimedOutMatches: async (matchList, matchKey) => {
    let startTime = matchList.get(matchKey).start_time;
    if (startTime > 0 && Date.now() - startTime > 1000 * 60 * 60) {
      console.log("match timeout, deleting match in matchList...", matchKey);
      matchList.delete(matchKey);
      console.log("updating match status to 1...");
      try {
        await matchModel.queryUpdateMatchStatus(matchKey, 1);
      } catch (err) {
        console.log(err);
        throw errors.serverError;
      }
      console.log("matchList size after checking", matchList.size);
    }
  }
};
