const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
	sha256: { type: String, lowercase: true, unique: true, index: true },
	sha1: { type: String, lowercase: true },
	md5: { type: String, lowercase: true },
	path: String,
	fileName: String,
	packageName: String,
	screenshotPath: String,
	pcapPath: String,
	deviceType: String,
	family: String,
	category: String,
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	state: Number,
	error: String,
	state_analysis: Number,
	lastLog: String,
	consoleLog: String,
	predit_class: String,
	predit_ratio: String,
	static:{},
	dynamic_after_reboot: {},
	dynamic_before_reboot: {}
}, { timestamps: true });

module.exports = mongoose.model('Analysis', AnalysisSchema);