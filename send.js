var express = require("express");
var http = require('http');
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'iuSh8ahV',
  database: 'CozyDB'
});

const multer = require('multer');

var hash = "";
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './upload/') // Папка куда кидаются загруженные файлы
  },
  filename: async function (req, file, cb) {
	hash = await generateHash();
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
	while (flag == 1) {
		var h = "";
		var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
		for (let i = 0; i < 10; i++) {
			h = h + alphabet[getRandomInt(alphabet.length)];
		}
		q = 'SELECT Count(Name) as num FROM tblVideo WHERE Video = \'' + h + '\';';
		
		console.log(q);
		let promise = new Promise((resolve, reject) => {connectt(function(res){  // Дожидаемся обработки запроса
			
			console.log(flag);
			resolve(res);
		})});
		flag = await promise;
		console.log(flag);
		//flag = 0;
	}
	return h;
}

connectt = function (callback) {
	connection.query(q, function(err, results, fields) {
			console.log(results);
			return callback(results[0].num);
});
			}

// Обработка get-запроса
app.get("/", function(req, res){
	a = req.query.codec;
	b = req.query.video;
	if(a != null && b != null){
		connection.query('select tblLinks.Quality, tblLinks.Link from tblLinks,	tblCodec, tblVideo where (tblCodec.idCodec = tblLinks.idCodec) AND (tblCodec.Codec = \''+ a + '\') AND (tblVideo.idVid = tblLinks.idVid) AND (tblVideo.Video = \'' + b + '\');', function(err, results, fields) {
			console.log(results);
			res.send(JSON.stringify(results));
		}
	
	);
	} 
	else {
		connection.query('SELECT Name, Length, Video FROM tblVideo WHERE IsUploaded = 1;', function(err, results, fields) {
			console.log(results);
			res.send(JSON.stringify(results));
		}
	
	);
	}
});


// Обработка post-запроса
app.post('/', upload.single('videofile'), function (req, res) {
	const title = req.body.title;
	var author = req.body.author;
	query = 'INSERT INTO tblVideo VALUES(0, \'' + title + '\', \'' + dateFormat(new Date(), "%Y-%m-%d", true) + '\', 0, \'' + author + '\', \'' + title + '.png\', \'' + hash + '\', 1);'
	console.log(query);
	/*connection.query(query, function(err, results, fields) {
			console.log(results);
			res.send(JSON.stringify(results));
		}*/
	res.send({
		'title': title,
		'author': author
	});
});


app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
