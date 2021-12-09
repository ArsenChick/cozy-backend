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

var interval = 10;

_q = '';

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	database: 'db'	
});

async function process() {
	_q = 'select * from tblCodec';

	let promise = new Promise((resolve, reject) => { connectt(function(res){ 
		resolve(res);
	})});

	let data = await promise;
	var codecs = data;
	var codecs_len = data.length;

	//callEveryHour();
	//setInterval(query(codecs, codecs_len), 1000 * 60 * 60);
	query(codecs, codecs_len);
}


connectt = function (callback) {
	connection.query(_q, function(err, results, fields) {
		return callback(results);
	});
}

getDuration = function (callback, path) {
	console.log(path);
	ffmpeg.ffprobe(path, function(err, metadata) {
		if (err) {
			console.error(err);
		} else {
			duration = metadata.streams[0].duration;
			h = metadata.streams[0].height;
		}
	});

	cool = [duration, h];

	return callback(cool);
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

async function query(codecs, codecs_len) {
	//interval = interval * 1000 * 6 * 15; // remove later

	const start = new Date().getTime();
	const files = fs.readdirSync(dir);

	_codecs = ['libvpx', 'libx264'];

	var h = 0;
	var duration = 0;
	for (let k = 0; k < files.length; k++) {
		// know path of video
		path = dir + files[k];//'C:\\Users\\apexk\\Desktop\\hash-test.mp4'
		console.log(path);

		// get videoId from DB
		_q = 'select idVid, isUploaded from tblvideo where Video = \'' + files[k].split('.')[0] + '\'';
		let promise = new Promise((resolve, reject) => { connectt(function(res){ 
			resolve(res);
		})});
	
		let data = await promise;
		var videoId = data[0].idVid;
		var isUploaded = data[0].isUploaded;
		console.log(isUploaded);

		// kostyl :)
		if (isUploaded == '1' || isUploaded == 1) {
			console.log('skipping: ', files[k]);
			continue;
		}

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
				
				ffmpeg(path)
				.size('?x' + qualities[j])
				.videoCodec(_codecs[i])
				.save(path_to_save + qualities[j] + ext);

				console.log('Video name: ', files[k].split('.')[0] + qualities[j] + ext);
				console.log('Video quality: ', qualities[j]);
				console.log('Video codec (ffmpeg format): ', _codecs[i]);
				console.log('Video id: ', videoId);
				console.log('Video codec real name: ', codecs[i].idCodec);
				console.log();

				//update tblLinks
				_q = 'INSERT INTO tblLinks (idVid, Quality, idCodec, Link) VALUES ' +
				'(' + videoId + ', ' + qualities[j] + ', ' + codecs[i].idCodec + 
				', \'' + files[k].split('.')[0] + qualities[j] + ext + '\');';	

				let promise = new Promise((resolve, reject) => { connectt(function(res){ 
					resolve(res);
				})});
			
				let data = await promise;
			}
		}

		//update tblVideo
		_q = 'update tblVideo set IsUploaded = 1 where idVid = ' + videoId + ';';
		let promise4 = new Promise((resolve, reject) => { connectt(function(res){ 
			resolve(res);
		})});
	
		let data4 = await promise4;
	}

	fs.readdir(dir, (err, files) => {
		for (const file of files) {
			fs.unlink(dir + file, (err) => {
				console.log('Deleted: ', file);
			});
		}
	});

	console.log('im here');

/*
	const end =  new Date().getTime();

	if ((end - start) > interval) {
		console.log('Processing was too long, starting ASAP');
		query();
	}*/
}

//function callEveryHour() {
    //setInterval(query, 1000 * 60 * 60); // Каждый час
	//setInterval(query, interval); // Каждую минуту
//}

process();
//callEveryHour();
/*var nextDate = new Date();
if (nextDate.getMinutes() === 0) {  				// для часов
//if (nextDate.getSeconds() === 0) {                // для минут
    callEveryHour()
} else {
    nextDate.setHours(nextDate.getHours() + 1);   // для часов
    nextDate.setMinutes(0); 					  // для часов
	//nextDate.setMinutes(nextDate.getMinutes() + 1); // для минут
    nextDate.setSeconds(0);

    var difference = nextDate - new Date();
    setTimeout(callEveryHour, difference);
}*/

