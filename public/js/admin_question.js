const fs = require('fs');
const question = require('../../models/question.js');

// 引用 model/question.js 跟 db 互動


app.post("/api/" + cst.API_VERSION + "/admin/campaign", function(req, res) {
  dao.campaign
    .insert(req)
    .then(function(message) {
      // remove campaigns cache
      cache.remove("campaigns");
      res.send({ status: message });
    })
    .catch(function(error) {
      res.send({ error: error });
    });
});