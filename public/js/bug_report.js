const sendBug = async () => {
  let reporter = document.getElementById('bugReporter').value;
  let bug = document.getElementById('bug').value;
  console.log(reporter)
  console.log(bug)
  let result = await axios.post(`/api/v1/user/bug_report?reporter=${reporter}&bug=${bug}`);
  showAlert(result.data);
}

