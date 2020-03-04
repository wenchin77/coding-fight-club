const fs = require("fs");
const cryptoRandomString = require("crypto-random-string");
const matchModel = require("../models/match");
const questionModel = require("../models/question");

module.exports = {
  insertMatch: async (question_id, match_key) => {
    // generate a random no as match key to put in url
    let data = {
      question_id,
      match_key,
      match_status: -1
    };
    try {
      let result = await matchModel.queryInsertMatch(data);
      return result;
    } catch (err) {
      console.log(err);
    }
  },

  updateMatch: async (key, match_start_time, match_status) => {
    try {
      // can combine these two qeuries???
      let data = {
        match_start_time,
        match_status
      };
      let result = await matchModel.queryUpdateMatch(key, data);
      let getMatchID = await matchModel.queryGetMatchID(key);
      return getMatchID[0].id;
    } catch (err) {
      console.log(err);
    }
  },

  getMatchId: async key => {
    try {
      let getMatchID = await matchModel.queryGetMatchID(key);
      return getMatchID[0].id;
    } catch (err) {
      console.log(err);
    }
  },

  getKey: () => {
    let key = cryptoRandomString({ length: 10, type: "numeric" });
    return key;
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
    }
  },

  insertMatchDetail: async (matchID, user) => {
    // +++++++ transaction
    try {
      let rowNumber = await matchModel.queryCountMatchDetailRows(matchID, user);
      // make sure there are no duplicated rows
      if (rowNumber[0]["COUNT (*)"] === 0) {
        await matchModel.queryInsertMatchDetail(matchID, user);
      }
    } catch (err) {
      console.log(err);
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
    let perfPoints = 0;
    let largePassedNo = 0;
    // get questionID with matchKey
    let matchQuestionIdResult = await matchModel.queryGetMatchQuestion(
      matchKey
    );
    let questionID = matchQuestionIdResult[0].question_id;
    let largeThreshold = await questionModel.querySelectThresholdMs(questionID);
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
      let result = await matchModel.queryUpdateMatchDetail(matchID, user, data);
      await matchModel.queryAddUserPoints(user, points);
    } catch (err) {
      console.log(err);
    }
  },

  getMatchDetailPastExecTime: async question_id => {
    try {
      let result = await matchModel.queryGetMatchDetailPastExecTime(
        question_id
      );
      return result;
    } catch (err) {
      console.log(err);
      return false;
    }
  },

  updateMatchWinner: async (key, winner) => {
    try {
      let status = 1; // match ended
      let result = await matchModel.queryUpdateMatchWinner(key, winner, status);
    } catch (err) {
      console.log(err);
    }
  },

  getMatchDetails: async match_id => {
    try {
      let result = await matchModel.queryGetMatchDetails(match_id);
      return result;
    } catch (err) {
      console.log(err);
    }
  },

  getMatchSummary: async user_id => {
    try {
      let result = await matchModel.queryGetMatchSummary(user_id);
      return result;
    } catch (err) {
      console.log(err);
    }
  },

  getMatchHistory: async user_id => {
    try {
      let result = await matchModel.queryGetMatchHistory(user_id);
      return result;
    } catch (err) {
      console.log(err);
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
      return 1;
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
      }
      console.log("matchList size after checking", matchList.size);
    }
  }
};
