const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multiparty = require('multiparty');

const Analysis = mongoose.model('Analysis');

const androanalyzer = {};

androanalyzer.analyse = function (req, res, next) {
	const form = new multiparty.Form();
	form.parse(req, function (err, fields, files) {
		
		if(!files) return res.redirect("/");
		if(!files.upload) return res.redirect("/");
		if(!fields["device-type"]) return res.redirect("/");

		const deviceType = fields["device-type"][0].toLowerCase();
		for(let i = 0; i < files.upload.length; i++){
			let newAnalysis = null;
			const filePath = files.upload[i].path;
			androanalyzer.fileHash(filePath, 'sha256').then(
				(hash) => {
					newAnalysis = new Analysis({
						sha256: hash,
						path: filePath,
						fileName: files.upload[i].originalFilename,
						owner: req.user._id,
						state_analysis: 0,
						lastLog: "",
						consoleLog: "",
						"static" :{
							"activities": [],
							"services": [],
							"permissions": [],
							"actions": [],
							"categories": [],
							"exported": [],
							"backup": [],
							"meta": [],
							"providers": [],
							"receivers": [],
							"summary":{
								"icon":"",
								"audio":"",
								"video":"",
								"size":"",
								"activities":"",
								"exported":"",
								"backup":"",
								"meta":"",
								"services":"",
								"permissions":"",
								"actions":"",
								"providers":"",
								"receivers":"",
								"categories":""
							}
						},
						deviceType: deviceType
						
					});
					return androanalyzer.fileHash(filePath, 'sha1');
				}
			).then(
				(hash) => {
					newAnalysis.sha1 = hash;
					return androanalyzer.fileHash(filePath, 'md5');
				}
			).then(
				(hash) => {
					newAnalysis.md5 = hash;
					if(i == 0){
						res.redirect('/hybridanalysis/' + newAnalysis.sha256); //Redirect user after all 3 hashes are computed
					}
					return androanalyzer.checkIfAPK(newAnalysis);
				}
			).then(
				(properAPK) => {
					if(properAPK){
						if(newAnalysis.deviceType == "emulator"){
							newAnalysis.state = 2;
						}else{
							newAnalysis.state = 1;
						}
					}else{
						newAnalysis.state = 0;
						newAnalysis.error = "Failed APK validation!";
					}
					return androanalyzer.queueForPhone(newAnalysis);
				}
			);
		}
	});
}

androanalyzer.checkIfAPK = function (newAnalysis) {
	return new Promise((resolve, reject) => {
		const apkMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

		let buffer = Buffer.alloc(4);
		fs.open(newAnalysis.path, 'r', function(err, fd) {
			fs.read(fd, buffer, 0, 4, 0, function (err, bytesRead, buffer) {
				return resolve(Buffer.compare(buffer, apkMagic)==0);
			});
		});
	});
}

androanalyzer.queueForPhone = function (newAnalysis) {
	return new Promise((resolve, reject) => {
		newAnalysis.save();
		return resolve();
	});
}

//Thanks https://gist.github.com/GuillermoPena/9233069#gistcomment-2364896
androanalyzer.fileHash = function (filename, algorithm) {
	return new Promise((resolve, reject) => {
		// Algorithm depends on availability of OpenSSL on platform
		// Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
		let shasum = crypto.createHash(algorithm);
		try {
			let s = fs.ReadStream(filename)
			s.on('data', function (data) {
				shasum.update(data)
			})
			// making digest
			s.on('end', function () {
				const hash = shasum.digest('hex')
				return resolve(hash);
			})
		} catch (error) {
			return reject(error);
		}
	});
}

module.exports = androanalyzer;
