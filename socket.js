const fs = require("fs");
const matchController = require("./controllers/matchController");
const questionController = require("./controllers/questionController");
const userController = require("./controllers/userController");

// child process setup for code execution
const { spawn } = require("child_process");

// socket.io setup for live terminal result
const socketio = require("socket.io");
const socket = {};

// online user check data
const onlineUsers = new Map(); // { userid: { username, time, inviting, invitation_accepted, invited} }
const availableUsers = new Set(); // ([userid, userid, userid])
const tokenIdMapping = new Map(); // { token: userid }

// match data
const matchList = new Map(); // { matchKey: [userid, userid] }
const winnerCheck = new Map(); // on submit: 換位子？？？ { matchKey: [{ user, smallCorrectness, largeCorrectness, largePassed, largeExecTime, performance, answerTime, points }] }

socket.init = server => {
  const io = socketio.listen(server);
  console.log("socket initialized...");

  io.on("connection", async socket => {
    console.group("---------> io on connection");
    let token = socket.handshake.query.token;
    // sometimes token is undefined (can't get query), why +++++++++++++++
    if (token === undefined) {
      console.log("我他媽拿不到 token");
      return;
    }
    let url = socket.request.headers.referer;
    console.log("user connected at", url);

    // add user in tokenIdMapping & onlineUsers
    let userInfo = await getUserInfo(token);
    console.log("userInfo", userInfo);

    console.groupEnd();

    socket.on("online", async token => {
      console.group("---------> online");
      let userInfo = await getUserInfo(token);
      console.log("userInfo", userInfo);
      let user = userInfo.user;

      // update active time at onlineUsers
      onlineUsers.get(user).time = Date.now();

      // add user in availableUsers (update if it already exists)
      availableUsers.add(user);
      console.log("availableUsers", availableUsers);

      // if the invitation's accepted notify the inviter
      if (onlineUsers.get(user).invitation_accepted !== 0) {
        console.log(
          "invitation_accepted === match url, emitting startStrangerModeMatch..."
        );
        socket.emit(
          "startStrangerModeMatch",
          onlineUsers.get(user).invitation_accepted
        );
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
        console.log("onlineUserDetail ====", onlineUserDetail);
        let invitations = onlineUserDetail.invited;
        for (let i = 0; i < invitations.length; i++) {
          console.log(invitations[i]);
          console.log("emitting invited...");
          socket.emit("invited", invitations[i]);          
        }
        // delete invite to prevent duplicated invitations
        console.log('deleting invitations after emitting...');
        onlineUsers.get(user).invited = [];
      }

      console.log("onlineUsers size before checking", onlineUsers.size);
      console.log("tokenIdMapping size before checking", tokenIdMapping.size);
      console.log("availableUsers size before checking", availableUsers.size);
      console.log("matchList size before checking", matchList.size);
      console.groupEnd();
    });

    socket.on("joinMatch", async token => {
      console.group("---------> joinMatch");
      let matchKey = getMatchKey(socket.request.headers.referer);

      // check if match has ended, if so redirect
      let matchStatus = await getMatchStatus(matchKey);
      console.log("matchStatus", matchStatus);
      if (matchStatus > 0) {
        socket.emit("rejectUser", "This match has ended. Start a new one now!");
        return;
      }

      let userInfo = await getUserInfo(token);
      console.log("userInfo", userInfo);
      let user = userInfo.user;
      let username = userInfo.username;

      // delete user from availableUsers to prevent invalid invitations
      availableUsers.delete(user);
      console.log(
        "delete user from availableUsers to prevent invalid invitations"
      );

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

      console.log("socket on join, matchList", matchList);
      console.log(
        "matchList.get(matchKey).users",
        matchList.get(matchKey).users
      );
      console.log(
        "matchList.get(matchKey).size",
        matchList.get(matchKey).users.size
      );

      console.log(
        "matchList.get(matchKey).users.has(user) ===",
        matchList.get(matchKey).users.has(user)
      );
      // Reject user if match started & user isn't in the room
      if (
        matchList.get(matchKey).start_time &&
        !matchList.get(matchKey).users.has(user)
      ) {
        socket.emit(
          "rejectUser",
          "Oops, there are already two people in this match!"
        );
        return;
      }

      console.log("adding a room in matchList...");
      matchList.get(matchKey).users.add(user);
      console.log("socket on join, matchList", matchList);
      console.log(
        "matchList.get(matchKey).size",
        matchList.get(matchKey).users.size
      );

      // Join room
      socket.join(matchKey, () => {
        console.log(`Socket: ${user} joined ${matchKey}`);
        let joinMessage = {
          user: user,
          message: `${username} joined the match.`
        };
        io.to(matchKey).emit("joinLeaveMessage", joinMessage);
      });

      // Wait for opponent if there's match hasn't started
      if (matchList.get(matchKey).users.size === 1) {
        socket.emit(
          "waitForOpponent",
          "Hey there, we are waiting for your opponent to join!"
        );
        return;
      }

      // when there are 2 people in the room
      let questionObject = await getQuestionDetail(matchKey, false);

      // send user info to display
      const iterator1 = matchList.get(matchKey).users.values();
      let userid1 = iterator1.next().value;
      let userid2 = iterator1.next().value;

      console.log(userid1, userid2);

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

      console.groupEnd();
    });

    socket.on("runCode", async data => {
      console.group("---------> runCode");
      let matchKey = getMatchKey(socket.request.headers.referer);
      let code = data.code;
      let user = tokenIdMapping.get(data.token);
      let testAll = data.test;
      let test = testAll.split("\n");
      let difficulty = data.difficulty;
      let questionConst = data.questionConst;
      let sampleCaseExpected = data.sampleCaseExpected;

      // put together the code for running
      let finalCode = putTogetherCodeOnRun(
        code,
        questionConst,
        sampleCaseExpected,
        test
      );

      // 按不同 user 存到 ./sessions js files
      setUserCodeFile(matchKey, user, finalCode);

      let codeResult = {};
      // Run code in child process
      try {
        let childResult = await runCodeInChildProcess(
          matchKey,
          user,
          difficulty,
          10
        );

        // give sample test case result
        let sampleSplited = childResult.split("\n");
        let sampleOutput = sampleSplited[1].split(": ")[1];
        let sampleExpected = sampleSplited[2].split(": ")[1];

        // add sample test result to childResult
        if (sampleOutput == sampleExpected) {
          childResult = "SAMPLE TEST PASSED\n" + childResult;
        } else {
          childResult = "SAMPLE TEST FAILED\n" + childResult;
        }

        // 回丟一個物件帶有 user 資料以區分是自己還是對手的結果
        codeResult = {
          user: user,
          output: childResult
        };
      } catch (e) {
        codeResult = {
          user: user,
          output: e
        };
      }
      // send an event to everyone in the room including the sender
      io.to(matchKey).emit("codeResult", codeResult);
      console.groupEnd();
    });

    socket.on("submit", async data => {
      console.group("---------> submit");
      let matchKey = getMatchKey(socket.request.headers.referer);
      let user = tokenIdMapping.get(data.token);
      let username = onlineUsers.get(user).username;
      console.log("matchKey", matchKey);
      console.log("user", user);
      console.log("username", username);

      // Check if the user submitted before
      let submitTime = 0;
      console.log("winnerCheck -------", winnerCheck);
      if (winnerCheck.has(matchKey)) {
        console.log(
          "winnerCheck.get(matchKey)[0]",
          winnerCheck.get(matchKey)[0]
        );

        for (let i = 0; i < winnerCheck.get(matchKey).length; i++) {
          if (winnerCheck.get(matchKey)[i].user === user) {
            submitTime += 1;
            console.log(
              "winnerCheck[matchKey][i].user --- ",
              winnerCheck.get(matchKey)[i].user
            );
          }
        }
      }
      console.log("submitTime ---", submitTime);
      if (submitTime > 0) {
        socket.emit("alreadySubmitted");
        return;
      }

      let code = data.code;
      let questionObject = await getQuestionDetail(matchKey, true);
      let questionConst = questionObject.const;
      let smallTestCases = questionObject.smallSampleCases;
      let difficulty = questionObject.difficulty;

      // put together the code & run one test case at a time
      let smallTestCasesNumber = smallTestCases.length;
      let smallPassedCasesNumber = 0;
      for (let i = 0; i < smallTestCases.length; i++) {
        let testCaseFinalCode = putTogetherCodeOnSubmit(
          code,
          questionConst,
          smallTestCases[i]
        );

        // 按不同 user 存到 ./sessions js files
        setUserCodeFile(matchKey, user, testCaseFinalCode);
        // Run code in child process
        try {
          let childResult = await runCodeInChildProcess(
            matchKey,
            user,
            difficulty,
            20
          );

          // give sample test case result
          let childResultSplited = childResult.split("\n");
          let testOutput = childResultSplited[0];
          let testExpectedOutput = smallTestCases[i].test_result;

          // add sample test result to childResult
          if (testOutput == testExpectedOutput) {
            console.log(`test case [${i}] passed`);
            smallPassedCasesNumber += 1;
          } else {
            console.log(`test case [${i}] failed`);
          }
        } catch (e) {
          console.log(e);
        }
      }

      // 類似的扣：之後跟上面的整理 +++++++++++++++
      let largeTestCases = questionObject.largeSampleCases;
      let largeTestCasesNumber = largeTestCases.length;
      let largePassedCasesNumber = 0;
      let largeTestExecTimeSum = 0;
      let largeExecTimeObj = []; // 這個跟小測資不同！
      for (let i = 0; i < largeTestCases.length; i++) {
        let testCaseFinalCode = putTogetherCodeOnSubmit(
          code,
          questionConst,
          largeTestCases[i]
        );
        // 按不同 user 存到 ./sessions js files
        setUserCodeFile(matchKey, user, testCaseFinalCode);
        // Run code in child process
        try {
          let childResult = await runCodeInChildProcess(
            matchKey,
            user,
            difficulty,
            80
          );

          // give sample test case result
          let childResultSplited = childResult.split("\n");
          let testOutput = childResultSplited[0];
          // get exec time (check if it's ms or s)
          let testExecTime =
            childResultSplited[1].slice(-2) == "ms"
              ? childResultSplited[1].split("Time: ")[1].split("m")[0]
              : childResultSplited[1].split("Time: ")[1].split("s")[0] * 1000;
          let testExpectedOutput = largeTestCases[i].test_result;

          // add sample test result to childResult
          if (testOutput == testExpectedOutput) {
            console.log(`test case [${i}] passed`);
            largePassedCasesNumber += 1;
            largeTestExecTimeSum += parseFloat(testExecTime);
            largeExecTimeObj.push(testExecTime);
          } else {
            console.log(`test case [${i}] failed`);
            largeExecTimeObj.push("failed");
          }
        } catch (e) {
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

      // calculate answer time
      let startTime = matchList.get(matchKey).start_time;
      let answerTime = (Date.now() - startTime) / 1000; // in seconds

      let matchID = await matchController.getMatchId(matchKey);
      // rate correctness, performance
      let calculated = await calculatePoints(
        matchKey,
        correctness,
        largeExecTimeObj
      );
      let performance = calculated.perfPoints;
      let points = calculated.points;
      let largePassed = calculated.largePassed;
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

      // update user table: + points (and level table if needed)
      await userController.updateUserPointsLevel(user);

      // update winnerCheck {} for performance points calculation
      if (!winnerCheck.has(matchKey)) {
        winnerCheck.set(matchKey, []);
      }
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
      deleteFile(matchKey, user);

      // check 自己是第幾個 insert match_detail 的人
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

      let winner = await getWinner(winnerCheck, matchKey);
      let loser;
      if (winnerCheck.get(matchKey)[0].user === winner) {
        loser = winnerCheck.get(matchKey)[1].user;
      } else {
        loser = winnerCheck.get(matchKey)[0].user;
      }

      // update match_table: winner
      await matchController.updateMatchWinner(matchKey, winner);

      io.to(matchKey).emit("endMatch", matchKey);
      console.log("winnerCheck after match", winnerCheck);

      winnerCheck.delete(matchKey);
      console.log("winnerCheck.size", winnerCheck.size);

      console.log("match ended, deleting match in matchList...", matchKey);
      matchList.delete(matchKey);
      console.log("matchList.size", matchList.size);

      console.groupEnd();
    });

    socket.on("getStranger", async data => {
      // data: {token, category, difficulty}
      console.group("---------> getStranger");
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

      let stranger = await getStranger(inviterId);
      if (!stranger) {
        socket.emit(
          "noStranger",
          "Ugh everyone seems to be busy playing in matches right now. Try again later or invite a friend instead?"
        );
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
      console.groupEnd();
    });

    socket.on("strangerAccepted", data => {
      console.group("---------> strangerAccepted");
      let id = data.inviterId;
      console.log("data", data);
      onlineUsers.get(id).invitation_accepted = data.url;
      console.log("onlineUsers.get(id)", onlineUsers.get(id));
      onlineUsers.get(id).inviting = 0;
      console.groupEnd();
    });

    socket.on("strangerRejected", data => {
      console.group("---------> strangerRejected");
      console.log(data);
      let token = data.token;
      let user = tokenIdMapping.get(token);
      let inviterId = data.inviterId;
      for (let i = 0; i < onlineUsers.get(user).invited.length; i++) {
        if (onlineUsers.get(user).invited[i].inviter == inviterId) {
          onlineUsers.get(user).invited.splice(i, 1);
          break;
        }
      }
      onlineUsers.get(inviterId).inviting = -1;
      console.log("onlineUsers after strangerRejected ---- ", onlineUsers);

      console.groupEnd();
    });

    socket.on("exit", async token => {
      // do something after user exits a match!++++++++++++++
      console.group("---------> exit");
      let matchKey = getMatchKey(url);
      let user = tokenIdMapping.get(token);
      console.log("user on exit", user);
      try {
        let username = onlineUsers.get(user).username;
        let leaveMessage = {
          user,
          message: `${username} left the match. You will still get your points if you submit your solution.`
        };
        io.to(matchKey).emit("joinLeaveMessage", leaveMessage);
      } catch (err) {
        console.log(err);
      } finally {
        let matchID = await matchController.getMatchId(matchKey);
        let code = "N/A";
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
          deleteFile(matchKey, user);
          return;
        }

        if (winnerCheck.get(matchKey)[0].user === user) {
          console.log('User existed before', winnerCheck);
          socket.emit('exit')
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

        let winner = await getWinner(winnerCheck, matchKey);
        if (winnerCheck.get(matchKey)[0].user === winner) {
          loser = winnerCheck.get(matchKey)[1].user;
        } else {
          loser = winnerCheck.get(matchKey)[0].user;
        }

        // update match_table: winner
        await matchController.updateMatchWinner(matchKey, winner);

        socket.emit('exit')
        console.log("winnerCheck after match", winnerCheck);

        socket.leave(matchKey); // leave socket room

        winnerCheck.delete(matchKey);
        console.log("winnerCheck.size", winnerCheck.size);

        console.log("match ended, deleting match in matchList...", matchKey);
        matchList.delete(matchKey);
        console.log("matchList.size", matchList.size);
      }

      console.groupEnd();
    });

    socket.on("disconnect", () => {
      console.group("---------> disconnect");
      let token = socket.handshake.query.token;
      // sometimes token is undefined (can't get query), why +++++++++++++++
      if (token === undefined) {
        console.log("我他媽拿不到 token");
        return;
      }

      let url = socket.request.headers.referer;
      let matchKey = getMatchKey(url);
      console.log(url);
      if (url.includes("/match/") && matchList.has(matchKey)) {
        console.log("user left match page");
        // if time's up delete match from matchList
        let startTime = matchList.get(matchKey).start_time;
        if (Date.now() - startTime > 1000 * 60 * 60) {
          console.log(
            "match timeout, deleting match in matchList...",
            matchKey
          );
          matchList.delete(matchKey);
          console.log("matchList size after checking", matchList.size);
        }
      }
      console.log("matchList", matchList);
      console.log("user disconnected at", url);

      console.groupEnd();
    });
  });
};

// remove timeout users (1 min with no ping) in onlineUserList
// check every 60 sec
setInterval(async () => {
  console.group("---------> setInterval");

  // delete idle users
  for (let userid of onlineUsers.keys()) {
    let value = onlineUsers.get(userid);
    if (Date.now() - value.time > 1000 * 60) {
      console.log(
        "user timeout, deleting user in onlineUsers, availableUsers and tokenIdMapping...",
        userid
      );
      onlineUsers.delete(userid);
      console.log("onlineUsers size after checking", onlineUsers.size);
      availableUsers.delete(userid);
      console.log("availableUsers size after checking", availableUsers.size);
      for (let token of tokenIdMapping.keys()) {
        let value = tokenIdMapping.get(token);
        if (value === userid) {
          tokenIdMapping.delete(token);
        }
      }
      console.log("tokenIdMapping size after checking", tokenIdMapping.size);
    }
  }

  // delete timed out matches
  for (let matchKey of matchList.keys()) {
    let value = matchList.get(matchKey);
    console.log("matchKey", matchKey);
    if (
      value.start_time > 0 &&
      Date.now() - value.start_time > 1000 * 60 * 60
    ) {
      console.log("match timeout, deleting match in matchList...", matchKey);
      matchList.delete(matchKey);
      console.log("updating match status to 1...");
      try {
        await matchController.updateMatchStatus(matchKey, 1);
      } catch (err) {
        console.log(err);
      }
      console.log("matchList size after checking", matchList.size);
    }
  }

  console.groupEnd();
}, 1000 * 60); // 之後調整成長一點

async function getUserInfo(token) {
  let user;
  let username;
  let userObj;
  try {
    if (!tokenIdMapping.has(token)) {
      console.log("Cannot find user at tokenIdMapping, selecting from db...");
      let result = await userController.selectUserInfoByToken(token);
      user = result[0].id;
      username = result[0].user_name;
      userObj = {
        username,
        time: Date.now(),
        inviting: 0,
        invitation_accepted: 0,
        invited: []
      };
      console.log(user, username);
      console.log("inserting onlineUsers...");
      onlineUsers.set(user, userObj);
      console.log("inserting tokenIdMapping...");
      tokenIdMapping.set(token, user);
      console.log("onlineUsers", onlineUsers);
      console.log("onlineUsers size", onlineUsers.size);
      return { user, username };
    }
    console.log("Found user at tokenIdMapping");
    user = tokenIdMapping.get(token);
    username = onlineUsers.get(user).username;
    return { user, username };
  } catch (err) {
    console.log(err);
  }
}



let getStranger = (inviterId) => {
  if (availableUsers.size <= 1) {
    console.log("only 1 user online now...");
    return false;
  }

  console.log('Array.from(availableUsers)',Array.from(availableUsers))
  let index = availableUsers.size.length * Math.random() << 0;
  // let index = availableUsers.size * Math.random()

  let strangerId = Array.from(availableUsers)[index];
  console.log("index", index);
  console.log("strangerId", strangerId);
  console.log("inviterId (my id)", inviterId);

  if (strangerId === inviterId) {
    console.log("stranger === me, find the next person");
    // if token belongs to me, find the next person
    let newIndex = (index + 1) % availableUsers.size;
    console.log("newIndex", newIndex);
    let newStrangerId = Array.from(availableUsers)[newIndex];
    console.log("newStrangerId", newStrangerId);
    // let newResult = onlineUsers.get(newStrangerId);
    // console.log({ result: newResult, strangerId: newStrangerId });
    return newStrangerId;
  } else {
    // let result = onlineUsers.get(newStrangerId);
    // console.log({ result, strangerId });
    return strangerId;
  }
};

const getMatchStatus = async matchKey => {
  try {
    let result = await matchController.getMatchStatus(matchKey);
    if (result.length > 0) {
      return result[0].match_status;
    }
    return 1;
  } catch (err) {
    console.log(err);
    return 1;
  }
};

const setUserCodeFile = (matchKey, user, code) => {
  let answerFile = fs.openSync(`./sessions/${matchKey}_${user}.js`, "w");
  fs.writeSync(answerFile, code, (encoding = "utf-8"));
  fs.closeSync(answerFile);
};

const deleteFile = (matchKey, user) => {
  let path = `./sessions/${matchKey}_${user}.js`;
  fs.unlink(path, err => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`${matchKey}_${user}.js file removed`);
  });
};

const putTogetherCodeOnRun = (code, codeConst, expected, test) => {
  let sampleTestCaseExpected = JSON.stringify(expected);
  // exec time calculation
  let finalCode = `console.time('Time');\n${code}\n`;
  // sample test case
  let consoleLogCode = `console.log('Sample test case: '+'${test[0]}');\nlet result_sample = JSON.stringify(${codeConst}(${test[0]}));\nconsole.log('Sample output: '+result_sample);\nconsole.log('Sample output expected: '+${sampleTestCaseExpected})`;
  // user's test case
  for (i = 1; i < 5; i++) {
    if (test[i] && test[i] !== "") {
      consoleLogCode += `\nconsole.log('')`;
      consoleLogCode += `\nconsole.log('Your test case: '+'${test[i]}');`;
      consoleLogCode += `\nlet result_${i} = JSON.stringify(${codeConst}(${test[i]}));`;
      consoleLogCode += `\nconsole.log('Output: '+result_${i});`;
    }
  }
  // format
  finalCode += consoleLogCode + `\nconsole.log('')`;
  finalCode += `\nconsole.timeEnd('Time');`;
  return finalCode;
};

const putTogetherCodeOnSubmit = (code, questionConst, sampleCase) => {
  let testCase = fs.readFileSync(sampleCase.test_case_path, {
    encoding: "utf-8"
  });
  // exec time calculation
  let finalCode = `console.time('Time');\n${code}\nconsole.log(JSON.stringify(${questionConst}(${testCase})))`;
  // format
  finalCode += `\nconsole.timeEnd('Time')`; // console.log(process.memoryUsage());
  return finalCode;
};

const getQuestionDetail = async (matchKey, submitBoolean) => {
  // get questionID with matchKey
  let questionID = await matchController.getMatchQuestion(matchKey);
  // get question details with questionID
  let getQuestionResult = await questionController.selectQuestion(questionID);
  // get sample test case with questionID
  let smallSampleCases = await questionController.selectSampleTestCases(
    questionID,
    0
  );
  let largeSampleCases = await questionController.selectSampleTestCases(
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
};

const runCodeInChildProcess = (matchKey, user, difficulty, memoryLimit) => {
  return new Promise((resolve, reject) => {
    // limit max memory to prevent out of memory situations
    let ls = spawn("node", [
      `--max-old-space-size=${memoryLimit}`,
      `./sessions/${matchKey}_${user}.js`
    ]);
    let result = "";

    // timeout error setting
    let timeoutMs = getTimeoutMs(difficulty);
    let setTimeoutId = setTimeout(() => {
      ls.kill();
      console.log("timeout: killing child process...");
      reject("EXECUTION TIMED OUT");
    }, timeoutMs);

    ls.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
      // output 性質是 ArrayBuffer 所以要先處理
      result += arrayBufferToStr(data);
    });

    ls.stderr.on("data", data => {
      let dataStr = arrayBufferToStr(data);
      if (data.includes("out of memory")) {
        ls.kill();
        console.log("out of memory: killing child process...");
        reject("OUT OF MEMORY");
      }
      if (dataStr.includes("Error")) {
        errorMsg =
          dataStr
            .split("Error")[0]
            .split("\n")
            .pop(-1) +
          "Error" +
          dataStr.split("Error")[1].split("\n")[0];
        reject(errorMsg);
      }
      if (dataStr.includes("throw")) {
        errorMsg = dataStr.split("throw")[1];
        reject(`throw${errorMsg}`);
      }
      reject("Unknow error");
      console.error(`stderr: ${data}`);
    });

    ls.on("error", reject).on("close", code => {
      if (code === 0) {
        resolve(result);
      } else {
        reject(result);
      }
      console.log(
        `exited child_process at ${matchKey}_${user}.js with code ${code}`
      );
      clearTimeout(setTimeoutId); // clear it or it'll keep timing
    });
  });
};

const getTimeoutMs = difficulty => {
  if (difficulty === "easy") {
    return 12000;
  } else if (difficulty === "medium") {
    return 15000;
  }
  return 20000;
};

const getMatchKey = url => {
  let urlSplitedBySlash = url.split("/");
  let key = urlSplitedBySlash[urlSplitedBySlash.length - 1];
  return key;
};

const calculatePoints = async (
  matchKey,
  totalCorrectness,
  largeExecTimeObj
) => {
  // rate performance
  let perfPoints = 0;
  let largePassedNo = 0;

  // get questionID with matchKey
  let questionID = await matchController.getMatchQuestion(matchKey);
  // get threshold_ms from db test table
  let largeThreshold = await questionController.selectThresholdMs(questionID);

  console.log("largeThreshold[i].threshold_ms", largeThreshold[0].threshold_ms);
  console.log("largeExecTimeObj", parseInt(largeExecTimeObj[0]));

  for (let i = 0; i < largeThreshold.length; i++) {
    if (parseInt(largeExecTimeObj[i]) <= largeThreshold[i].threshold_ms) {
      perfPoints += 100 / largeThreshold.length;
      largePassedNo += 1;
    }
  }

  let largePassed = `${largePassedNo}/${largeExecTimeObj.length}`;

  let points = (totalCorrectness + perfPoints) / 2;

  let calculated = {
    perfPoints,
    points,
    largePassed
  };
  return calculated;
};

const getWinner = async (winnerCheck, matchKey) => {
  console.log("getting winner");
  let winner;
  let user_0 = winnerCheck.get(matchKey)[0].user;
  let user_1 = winnerCheck.get(matchKey)[1].user;

  // points
  let points_0 = winnerCheck.get(matchKey)[0].points;
  let points_1 = winnerCheck.get(matchKey)[1].points;

  // answer time
  let answerTime_0 = winnerCheck.get(matchKey)[0].answerTime;
  let answerTime_1 = winnerCheck.get(matchKey)[1].answerTime;

  if (points_0 === 0 && points_1 === 0) {
    winner = "tie";
    console.log("points_0 & points_1 are both 0");
    return winner;
  }

  if (points_0 > points_1) {
    winner = user_0;
    console.log("points_0 > points_1");
  } else if (points_0 < points_1) {
    winner = user_1;
    console.log("points_0 < points_1");
  } else {
    // same points
    if (answerTime_0 < answerTime_1) {
      winner = user_0;
      console.log("same points, answerTime_0 < answerTime_1");
    } else if (answerTime_0 > answerTime_1) {
      winner = user_1;
      console.log("same points, answerTime_0 > answerTime_1");
    } else {
      winner = "tie";
      console.log("same points, answerTime_0 = answerTime_1");
    }
  }
  console.log("winner", winner);
  return winner;
};

const arrayBufferToStr = buf => {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
};

module.exports = socket;
