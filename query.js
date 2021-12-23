const mysql = require("mysql2");
const util = require('util');
const fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');

const { getAvailableCodecs } = require('fluent-ffmpeg');
const { Console } = require("console");
const { connect } = require("http2");
const video = require("ffmpeg/lib/video");

const dir = 'C:\\videos\\'; // путь к папке с видео
const res = 'C:\\ffmpeg\\'; // куда сувать новые видео
const thumbs = 'C:\\thumbs\\'; // thumbnails

const qualities = [240, 360, 480, 720];
const timeout = 1000*10;//1000*60*60;

var interval = 10;

_q = '';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'db'	
});

async function process() {
	_q = 'select * from tblCodec;';

	let promise = new Promise((resolve, reject) => { connectt(function(res){ 
		resolve(res);
	})});

	let data = await promise;
	var codecs = data;
	var codecs_len = data.length;

	_q = 'select Video from tblVideo where isUploaded = 0;'
	let promise2 = new Promise((resolve, reject) => { connectt(function(res){
		resolve(res);
	})});

	let data2 = await promise2;
	var videos = data2;
	//callEveryHour();
	//setInterval(query(codecs, codecs_len), 1000 * 60 * 60);
	query(codecs, codecs_len, videos);
}


connectt = function (callback) {
	connection.query(_q, function(err, results, fields) {
		return callback(results);
	});
}

async function getData(path) {
	let promise2 = new Promise((resolve, reject) => { 
		ffmpeg.ffprobe(path, function(err, metadata) {
			if (err) {
				console.error(err);
			} else {
				duration = metadata.streams[0].duration;
				h = metadata.streams[0].height;
				cool = [duration, h];
				resolve(cool);
			}
		});
	});

	let result = await promise2;
	return result;
	}

	function ffmpegSync(path, quality, codec, path_to_save, ext){
	return new Promise((resolve,reject)=>{
		ffmpeg(path)
			.size('?x' + quality)
			.videoCodec(codec)
			.save(path_to_save + quality+ ext)
			.on('end', () => {
				resolve(1)
			})
			.on('error',(err)=>{
				return reject(0)
			})
	})
	}

	async function query(codecs, codecs_len, videos) {
	const start_time = new Date().getTime();
	//interval = interval * 1000 * 6 * 15; // remove later

	console.log("Starting...")

	const start = new Date().getTime();
	const real_files = fs.readdirSync(dir);

	var files = [];

	for (var i = 0; i < real_files.length; i++) {
		for (var j = 0; j < videos.length; j++) {
			if (real_files[i].split('.')[0] == videos[j].Video) {
				files.push(real_files[i]);
			}
		}
	}

	console.log("DB files:", videos);
	console.log("Real files:", real_files);

	_codecs = ['libvpx', 'libx264'];

	if (files.length == 0) {
		console.log('No videos to work with...');
	}

	var h = 0;
	var duration = 0;
	for (let k = 0; k < files.length; k++) {
		// know path of video
		path = dir + files[k];//'C:\\Users\\apexk\\Desktop\\hash-test.mp4'
		console.log(path);

		// get videoId from DB
		_q = 'select idVid, isUploaded from tblvideo where Video = \'' + files[k].split('.')[0] + '\';';
		let promise = new Promise((resolve, reject) => { connectt(function(res){ 
			resolve(res);
		})});

		let data = await promise;
		var videoId = data[0].idVid;
		var isUploaded = data[0].isUploaded;
		console.log(isUploaded);

		// get video duration and quality
		var data2 = await getData(path);
		h = data2[1];
		duration = data2[0];

		// creating thumbnail for the video
		ffmpeg(path)
		.thumbnail({
			count: 1,
			folder: thumbs,
			filename: files[k].split('.')[0] + '.png'
		});

		var total_positives = 0;

		for (let i = 0; i < _codecs.length; i++) {
			for (let j = 0; j < qualities.length; j++) {
				console.log(h)
				console.log(qualities[j])
				if (qualities[j] > h) continue;

				ext = '';
				if (_codecs[i] == 'libvpx') {
					ext = '.webm';
				}

				if (_codecs[i] == 'libx264') {
					ext = '.mp4';
				}

				path_to_save = res + files[k].split('.')[0];
				

				console.log('processing: ', path_to_save + qualities[j] + ext);
				var result = await ffmpegSync(path, qualities[j], _codecs[i], path_to_save, ext);
				console.log(result);
				console.log('finished: ', path_to_save);

				console.log('Video name: ', files[k].split('.')[0] + qualities[j] + ext);
				console.log('Video quality: ', qualities[j]);
				console.log('Video codec (ffmpeg format): ', _codecs[i]);
				console.log('Video id: ', videoId);
				console.log('Video codec id: ', codecs[i].idCodec);
				console.log();

				//update tblLinks
				if (result == 1) {
					total_positives += 1;

					_q = 'INSERT INTO tblLinks (idVid, Quality, idCodec, Link) VALUES ' +
					'(' + videoId + ', ' + qualities[j] + ', ' + codecs[i].idCodec + 
					', \'' + files[k].split('.')[0] + qualities[j] + ext + '\');';	

					let promise = new Promise((resolve, reject) => { connectt(function(res){ 
						resolve(res);
					})});
				
					let data = await promise;
				} else {
					// delete file
					fs.unlink(res + files[k], (err) => {
						console.log('Deleted: ', file);
					});
				}
			}
		}

		//update tblVideo
		if (total_positives != 0) {
			_q = 'update tblVideo set IsUploaded = 1 where idVid = ' + videoId + ';';
			let promise4 = new Promise((resolve, reject) => { connectt(function(res){ 
				resolve(res);
			})});
		
			let data4 = await promise4;
		}

		console.log('finished...');
		total_positives = 0;
	}

	const end_time = new Date().getTime();
	total_time = end_time - start_time;
	console.log(total_time);

	if (timeout > total_time) {
		console.log('Calling query as scheduled...');
		console.log(timeout-total_time);
		const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
		await delay(timeout-total_time);
		process();
	} else {
		console.log('Query was working more than planned...');
		process();
	}
}

process();

module.exports = {
	getData: getData,
	query: query,
	ffmpegSync: ffmpegSync
};