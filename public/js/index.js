
function logout() {
  localStorage.removeItem('id');
  localStorage.removeItem('username')
  localStorage.removeItem('email');
  localStorage.removeItem('provider');
  localStorage.removeItem('token');
  localStorage.removeItem('points');
  localStorage.removeItem('level');
  localStorage.removeItem('access_expired');
  document.getElementById('membername').innerHTML = 'Sign In';
  document.getElementById('member').href = '/signin';
  showAlert('Logged out!')
}

function showAlert (text, callback) {
  const modal = document.getElementById("myModal");
  // const close = document.getElementsByClassName("close")[0];
  const buttons = document.getElementsByClassName("modalButtons")[0];
  const okay = document.getElementById('okButton');
  document.getElementById('modalText').innerHTML = text;
  buttons.style.display = "none";

  // show modal
  modal.style.display = "block";
  okay.style.display = "block";

  // When the user clicks on okay, close the modal
  okay.onclick = () => {
    modal.style.display = "none";
    callback();
  }

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      callback();
    }
  }
};

function showAlertNoButtons (text) {
  const modal = document.getElementById("myModal");
  const buttons = document.getElementsByClassName("modalButtons")[0];
  const okay = document.getElementById('okButton');
  document.getElementById('modalText').innerHTML = text;

  // show modal
  modal.style.display = "block";
  okay.style.display = "none";
  buttons.style.display = "none";

  window.onclick = event => {
    if (event.target == modal) {
      modal.style.display = "block";
    }
  };
};

function showAlertWithButtons (text, callback) {
  const modal = document.getElementById("myModal");
  // const close = document.getElementsByClassName("close")[0];
  const buttons = document.getElementsByClassName("modalButtons")[0];
  const okay = document.getElementById('okButton');
  const no = document.getElementById("noButton");
  const yes = document.getElementById("yesButton");
  
  okay.style.display = "none";
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

  // close.onclick = () => {
  //   modal.style.display = "none";
  // };

  window.onclick = event => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}


function capitalize (str) {
  if (typeof str !== 'string') return '';
  if (str.includes('_')) {
    return `${str.split('_')[0].charAt(0).toUpperCase()}${str.split('_')[0].slice(1)} ${str.split('_')[1].charAt(0).toUpperCase()}${str.split('_')[1].slice(1)}`
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}