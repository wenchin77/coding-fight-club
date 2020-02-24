// verify signin first
if(!(localStorage.getItem('token'))) {
  window.location.pathname = 'signin';
};

setElementActive('.category button', 'categoryActive');
setElementActive('.difficulty button', 'difficultyActive');


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
    socket.on('noStranger', msg => {
      showAlert(msg)
    })

    socket.on('stranger', invitation => {
      let time = invitation.time;
      localStorage.setItem('inviteTime', time);
      countdown(time);
    })
      // showAlertWithButtons(`Are you ready to start the match with ${result.data} now?`, async () => {
      //   let matchKey = await getKey();
    
      //   // insert a match
      //   let match = await insertMatch(questionID, matchKey);
      
      //   // redirect to a room in match page with match key
      //   window.location = `match/${matchKey}`;
      // })
  })
};

// countdown with inviteTime after refresh
if (localStorage.getItem('inviteTime')) {
  let inviteTime = localStorage.getItem('inviteTime');
  if (parseInt(inviteTime / 1000 + 60 - Date.now() / 1000) > 0) {
    countdown(inviteTime);
  }
}

function countdown(startTime) {
  let totalSeconds = 60;
  let timer = setInterval( () => {
    let secondsLeft = parseInt(startTime / 1000 + totalSeconds - Date.now() / 1000);
    if (secondsLeft === 0) {
      clearInterval(timer);
      document.getElementById("myModal").style.display = 'none';
    }
    // can't exit alert box
    // document.getElementById('okButton').style.display = 'none';
    showAlert(`We found someone. Let's wait for the user to confirm! Here's the countdown: ${secondsLeft} seconds.`, () =>{
      document.getElementById("myModal").style.display = 'block';
    });
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


// async function insertMatch(questionID, matchKey) {
//   try {
//     const response = await axios.post('/api/v1/match/insert_match', {
//       questionID,
//       matchKey
//     })
//     return response;
//   } catch (error) {
//     console.log(error);
//   }
// };

// async function getKey() {
//   let keyObject = await axios.post('/api/v1/match/get_key');
//   return keyObject.data;
// };