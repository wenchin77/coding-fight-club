function tempSignin() {
  const userName = document.getElementById('signinName').value;
  document.getElementById('membername').innerHTML = userName;
  window.location.pathname= 'match_setup';
  localStorage.setItem('name', userName);
}
