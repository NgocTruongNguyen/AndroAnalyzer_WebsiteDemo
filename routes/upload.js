const express = require('express');
const router = express.Router();

const androanalyzer = require('../androanalyzer');

router.post('/', function (req, res, next) {
	androanalyzer.analyse(req, res, next);
});

module.exports = router;