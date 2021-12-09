/*import express from 'express';
import http from 'http';
import mysql2 from 'mysql2';
import multer from 'multer';
import "regenerator-runtime/runtime.js";

const mysql = mysql2;*/
const func = require('./func');
var express = require('express');
var http = require('http');
const mysql = require('mysql2');
const multer = require('multer');

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

var hash = "";
var q = "";
var b = "";
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
	  
    cb(null, './upload/') // Папка куда кидаются загруженные файлы
  },
  filename: async function (req, file, cb) {
	console.log(file);
	hash = await func.generateHash();
	console.log(hash);
    cb(null, hash + '.mp4')
  }
})

var upload = multer({storage: storage});

var app = express();
const port = 3000
// Add headers before the routes are defined
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});







var connectt = function (callback) {
	connection.query(q, function(err, results, fields) {
			//console.log(results);
			return callback(results);
	});
}

// Обработка get-запроса
app.get("/", async function(req, res){
	var a = req.query.video;
	if(a != null){
		console.log(a);
		var r = [];
		var qualities = ['240','360','480','720'];
		for(let i = 0; i < qualities.length; i++){
			q = 'select tblCodec.codec, tblLinks.link from tblLinks, tblCodec, tblVideo where (tblCodec.idCodec = tblLinks.idCodec) AND (tblVideo.idVid = tblLinks.idVid) AND (tblVideo.Video = \'' + a + '\') AND (tblLinks.Quality = \'' + qualities[i].toString() + '\');';
			let promise = new Promise((resolve, reject) => {connectt(function(res){  // Дожидаемся обработки запроса
				resolve(res);
			}), q});
			r['q' + qualities[i].toString()] = await promise;

		};
		var re = {};
		for(let i = 0; i < qualities.length; i++){
			if(r['q' + qualities[i]].length > 0){
				re[qualities[i]] = r['q' + qualities[i]];
			}
		}
		q = 'select name, author from tblVideo where video=\'' + a + '\';';
		let promise2 = new Promise((resolve, reject) => {connectt(function(res){  // Дожидаемся обработки запроса
				resolve(res);
			}), q});
		
		var info = await promise2;
		
		var full = {};
		full['qualities'] = re;
		full['author'] = info[0].author;
		full['name'] = info[0].name;
		res.send(full);

	} 
	else {
		connection.query('SELECT name, length, video FROM tblVideo WHERE IsUploaded = 1;', function(err, results, fields) {
			console.log(results);
			res.send(JSON.stringify(results));
		});
	}
});


// Обработка post-запроса
app.post('/', upload.single('videofile'), async function (req, res) {
	/*const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	database: 'cozydb'
	});*/
	const title = req.body.title;
	var author = req.body.author;
	var len = await func.getData('./upload/' +  hash + '.mp4');
	console.log(len);
	q = 'INSERT INTO tblVideo VALUES(0, \'' + title + '\', \'' + func.dateFormat(new Date(), "%Y-%m-%d", true) + '\', 0, \'' + author + '\', \'' + hash + '\', ' + Math.round(len[0]) +');'
	console.log(q);
	let promise = new Promise((resolve, reject) => {connectt(function(res){  // Дожидаемся обработки запроса
			
			resolve(res);
		}), q});
	ret = await promise;
	res.send({
		'title': title,
		'author': author,
		'video': hash
	});
});

app.listen(port, () => {
  console.log(`Send listening at http://localhost:${port}`)
});