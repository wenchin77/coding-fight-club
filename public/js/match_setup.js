// verify signin first
if(!(localStorage.getItem('token'))) {
  window.location.pathname = 'signin';
};

setElementActive('.category button', 'categoryActive');
setElementActive('.difficulty button', 'difficultyActive');
setElementActive('.language button', 'languageActive');


async function inviteAFriend() {
  if (!document.querySelector('.categoryActive') || !document.querySelector('.difficultyActive')) {
    showAlert("Please select your match's language, category and difficulty level.");
    return;
  }
  let category = document.querySelector('.categoryActive').value;
  let difficulty = document.querySelector('.difficultyActive').value;

  let questionID = await getQuestion(category, difficulty);
  if (!questionID) {
    return;
  }
  let matchKey = await getKey();
  
  showAlertWithButtons(`Send the match link to challenge your friend in a random ${difficulty}, ${category} problem: https://coding-fight-club.thewenchin.com/match/${matchKey}`, async () => {
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

  showAlertWithButtons('Sure you wanna challenge a random user?', () => {
    let data = {
      token: localStorage.getItem('token'),
      category,
      difficulty
    }
  
    // find a random user online 
    socket.emit('getStranger', data);
  })
};


let inviteTimer;

socket.on('noStranger', msg => {
  showAlert(msg)
})

socket.on('stranger', invitation => {
  let time = invitation.time;
  localStorage.setItem('inviteTime', time);
  // start counting down
  countdown(time);
});

socket.on('rejected', msg => {
  console.log('stranger rejected...');
  // turn off countdown timer alert
  localStorage.removeItem('inviteTime');
})



// countdown with inviteTime after refresh
if (localStorage.getItem('inviteTime')) {
  let inviteTime = localStorage.getItem('inviteTime');
  let secondsLeft = parseInt(inviteTime / 1000 + 60 - Date.now() / 1000);
  if (secondsLeft > 0) {
    countdown(inviteTime);
  }
}

function countdown(inviteTime) {
  let inviteTimer = setInterval(() => {
    let secondsLeft = parseInt(inviteTime / 1000 + 60 - Date.now() / 1000);
    if (!localStorage.getItem('inviteTime')) {
      clearInterval(inviteTimer);
      document.getElementById('myModal').style.display = 'none';
      showAlert('The user rejected to join :( Try again or invite a friend!');
      return;
    }
    if (secondsLeft === 0) {
      socket.emit('strangerTimedOut', localStorage.getItem('token'));
      console.log('countdown finished');
      clearInterval(inviteTimer);
      localStorage.removeItem('inviteTime');
      showAlert('Oh no this user has not confirmed within time. Try it again later or invite a friend!')
      return;
    }
    // can't exit alert box
    showAlertNoButtons(`We found someone! Let's wait for the user to confirm. Here's the countdown: ${secondsLeft} seconds.`);
  }, 1000
  );
}




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

socket.on('startStrangerModeMatch', url => {
  console.log('get startStrangerModeMatch...')
  window.location = url;
});