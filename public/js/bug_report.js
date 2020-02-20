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

const sendBug = async () => {
  let reporter = document.getElementById('bugReporter').value;
  let bug = document.getElementById('bug').value;
  console.log(reporter)
  console.log(bug)
  let result = await axios.post(`/api/v1/user/bug_report?reporter=${reporter}&bug=${bug}`);
  showAlert(result.data);
}

