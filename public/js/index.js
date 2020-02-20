// check if token's expired
let expired = localStorage.getItem('access_expired');
if (Date.now() >= expired) {
  showAlert('Signin expired. Please sign in again!', () => {
    logout();
  })
}

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
  const close = document.getElementsByClassName("close")[0];
  const buttons = document.getElementsByClassName("modalButtons")[0];
  document.getElementById('modalText').innerHTML = text;
  buttons.style.display = "none";

  // show modal
  modal.style.display = "block";

  // When the user clicks on (x), close the modal
  close.onclick = () => {
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

function showAlertWithButtons (text, callback) {
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


