const switchToSignup = () => {
  let signup = document.getElementById('signup');
  let signin = document.getElementById('signin');
  let button = document.getElementById('toggleButton');
  signin.style.left = '-400px';
  signup.style.left = '50px';
  button.style.left = '110px'
}

const switchToSignin = () => {
  let signup = document.getElementById('signup');
  let signin = document.getElementById('signin');
  let button = document.getElementById('toggleButton');
  signin.style.left = '50px';
  signup.style.left = '450px';
  button.style.left = '0px'
}

const useTestUser = () => {
  let checkbox = document.getElementById('testCheckbox');
  let email = document.getElementById('signinEmail');
  let password = document.getElementById('signinPassword');
  if (checkbox.checked) {
    email.value = 'test@codingfightclub.com';
    password.value = '123456';
    return;
  }
  email.value = '';
  password.value = '';
}

const showAlert = (text, callback) => {
  const modal = document.getElementById("myModal");
  const close = document.getElementsByClassName("close")[0];
  
  modal.style.display = "flex";
  document.getElementById('modalText').innerHTML = text;

  close.onclick = () => {
    modal.style.display = "none";
    callback();
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      callback();
    }
  }
};

// signin via axios
document.forms['signin'].addEventListener('submit', (event) => {
  event.preventDefault();
  axios(event.target.action, {
    method: 'POST',
    data: new URLSearchParams(new FormData(event.target)) // event.target is the form
  }).then((res) => {
    // add userinfo to localStorage
    localStorage.setItem('id', res.data.id);
    localStorage.setItem('username', res.data.username)
    localStorage.setItem('email', res.data.email);
    localStorage.setItem('provider', res.data.provider);
    localStorage.setItem('token', res.data.token);
    showAlert('Welcome back!', () => {
      // redirect to profile page
      window.location.pathname = 'profile';
    })
  }).catch((error) => {
    // server error
    if (!error.response) {
      showAlert('Sorry, some error occurred on our server. Please try again later.');
      return;
    };
    // client error
    showAlert(error.response.data.error);
  });
});

// signup via axios
document.forms['signup'].addEventListener('submit', (event) => {
  event.preventDefault();
  axios(event.target.action, {
    method: 'POST',
    data: new URLSearchParams(new FormData(event.target)) // event.target is the form
  }).then((res) => {
    // add userinfo to localStorage
    localStorage.setItem('id', res.data.id);
    localStorage.setItem('username', res.data.username)
    localStorage.setItem('email', res.data.email);
    localStorage.setItem('provider', res.data.provider);
    localStorage.setItem('token', res.data.token);
    showAlert('Welcome to the Coding Fight Club!', () => {
      // redirect to profile page
      window.location.pathname = 'profile';
    })
  }).catch((error) => {
    // server error
    if (!error.response) {
      showAlert('Sorry, some error occurred on our server. Please try again later.');
      return;
    };
    // client error
    showAlert(error.response.data.error);
  });
});

const showTestUserHelp = () => {
  showAlert(`Check this box to sign in as a test user to try out Coding Fight Club without using your own email. Feel free to also use 'test1@codingfightclub.com' and '123456' to sign in as another user if you want to experience the matches!`)
}