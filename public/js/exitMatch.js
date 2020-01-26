function exitMatch() {
  if (window.confirm('Are you sure you want to exit the match? You will not gain any points if you do so :(')) {
    window.location.pathname = '/';
    alert('You exited the match!')
  }
}
