function tempSignin() {
  const userName = document.getElementById('signinName').value;
  document.getElementById('membername').innerHTML = userName;
  window.location.pathname= 'match_setup';
  localStorage.setItem('name', userName);
}

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
    email.value = 'test@test.com';
    password.value = '123456';
    return;
  }
  email.value = '';
  password.value = '';
}