/*
 * We have defined the multicast address and port in a file, that can be imported both by
 * thermometer.js and station.js. The address and the port are part of our simple 
 * application-level protocol
 */
const protocol = require('./auditor-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');


var moment = require('moment');
moment().format();

var net = require('net');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by thermometers and containing measures
 */
const s = dgram.createSocket('udp4');

s.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  //groupe mlticaste
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

//instruments
var instruments = new Map();
instruments.set("ti-ta-ti", "piano");
instruments.set("pouet", "trumpet");
instruments.set("trulu", "flute");
instruments.set("gzi-gzi", "violin");
instruments.set("boum-boum", "drum");

var isPlaying = new Map();

var dataToSend = new Array();

s.on('message', function(msg, source) {
	//console.log("Data has arrived: " + msg + ". Source port: " + source.port);
	var musician = JSON.parse(msg);

	//Add a musician if it's not already done
	if(!isPlaying.has(musician.uuid)){

		musician.instrument = instruments.get(musician.sound);
		musician.activeSince = moment();
		musician.isActive = true;
		isPlaying.set(musician.uuid, musician);
	}
	//update isActive and the time he plays
	else{
		isPlaying.get(musician.uuid).activeSince = moment();
		isPlaying.get(musician.uuid).isActive = true;
	}
});

setInterval(function(){

	dataToSend = new Array();

	for (var [key, value] of isPlaying.entries()) {

		var music = new Object();
		music.uuid =  value.uuid;
		music.instrument = value.instrument;
		music.activeSince = value.activeSince;

		var time = moment().diff(music.activeSince);
		console.log(time);

		if(time < 5000 && !music.isActive){
			dataToSend.push(music);
		}
		else{
			isPlaying.get(music.uuid).isActive = false;
		}
	}

}, 1000);


var server = net.createServer(function (socket) {
	var payload = JSON.stringify(dataToSend);
	socket.write(payload + '\r\n');
	socket.pipe(socket);
	socket.end();
});

server.listen(2205, '0.0.0.0');
