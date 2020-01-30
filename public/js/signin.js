function tempSignin() {
  const userName = document.getElementById('signinName').value;
  window.location.pathname= 'match_setup';
  localStorage.setItem('name', userName);
}
