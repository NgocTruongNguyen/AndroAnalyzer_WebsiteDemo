const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const router = express.Router();


const Analysis = mongoose.model('Analysis');

router.get('/:hash', function (req, res, next) {
	res.locals.active = '';
	Analysis.findOne({
		'sha256': req.params.hash
	}, function (err, analysis) {
	if (err || analysis == null) {
		return res.render('hybridanalysic', {
			err: "Hash not found!"
		});
	}
	res.render('hybridanalysic',{
		analysis: analysis
	})
	});
});

router.get('/:hash/updatedata', function (req, res, next) {
  res.locals.active = '';
  Analysis.findOne({ 'sha256': req.params.hash }, function (err, analysis) {
    if (err || analysis == null) {
      return res.json({ error: "Hash not found!" });
    }
	if (analysis.state_analysis == 0){
		res.json({ state: 0});
	} else if (analysis.state_analysis == 1){
		res.json({ state: 1, data: analysis.static});
	} else if (analysis.state_analysis == 2){
		res.json({ state: 2, data: analysis.dynamic_before_reboot});
	} else if (analysis.state_analysis == 3){
		res.json({ state: 3, data: analysis.dynamic_after_reboot});
	} else if (analysis.state == 4 || analysis.state == 0){
		res.json({ state: 4});
	} 
  });

});
router.get('/api/:hash/', function (req, res, next) {
	res.locals.active = '';
	Analysis.findOne({ 'sha256': req.params.hash }, function (err, analysis) {
	  if (err || analysis == null) {
		return res.json({ error: "Hash not found!" });
	  }
	  res.json({ analysis: analysis});
	});
});

router.get('/:hash/log-stream', (req, res) => {
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.flushHeaders();
	let newData = "";
	// Lặp vô hạn để giữ kết nối mở
	setInterval(() => {
		Analysis.findOne({ 'sha256': req.params.hash }, function (err, analysis) {
			if (err || analysis == null) {
				return res.json({ error: "Hash not found!" });
			}
			// Kiểm tra dữ liệu mới trong cơ sở dữ liệu
			if (newData != analysis.lastLog)
			{
				newData = analysis.lastLog;
				// Gửi thông báo SSE cho máy khách với dữ liệu mới (console log)
				res.write(`data: ${newData}\n\n`);
			}
		});
	}, 100);
});

// // Endpoint để máy khách kết nối SSE
// router.get('/:hash/log-stream', (req, res) => {
// 	res.setHeader('Content-Type', 'text/event-stream');
// 	res.setHeader('Cache-Control', 'no-cache');
// 	res.setHeader('Connection', 'keep-alive');
// 	res.setHeader('Access-Control-Allow-Origin', '*');
// 	res.flushHeaders();
  
// 	// Lặp vô hạn để giữ kết nối mở
// 	setInterval(async () => {
// 		res.write(`data: 123\n`);
// 		Analysis.findOne({ 'sha256': req.params.hash }, function (err, analysis) {
// 			res.write(`data: 234\n`);
// 			if (err || analysis == null) {
// 				res.write(`data: 345\n`);
// 				return res.json({ error: "Hash not found!" });
				
// 			};
// 			const newData = analysis.lastLog;
// 			res.write(`data: ${newData}\n`);
// 		});
// 	}, 1000);
//   });


module.exports = router;



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