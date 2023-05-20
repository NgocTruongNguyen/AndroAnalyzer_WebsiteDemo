const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const router = express.Router();


const Analysis = mongoose.model('Analysis');

router.get('/', function (req, res, next) {
	res.locals.active = 'home';
	res.render('myhome');
});

router.get('/about', function (req, res, next) {
	res.locals.active = 'about';
	res.render('about');
});

router.get('/list', function (req, res, next) {
	res.locals.active = 'list';

	Analysis.find({}, function (err, analysis) {
		res.render('list',{
		analysis: analysis
	})
	});
});

// router.get('/:hash/pcap', function (req, res, next) {
// 	Analysis.findOne({
// 		'sha256': req.params.hash
// 	}, function (err, analysis) {
// 		if (err) throw err;
// 		if(!analysis.pcapPath) return res.end();
// 		res.sendFile(path.resolve(analysis.pcapPath));
// 	});
// });

// router.get('/:hash/analysis.pdf', function (req, res, next) {
// 	makePdf(req, res, next);
// });
// router.get('/:hash/analysis.csv', function (req, res, next) {
// 	makeCsv(req, res, next);
// });

module.exports = router;