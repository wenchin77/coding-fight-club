// verify signin first
if(!localStorage.getItem('name')) {
  window.location.pathname = 'signin';
};

let userID = localStorage.getItem('name');

// to be updated
async function getLink() {
  let matchID = await insertMatch();
  document.getElementById('invitationLink').innerHTML = `http://localhost:3000/match/${matchID}`;
};

async function setUpAMatch() {
  let matchID = await insertMatch();
  window.location = `match/${matchID}`;
}

async function insertMatch() {
  // redirect to a room in match page (with room id)
  const category = document.getElementById('category').value;
  const difficulty = document.getElementById('difficulty').value;

  // ajax 打 question list api
  let questionID = await getQuestion(category, difficulty);

  // ajax 打 insert_match api 存資料到 match table 拿 matchID
  let matchID = await insertMatch(userID, questionID);

  console.log('AFTER AXIOS: ', questionID, matchID)
  return matchID;
}

async function getQuestion(category, difficulty) {
  try {
    const response = await axios.get(`/api/v1/question/${category}?difficulty=${difficulty}`)
    console.log('打 /api/v1/question 的結果', response.data);
    let questionID = response.data.question.id;
    console.log(questionID);
    return questionID;
  } catch (error) {
    console.log(error);
  }
}

async function insertMatch(userID, questionID) {
  try {
    const response = await axios.post('api/v1/match/insert_match', {
      userID: userID,
      questionID: questionID
    });
    console.log('打 api/v1/match/insert_match 的結果', response);
    let matchID = response.data.insertId;
    return matchID;
  } catch (error) {
    console.log(error);
  }
}