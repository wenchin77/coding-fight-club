function checkName() {
  if (!(localStorage.getItem('name'))) {
    window.location.pathname = 'signin'
  }
}

checkName();
