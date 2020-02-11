// use matchKey to get match result data & display

const userID = localStorage.getItem('name');
const matchResult = JSON.parse(JSON.stringify(localStorage.getItem('match')));
console.log('matchResult from localStorage', JSON.stringify(localStorage.getItem('match')));
console.log('matchResult from localStorage', (matchResult));
const winner = localStorage.getItem('winner')
console.log('winner from localStorage', winner);


const appendResult = (element, text) => {
  let node = document.createElement(element);
  node.appendChild(document.createTextNode(text));   
  document.getElementById("matchResult").appendChild(node);
}


if (userID == winner) {
  appendResult('h1','You won!\n')
} else {
  appendResult('h1','You lost!\n')
}


appendResult('h3', `Point summary`);
appendResult('div', `Correctness: ${localStorage.getItem('correctness')}`)
appendResult('div', `Performance: ${localStorage.getItem('performance')}`)
appendResult('div', `Total Points: ${localStorage.getItem('points')}`)
appendResult('br')

appendResult('div', `Answer Time: ${localStorage.getItem('answerTime')} s`)

