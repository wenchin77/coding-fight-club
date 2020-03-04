main();

async function main() {
  try {
    const response = await axios.get(`/api/${CST.API_VERSION}/user/leaderboard`);
    let leaderboardData = response.data;
    showLeaderboard(leaderboardData);
  } catch (err) {
    showAlert('Something went wrong. Refresh the page to view leaderboard.')
    console.log(err)
  }
}

async function showLeaderboard (result) {
  let leaderboard = [];
  console.log(result);
  for (let i=0; i<result.length; i++) {
    let user = result[i].user_name;
    let points = result[i].points;
    let level = result[i].level_name;
    let time = new Date(result[i].created_at)
    let signupTime = time.toLocaleDateString();
    let rank = i+1;

    let userRow = 
      {
        Rank: rank,
        User: user,
        Points: points, 
        Level: level, 
        'Join Date': signupTime,
      };
    leaderboard.push(userRow);
  }
  console.log(leaderboard);
  // add data to table
  addDataToTable('leaderboardTable', leaderboard);

}

function addDataToTable(elementId, array) {
  let table = document.getElementById(elementId);
  let data = Object.keys(array[0]);
  generateTableHead(table, data);
  generateTable(table, array);
}


function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    if (key !== 'url') {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.appendChild(text);
      row.appendChild(th);
    }
  }
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      if (key !== 'url'){
        let cell = row.insertCell();
        let text = document.createElement('span');
        text.innerHTML = element[key];
        cell.appendChild(text);
      }
    }
  }
}



