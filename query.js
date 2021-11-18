const fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');

const dir = '/Users/Maksi/Desktop/node/videos'; // путь к папке с видео
const or = '/Users/Maksi/Desktop/node/originals/'; // куда перемещать обработанные видео (у меня удаление не робит)
const res = '/Users/Maksi/Desktop/node/ffmpeg/'; // куда сувать новые видео

function query() {
	const start = new Date().getTime();
	const files = fs.readdirSync(dir);
	var a = 0;
	var h = 0;
	for (const file of files) {
		console.log(file);
		ffmpeg.ffprobe(dir + '/' + file, function(err, metadata) {
			h = metadata.streams[0].height;
		});	
		if(h >=480) {
			ffmpeg(dir + '/' + file)
			.size('?x480')
			.on('error', function(err) {
				console.log('An error occurred: ' + err.message);
			})
			.on('end', function() {
				console.log(file + ': Processing finished: 480!');
			})
			.save(res + '480_' + file);
		}
		
			ffmpeg(dir + '/' + file)
			.on('error', function(err) {
				console.log('An error occurred: ' + err.message);
			})
			.on('end', function() {
				fs.rename(dir + '/' + file, or + file, function (err) {
					if (err) throw err
					  console.log(file + ' moved');
					});
				console.log(file + ': Processing finished: 360!');
			})
			.size('?x360')
			.save('/Users/Maksi/Desktop/node/ffmpeg/' + '360_' + file);

		
	}

	const end = new Date().getTime();
	if( (end - start) / 1000 > 60) {
		console.log('Processing was too long, starting ASAP');
		query();
	}
}


function callEveryHour() {
    //setInterval(query, 1000 * 60 * 60); // Каждый час
	setInterval(query, 1000 * 60); // Каждую минуту
}

callEveryHour();
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

