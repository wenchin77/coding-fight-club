// verify signin first
if(!localStorage.getItem('name')) {
  window.location.pathname = 'signin';
};

let userID = localStorage.getItem('name');
let matchKey;

async function getKey() {
  let keyObject = await axios.post('/api/v1/match/get_key');
  return keyObject.data;
};

async function getLink() {
  matchKey = await getKey();
  document.getElementById('invitationLink').innerHTML = `http://localhost:3000/match/${matchKey}`;
};

async function setUpAMatch() {
  const category = document.getElementById('category').value;
  const difficulty = document.getElementById('difficulty').value;

  // ajax 打 question list api
  let questionID = await getQuestion(category, difficulty);

  if(!questionID) {
    window.alert("There aren't this type of questions in our database. Please reselect.")
    return;
  };

  if(!matchKey || matchKey == '') {
    matchKey = await getKey();
  };

  // insert a match
  let match = await insertMatch(questionID, matchKey);

  // redirect to a room in match page with match key
  window.location = `match/${matchKey}`;
}

async function getQuestion(category, difficulty) {
  try {
    const response = await axios.get(`/api/v1/question/${category}?difficulty=${difficulty}`)
    let questionID = response.data.question.id;
    return questionID;
  } catch (error) {
    console.log(error);
  }
};

async function insertMatch(userID, questionID, matchKey) {
  try {
    const response = await axios.post('/api/v1/match/insert_match', {
      userID,
      questionID,
      matchKey
    })
    return response;
  } catch (error) {
    console.log(error);
  }
};