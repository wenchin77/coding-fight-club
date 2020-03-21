const matchController = require("./controllers/matchController");
const userController = require("./controllers/userController");
const matchUtil = require("./util/match");
const errors = require("./util/errors");
const socketio = require("socket.io");
const socket = {};
const onlineUsers = new Map(); // { userid: { username, time, inviting, invitation_accepted, invited} }
const tokenIdMapping = new Map(); // { token: userid }
const availableUsers = new Set(); // ([userid, userid, userid])
const inMatchUsers = new Set(); // ([userid, userid, userid])
const matchList = new Map(); // { matchKey: [userid, userid] }
const winnerCheck = new Map(); // { matchKey: [{ user, smallCorrectness, largeCorrectness, largePassed, largeExecTime, performance, answerTime, points }] }

socket.init = server => {
  const io = socketio.listen(server);
  console.log("socket initialized...");

  io.on("connection", async socket => {
    console.log("---------> io on connection");

    socket.on("userCount", () => {
      socket.emit("count", onlineUsers.size);
    });

    const token = socket.handshake.query.token;
    if (token === undefined) {
      console.log("no token in socket query");
      return;
    }
    const url = socket.request.headers.referer;
    console.log("user connected at", url);

    try {
      // add user in tokenIdMapping & onlineUsers
      const userInfo = await userController.getUserInfo(
        token,
        onlineUsers,
        tokenIdMapping
      );
      console.log("userInfo", userInfo);
    } catch (err) {
      socket.emit("customError", err.message);
      console.log(err);
      throw err;
    }

    socket.on("online", async token => {
      try {
        // add user in tokenIdMapping & onlineUsers
        const userInfo = await userController.getUserInfo(
          token,
          onlineUsers,
          tokenIdMapping
        );
        let user = userInfo.user;

        onlineUsers.get(user).time = Date.now();

        // add user in availableUsers (update if it already exists)
        availableUsers.add(user);

        // if the invitation's accepted notify the inviter
        if (onlineUsers.get(user).invitation_accepted !== 0) {
          socket.emit(
            "startStrangerModeMatch",
            onlineUsers.get(user).invitation_accepted
          );
          onlineUsers.get(user).invitation_accepted = 0;
        }

        // if rejected by stranger notify the inviter
        if (onlineUsers.get(user).inviting === -1) {
          socket.emit("rejected");
          // change back to 0
          onlineUsers.get(user).inviting = 0;
        }

        // if there's an invitation notify the invited
        let onlineUserDetail = onlineUsers.get(user);
        if (onlineUserDetail.invited.length > 0) {
          let invitations = onlineUserDetail.invited;
          for (let i = 0; i < invitations.length; i++) {
            console.log("emitting invited...", user);
            socket.emit("invited", invitations[i]);
          }
        }
      } catch (err) {
        socket.emit("customError", err.message);
        console.log(err);
        throw err;
      }
    });

    socket.on("joinMatch", async token => {
      console.log("---------> joinMatch");
      let matchKey = matchUtil.getMatchKey(socket.request.headers.referer);

      try {
        // check if match has ended, if so redirect
        let matchStatus = await matchController.getMatchStatus(matchKey);
        console.log("matchStatus", matchStatus);
        if (matchStatus > 0) {
          socket.emit("rejectUser", errors.matchEnded.message);
          return;
        }
        let userInfo = await userController.getUserInfo(
          token,
          onlineUsers,
          tokenIdMapping
        );
        console.log("userInfo", userInfo);
        let user = userInfo.user;
        let username = userInfo.username;

        // delete user from availableUsers to prevent invalid invitations
        availableUsers.delete(user);
        inMatchUsers.add(user);
        console.log(
          "delete user from availableUsers & add user in inMatchUsers"
        );

        // Reject user if match started & user isn't in the room
        if (matchList.has(matchKey)) {
          if (
            matchList.get(matchKey).start_time &&
            !matchList.get(matchKey).users.has(user)
          ) {
            socket.emit("rejectUser", errors.overTwoPeopleInAMatch.message);
            return;
          }
        }

        // Add a room & user if it doesn't exist
        if (!matchList.get(matchKey)) {
          console.log("adding a room & a user in matchList...");
          let matchListUsers = new Set();
          // Add user to the room list
          matchListUsers.add(user);
          matchList.set(matchKey, {
            users: matchListUsers,
            start_time: null
          });
        }

        console.log("adding a user in the room at matchList...");
        matchList.get(matchKey).users.add(user);
        console.log(
          "matchList.get(matchKey).size",
          matchList.get(matchKey).users.size
        );

        console.log('matchList', matchList)

        // Join room
        socket.join(matchKey, () => {
          console.log(`Socket: ${user} joined ${matchKey}`);
          let joinMessage = {
            user: user,
            message: `${username} joined the match.`
          };
          io.to(matchKey).emit("joinLeaveMessage", joinMessage);
        });

        // Wait for opponent if the match hasn't started
        if (matchList.get(matchKey).users.size === 1) {
          socket.emit(
            "waitForOpponent",
            "Hey there, we are waiting for your opponent to join!"
          );
          return;
        }

        // when there are 2 people in the room
        let questionObject = await matchController.getQuestionDetail(
          matchKey,
          false
        );

        // send user info to display
        const iterator1 = matchList.get(matchKey).users.values();
        let userid1 = iterator1.next().value;
        let userid2 = iterator1.next().value;

        console.log(
          onlineUsers.get(userid1).username,
          onlineUsers.get(userid2).username
        );

        // get or insert match start time (only insert once at the start)
        let matchStartTime;
        if (matchList.get(matchKey).start_time) {
          console.log("match start time already inserted...");
          matchStartTime = matchList.get(matchKey).start_time;
          console.log("matchStartTime", matchStartTime);
        } else {
          console.log("inserting match start time....");
          matchStartTime = Date.now();
          // add start_time to matchList
          matchList.get(matchKey).start_time = matchStartTime;
          let status = 0;
          let matchID = await matchController.updateMatch(
            matchKey,
            matchStartTime,
            status
          );
          console.log("matchStartTime", matchStartTime);
          // insert into match_detail (make sure there are no duplicated rows)
          await matchController.insertMatchDetail(matchID, userid1);
          await matchController.insertMatchDetail(matchID, userid2);
        }

        // send start info to display in frontend
        let startInfo = {
          user1: {
            user: userid1,
            username: onlineUsers.get(userid1).username
          },
          user2: {
            user: userid2,
            username: onlineUsers.get(userid2).username
          },
          startTime: matchStartTime,
          question: questionObject
        };
        console.log("socket on join, startInfo", startInfo);
        io.to(matchKey).emit("startMatch", startInfo);
      } catch (err) {
        socket.emit("customError", err.message);
        throw err;
      }
    });

    socket.on("runCode", async data => {
      console.log("---------> runCode");
      let matchKey = matchUtil.getMatchKey(socket.request.headers.referer);

      try {
        let matchStatus = await matchController.getMatchStatus(matchKey);
        console.log("matchStatus", matchStatus);
        if (matchStatus > 0) {
          socket.emit("rejectUser", errors.matchEnded.message);
          return;
        }
      } catch (err) {
        socket.emit("customError", err.message);
        throw err;
      }

      let code = data.code;
      let user = tokenIdMapping.get(data.token);
      let testAll = data.test;
      let test = testAll.split("\n");
      let difficulty = data.difficulty;
      let questionConst = data.questionConst;
      let sampleCaseExpected = data.sampleCaseExpected;
      let finalCode = matchUtil.putTogetherCodeOnRun(
        code,
        questionConst,
        sampleCaseExpected,
        test
      );
      matchUtil.setUserCodeFile(matchKey, user, finalCode);

      let codeResult = {};
      try {
        let childResult = await matchUtil.runCodeInChildProcess(
          matchKey,
          user,
          difficulty,
          10
        );
        let updatedChildResult = matchUtil.addSampleTestResult(childResult);
        codeResult = {
          user: user,
          output: updatedChildResult
        };
      } catch (e) {
        codeResult = {
          user: user,
          output: e
        };
      }
      io.to(matchKey).emit("codeResult", codeResult);
    });

    socket.on("submit", async data => {
      console.log("---------> submit");
      let matchKey = matchUtil.getMatchKey(socket.request.headers.referer);

      // check if match has ended, if so redirect
      try {
        let matchStatus = await matchController.getMatchStatus(matchKey);
        console.log("matchStatus", matchStatus);
        if (matchStatus > 0) {
          socket.emit("rejectUser", errors.matchEnded.message);
          return;
        }
      } catch (err) {
        socket.emit("customError", err.message);
        throw err;
      }

      let user = tokenIdMapping.get(data.token);
      let username = onlineUsers.get(user).username;
      console.log("matchKey", matchKey);
      console.log("user", user);
      console.log("username", username);

      let submitTime = matchUtil.checkSubmitTime(winnerCheck, matchKey, user);
      if (submitTime > 0) {
        socket.emit("alreadySubmitted", errors.alreadySubmitted.message);
        return;
      }

      let code = data.code;
      let questionObject;
      try {
        questionObject = await matchController.getQuestionDetail(
          matchKey,
          true
        );
      } catch (err) {
        socket.emit("customError", err.message);
        throw err;
      }
      let questionConst = questionObject.const;
      let smallTestCases = questionObject.smallSampleCases;
      let difficulty = questionObject.difficulty;

      // put together the code & run one test case at a time
      let smallTestCasesNumber = smallTestCases.length;
      let smallPassedCasesNumber = 0;
      for (let i = 0; i < smallTestCases.length; i++) {
        let testCaseFinalCode = await matchUtil.putTogetherCodeOnSubmit(
          code,
          questionConst,
          smallTestCases[i]
        );

        // 按不同 user 存到 ./sessions js files
        matchUtil.setUserCodeFile(matchKey, user, testCaseFinalCode);
        // Run code in child process
        try {
          let childResult = await matchUtil.runCodeInChildProcess(
            matchKey,
            user,
            difficulty,
            20
          );

          // compare sample test case result
          let childResultSplited = childResult.split("\n");
          let testOutput = childResultSplited[0];
          let testExpectedOutput = smallTestCases[i].test_result;

          if (testOutput == testExpectedOutput) {
            smallPassedCasesNumber += 1;
          }
        } catch (e) {
          if (e === 'EXECUTION TIMED OUT' || e === 'OUT OF MEMORY') {
            console.log('EXECUTION TIMED OUT or OUT OF MEMORY: stop running the code for other small test cases')
            break;
          }
          console.log(e);          
        }
      }

      let largeTestCases = questionObject.largeSampleCases;
      let largeTestCasesNumber = largeTestCases.length;
      let largePassedCasesNumber = 0;
      let largeTestExecTimeSum = 0;
      let largeExecTimeArr = []; // 這個跟小測資不同！
      for (let i = 0; i < largeTestCases.length; i++) {
        let testCaseFinalCode = await matchUtil.putTogetherCodeOnSubmit(
          code,
          questionConst,
          largeTestCases[i]
        );
        // 按不同 user 存到 ./sessions js files
        matchUtil.setUserCodeFile(matchKey, user, testCaseFinalCode);
        // Run code in child process
        try {
          let childResult = await matchUtil.runCodeInChildProcess(
            matchKey,
            user,
            difficulty,
            80
          );

          // compare sample test case result
          let childResultSplited = childResult.split("\n");
          let testOutput = childResultSplited[0];
          // get exec time (check if it's ms or s)
          let testExecTime =
            childResultSplited[1].slice(-2) == "ms"
              ? childResultSplited[1].split("Time: ")[1].split("m")[0]
              : childResultSplited[1].split("Time: ")[1].split("s")[0] * 1000;
          let testExpectedOutput = largeTestCases[i].test_result;

          if (testOutput == testExpectedOutput) {
            largePassedCasesNumber += 1;
            largeTestExecTimeSum += parseFloat(testExecTime);
            largeExecTimeArr.push(testExecTime);
          } else {
            // large test failed: -1 in largeExecTimeArr
            largeExecTimeArr.push(-1);
          }
        } catch (e) {
          if (e === 'EXECUTION TIMED OUT' || e === 'OUT OF MEMORY') {
            console.log('EXECUTION TIMED OUT or OUT OF MEMORY: stop running the code for other large test cases')
            break;
          }
          console.log(e);          
        }
      }

      // calculate passed test cases
      let smallCorrectness = `${smallPassedCasesNumber}/${smallTestCasesNumber}`;
      let largeCorrectness = `${largePassedCasesNumber}/${largeTestCasesNumber}`;
      let correctness =
        100 *
        parseFloat(
          (smallPassedCasesNumber + largePassedCasesNumber) /
            (smallTestCasesNumber + largeTestCasesNumber)
        );

      // calculate exec time (counting with passed tests only)
      let largeExecTime;
      if (largePassedCasesNumber === 0) {
        largeExecTime = null;
      } else {
        largeExecTime = largeTestExecTimeSum / largePassedCasesNumber;
      }

      let startTime = matchList.get(matchKey).start_time;
      let answerTime = (Date.now() - startTime) / 1000; // in seconds

      try {
        let calculated = await matchController.calculatePoints(
          matchKey,
          correctness,
          largeExecTimeArr
        );
        let performance = calculated.perfPoints;
        let points = calculated.points;
        let largePassed = calculated.largePassed;

        let matchID = await matchController.getMatchId(matchKey);
        await matchController.updateMatchDetail(
          matchID,
          user,
          code,
          smallCorrectness,
          largeCorrectness,
          correctness,
          largePassed,
          largeExecTime,
          performance,
          answerTime,
          points
        );

        // update user table: + points (and level table if needed)
        await userController.updateUserPointsLevel(user);

        let result = {
          user,
          smallCorrectness,
          largePassed,
          correctness,
          largeCorrectness,
          largeExecTime,
          performance,
          answerTime,
          points
        };

        if (!winnerCheck.has(matchKey)) {
          winnerCheck.set(matchKey, []);
        }
        winnerCheck.get(matchKey).push(result);

        matchUtil.deleteFile(matchKey, user);

        let submitNumber = winnerCheck.get(matchKey).length;
        console.log("submitNumber", submitNumber);

        if (submitNumber < 2) {
          let submitMessage = {
            user,
            message: `${username} submitted the code! We're waiting for your submission.`
          };
          io.to(matchKey).emit("waitForMatchEnd", submitMessage);
          return;
        }

        let winner = matchUtil.getWinner(winnerCheck, matchKey);
        await matchController.updateMatchWinner(matchKey, winner);
        io.to(matchKey).emit("endMatch", matchKey);

        inMatchUsers.delete(user);

        winnerCheck.delete(matchKey);
        console.log("winnerCheck.size", winnerCheck.size);

        console.log("match ended, deleting match in matchList...", matchKey);
        matchList.delete(matchKey);
        console.log("matchList.size", matchList.size);
      } catch (err) {
        socket.emit("customError", err.message);
        throw err;
      }
    });

    socket.on("getStranger", async data => {
      // data: {token, category, difficulty}
      console.log("---------> getStranger");
      let token = data.token;
      let inviterId = tokenIdMapping.get(token);
      let inviterName = onlineUsers.get(inviterId).username;
      if (onlineUsers.get(inviterId).inviting === 1) {
        socket.emit(
          "noStranger",
          "You can't send out more than one invitation within a minute!"
        );
        return;
      }
      let stranger = matchUtil.getStranger(inviterId, availableUsers);
      if (!stranger) {
        socket.emit("noStranger", errors.noStrangerFound.message);
        return;
      }
      console.log("stranger id", stranger);
      // add to invitations
      let invitation = {
        inviter: inviterId,
        inviterName,
        category: data.category,
        difficulty: data.difficulty,
        time: Date.now()
      };
      console.log("invitation", invitation);
      onlineUsers.get(stranger).invited.push(invitation);

      // update inviter's data
      onlineUsers.get(inviterId).inviting = 1;
      console.log("socket on getStranger, onlineUsers", onlineUsers);
      socket.emit("stranger", invitation);
    });

    socket.on("strangerAccepted", data => {
      console.log("---------> strangerAccepted");
      let user = tokenIdMapping.get(data.token);
      let inviterId = data.inviterId;
      onlineUsers.get(inviterId).invitation_accepted = data.url;
      onlineUsers.get(inviterId).inviting = 0;
      console.log("deleting invitations at strangerAccepted...");
      onlineUsers.get(user).invited = [];
    });

    socket.on("strangerRejected", data => {
      console.log("---------> strangerRejected");
      let token = data.token;
      let user = tokenIdMapping.get(token);
      let inviterId = data.inviterId;
      onlineUsers.get(inviterId).inviting = -1;
      console.log("deleting invitation at strangerRejected...");
      for (let i = 0; i < onlineUsers.get(user).invited.length; i++) {
        if (onlineUsers.get(user).invited[i].inviter == inviterId) {
          onlineUsers.get(user).invited.splice(i, 1);
          break;
        }
      }
      console.log("onlineUsers after strangerRejected ---- ", onlineUsers);
    });

    socket.on("strangerTimedOut", token => {
      console.log("---------> strangerTimedOut");
      let user = tokenIdMapping.get(token);
      onlineUsers.get(user).inviting = -1;
      console.log("deleting invitation at strangerTimedOut...");
      for (let i = 0; i < onlineUsers.get(user).invited.length; i++) {
        if (onlineUsers.get(user).invited[i].inviter == inviterId) {
          onlineUsers.get(user).invited.splice(i, 1);
          break;
        }
      }
      console.log("onlineUsers after strangerTimedOut ---- ", onlineUsers);
    });

    socket.on("getMatchId", async key => {
      try {
        let matchId = await matchController.getMatchId(key);
        socket.emit("matchId", matchId);
      } catch (err) {
        socket.emit("customError", err.message);
        throw err;
      }
    });

    socket.on("exit", async token => {
      console.log("---------> exit");
      let matchKey = matchUtil.getMatchKey(url);
      let user = tokenIdMapping.get(token);
      console.log("user on exit", user);
      try {
        let username = onlineUsers.get(user).username;
        let leaveMessage = {
          user,
          message: `${username} left the match. You will still get your points if you submit your solution.`
        };
        io.to(matchKey).emit("joinLeaveMessage", leaveMessage);
      
        let matchID = await matchController.getMatchId(matchKey);
        let code = "// You did not submit in this match";
        let smallCorrectness = "N/A";
        let largeCorrectness = "N/A";
        let correctness = 0;
        let largePassed = "N/A";
        let largeExecTime = null;
        let performance = 0;
        let answerTime = 0;
        let points = 0;
        // update match_detail
        await matchController.updateMatchDetail(
          matchID,
          user,
          code,
          smallCorrectness,
          largeCorrectness,
          correctness,
          largePassed,
          largeExecTime,
          performance,
          answerTime,
          points
        );

        // add / update winnerCheck
        if (!winnerCheck.has(matchKey)) {
          winnerCheck.set(matchKey, []);
          let result = {
            user,
            smallCorrectness,
            largePassed,
            correctness,
            largeCorrectness,
            largeExecTime,
            performance,
            answerTime,
            points
          };
          winnerCheck.get(matchKey).push(result);
          // fs 刪掉 ./sessions js files
          matchUtil.deleteFile(matchKey, user);
          return;
        }

        if (winnerCheck.get(matchKey)[0].user === user) {
          console.log("User exited before", winnerCheck);
          socket.emit("exitMultipleTimes");
          return;
        }

        // auto end matches where 1 user submit then 1 user left OR both exit
        let result = {
          user,
          smallCorrectness: null,
          largePassed: null,
          correctness: null,
          largeCorrectness: null,
          largeExecTime: null,
          performance: null,
          answerTime: 0,
          points: 0
        };
        winnerCheck.get(matchKey).push(result);

        let winner = matchUtil.getWinner(winnerCheck, matchKey);

        // update match_table: winner
        await matchController.updateMatchWinner(matchKey, winner);
        io.to(matchKey).emit("endMatch", matchKey);
        console.log("winnerCheck after match", winnerCheck);

        socket.leave(matchKey); // leave socket room

        inMatchUsers.delete(user);

        winnerCheck.delete(matchKey);
        console.log("winnerCheck.size", winnerCheck.size);

        console.log("match ended, deleting match in matchList...", matchKey);
        matchList.delete(matchKey);
        console.log("matchList.size", matchList.size);
      } catch (err) {
        socket.emit("customError", err.message);
        throw err;
      }
    });

    socket.on("disconnect", async () => {
      console.log("---------> disconnect");
      try{
        let token = socket.handshake.query.token;
        if (token === undefined) {
          console.log("no token in socket query");
          return;
        };
        let url = socket.request.headers.referer;
        let matchKey = matchUtil.getMatchKey(url);
        console.log(url);
        if (url.includes("/match/") && matchList.has(matchKey)) {
          console.log("user left match page");
          // if time's up delete match from matchList
          await matchController.deleteTimedOutMatches(matchList, matchKey);
        }
        console.log("user disconnected at", url);
      } catch (err) {
        socket.emit("customError", err.message);
        throw err;
      }
    });
  });
};

// remove timeout users in onlineUserList
setInterval(async () => {
  // delete users that are idle & not in a match
  matchUtil.deleteTimedOutUsers(
    onlineUsers,
    availableUsers,
    inMatchUsers,
    tokenIdMapping
  );
  // delete timed out matches
  for (let matchKey of matchList.keys()) {
    matchController.deleteTimedOutMatches(matchList, matchKey);
  }
}, 1000 * 10);

setInterval(()=>{
  console.log("onlineUsers size", onlineUsers.size);
  console.log("availableUsers", availableUsers);
}, 1000 * 60)

module.exports = socket;
