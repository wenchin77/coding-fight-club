if (!localStorage.getItem('token')) {
  showAlert('Please sign in before you report a bug!', () => {
    window.location.pathname = '/signin';
  })
}

const sendBug = async () => {
  let token = localStorage.getItem('token');
  let bug = document.getElementById('bug').value;
  if (bug === '') {
    showAlert('Make sure you write down the problem before you submit!');
    return;
  };
  let result = await axios.post(`/api/${CST.API_VERSION}/user/bug_report?token=${token}&bug=${bug}`);
  showAlert(result.data);
}

