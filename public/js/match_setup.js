// verify signin first
if(!(localStorage.getItem('token'))) {
  window.location.pathname = 'signin';
};

setElementActive('.category button', 'categoryActive');
setElementActive('.difficulty button', 'difficultyActive');

async function getKey() {
  let keyObject = await axios.post('/api/v1/match/get_key');
  return keyObject.data;
};

async function inviteAFriend() {
  if (!document.querySelector('.categoryActive') || !document.querySelector('.difficultyActive')) {
    showAlert("Please select a category and a difficulty level.");
    return;
  }
  let category = document.querySelector('.categoryActive').value;
  let difficulty = document.querySelector('.difficultyActive').value;

  let questionID = await getQuestion(category, difficulty);
  if (!questionID) {
    return;
  }
  let matchKey = await getKey();
  
  showAlertWithButtons(`Send the match link to challenge your friend in a random ${difficulty}, ${category} problem: http://localhost:3000/match/${matchKey}`, async () => {
    // insert a match
    let match = await insertMatch(questionID, matchKey);
    // redirect to a room in match page with match key
    window.location = `match/${matchKey}`;
  });
};



async function getAStranger() {
  if (!document.querySelector('.categoryActive') || !document.querySelector('.difficultyActive')) {
    showAlert("Please select a category and a difficulty level.");
    return;
  }
  let category = document.querySelector('.categoryActive').value;
  let difficulty = document.querySelector('.difficultyActive').value;

  let questionID = await getQuestion(category, difficulty);
  if (!questionID) {
    return;
  }

  // find a random user online 
  try {
    let result = await axios.post(`/api/v1/user/get_stranger?token=${localStorage.getItem('token')}&category=${category}&difficulty=${difficulty}`);
    showAlert("We found someone but we still need the user to confirm!");
    // showAlertWithButtons(`Are you ready to start the match with ${result.data} now?`, async () => {
    //   let matchKey = await getKey();
  
    //   // insert a match
    //   let match = await insertMatch(questionID, matchKey);
    
    //   // redirect to a room in match page with match key
    //   window.location = `match/${matchKey}`;
    // })  
  } catch (error) {
    if (error.response.status === 403) {
      // can't find another online user
      showAlert(error.response.data);
      return;
    }
    showAlert('Server error. Please try again later.')
    console.log(error.response);
  }
};

// addEventListener to buttons
function setElementActive(parent, activeClassName) {
  let currentActiveElement;
  Array.prototype.forEach.call(document.querySelectorAll(parent), (item) => {
    item.addEventListener('click', function(evt) {
      currentActiveElement && currentActiveElement.classList.remove(activeClassName);
      currentActiveElement = evt.target;
      currentActiveElement.classList.add(activeClassName);
    }, false);
  });
}


// async function setUpAMatch() {
  // if (!document.querySelector('.categoryActive') || !document.querySelector('.difficultyActive')) {
  //   showAlert("Please select a category and a difficulty level.");
  //   return;
  // }
  // const category = document.querySelector('.categoryActive').value;
  // const difficulty = document.querySelector('.difficultyActive').value;

  // // ajax 打 question list api
  // let questionID = await getQuestion(category, difficulty);
  // if (!questionID) {
  //   return;
  // }

//   if(!matchKey || matchKey == '') {
//     matchKey = await getKey();
//   };

//   // insert a match
//   let match = await insertMatch(questionID, matchKey);

//   // redirect to a room in match page with match key
//   window.location = `match/${matchKey}`;
// }

async function getQuestion(category, difficulty) {
  try {
    const response = await axios.get(`/api/v1/question/${category}?difficulty=${difficulty}`)
    if (!response.data.question) {
      showAlert(`Oh no, we can't find this type of questions in our database. Please reselect.`);
      return false;
    }
    let questionID = response.data.question.id;
    return questionID;
  } catch (error) {
    console.log(error);
  }
};

async function insertMatch(questionID, matchKey) {
  try {
    const response = await axios.post('/api/v1/match/insert_match', {
      questionID,
      matchKey
    })
    return response;
  } catch (error) {
    console.log(error);
  }
};

function showAlert(text) {
  const modal = document.getElementById("myModal");
  const span = document.getElementsByClassName("close")[0];
  const buttons = document.getElementsByClassName("modalButtons")[0];
  document.getElementById('modalText').innerHTML = text;
  buttons.style.display = "none";

  // show modal
  modal.style.display = "block";

  // When the user clicks on (x), close the modal
  span.onclick = () => {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
};


function showAlertWithButtons(text, callback) {
  const modal = document.getElementById("myModal");
  const close = document.getElementsByClassName("close")[0];
  const buttons = document.getElementsByClassName("modalButtons")[0];
  const no = document.getElementById("noButton");
  const yes = document.getElementById("yesButton");

  modal.style.display = "flex";
  buttons.style.display = "flex";

  document.getElementById("modalText").innerHTML = text;

  no.onclick = () => {
    modal.style.display = "none";
  };

  yes.onclick = () => {
    modal.style.display = "none";
    callback();
  };

  close.onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = event => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}