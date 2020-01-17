const express = require('express');
const app = express();
const router = express.Router();

app.use(express.static('public'));
// const cst=require("./util/constants.js");
const bodyparser=require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));


app.get('/', function (req, res) {
  res.send('Hello World!');
});


app.listen(3000, function () {
  console.log('App running on port 3000!');
});

module.exports = router;