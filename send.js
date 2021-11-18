var express = require("express");
var http = require('http');
const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'CozyDB'
});
var app = express();
const port = 3000
var a = "";
app.get("/", function(req, res){
	
	// как будто мы получили данные из бд
	/*var obj = {
	'1' : {
		id : 'akldjaskldj',
		duration : 73,
		thumbnail : 'a0sd.png',
		title : 'Милые КОЗИки'
	},
	'2' : {
		id : 'fkslafksadk',
		duration : 104,
		thumbnail : 'qwedhg.png',
		title : 'Петрозаводский гамбит'
		}
	};*/
	//var obj = array();
	connection.query(
		'SELECT Name, Length, Hash, Thumbnail FROM tblVideo;', function(err, results, fields) {
			console.log(results);
			res.send(JSON.stringify(results));
		}
	);
	//console.log(obj);
	//res.send(JSON.stringify(obj));
});

app.get("/*", function(req, res){
	//console.log(req.url);
	if(req.url != '/favicon.ico')
		a = req.url.substring(1, req.url.length);
	//console.log(a);
	//var vid_id = req.query.value;
	//console.log(vid_id);
	// как будто мы получили данные из бд
	/*var obj = {
	id : 1,
	link : 'COZYcs.mp4',
	author : 'me',
	title : 'Милые КОЗИки'
	};*/
	var c = 'SELECT * FROM `tblVideo` WHERE `hash` = \'' + a + '\'';
	connection.query(
		c , function(err, results, fields) {
			
			res.send(JSON.stringify(results));
		}
	);
	//res.send(JSON.stringify(obj));
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})