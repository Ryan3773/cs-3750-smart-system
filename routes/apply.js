var express = require('express');
var router = express.Router();

/* GET Apply page. */
router.get('/', function(req, res, next) {
  res.render('apply', { });
});

module.exports = router;
