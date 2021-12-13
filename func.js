const mysql = require("mysql2");
const util = require('util');
const fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
var express = require('express');
var http = require('http');
const multer = require('multer');
const { getAvailableCodecs } = require('fluent-ffmpeg');
const { Console } = require("console");
const { connect } = require("http2");
const video = require("ffmpeg/lib/video");

async function getData(path) {
	let promise2 = new Promise((resolve, reject) => { 
		ffmpeg.ffprobe(path, function(err, metadata) {
			if (err) {
				//console.error(err);
				resolve(undefined);
			} else {
				//console.log(metadata);
				var duration = metadata.streams[0].duration;
				var h = metadata.streams[0].height;
				var cool = [duration, h];
				resolve(cool);
			}
		});
	});

	let result = await promise2;
	return result;
}

function dateFormat (date, fstr, utc) {
  utc = utc ? 'getUTC' : 'get';
  return fstr.replace (/%[YmdHMS]/g, function (m) {
    switch (m) {
    case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
    case '%m': m = 1 + date[utc + 'Month'] (); break;
    case '%d': m = date[utc + 'Date'] (); break;
    case '%H': m = date[utc + 'Hours'] (); break;
    case '%M': m = date[utc + 'Minutes'] (); break;
    case '%S': m = date[utc + 'Seconds'] (); break;
    default: return m.slice (1); // unknown code, remove %
    }
    // add leading zero if required
    return ('0' + m).slice (-2);
  });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function generateHash(){ //Генерация хэша и проверка на наличие
	var flag = 1;
	var i = 1;
	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		database: 'cozydb'
	});
	/*const connection = mysql.createConnection({
	  host: 'localhost',
	  user: 'user',
	  password: 'iuSh8ahV',
	  database: 'CozyDB'
	});*/
	while (flag == 1) {
		var h = "";
		var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
		for (let i = 0; i < 10; i++) {
			h = h + alphabet[getRandomInt(alphabet.length)];
		}
		let q = 'SELECT Count(Name) as num FROM tblVideo WHERE Video = \'' + h + '\';';
		let promise2 = new Promise((resolve, reject) => { 
			connection.query(q, function(err, results, fields) {
				resolve(results);
			});
		});
		var ret = await promise2;
		flag = ret[0].num;
		//console.log(flag);
		//flag = 0;
	}
	connection.end();
	return h;
}

module.exports = {
	getData: getData,
	dateFormat: dateFormat,
	generateHash: generateHash
};
