
const protocol = require('./auditor-protocol');

/*
 * We use a standard Node.js module to work with UDP
 */
const dgram = require('dgram');

/*
 * Use to know is a musician is still playing
 */
var moment = require('moment');
moment().format();

var net = require('net');

/* 
 * Let's create a datagram socket. We will use it to listen for datagrams published in the
 * multicast group by musicians
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

//map with all musicians
var musicians = new Map();

//Array that will be send with the server TCP
var dataToSend = new Array();

s.on('message', function(msg, source) {

	var musician = JSON.parse(msg);

	//Add a musician if it's not already done
	if(!musicians.has(musician.uuid)){

		musician.instrument = instruments.get(musician.sound);
		musician.activeSince = moment();
		musician.isActive = true;
		musicians.set(musician.uuid, musician);
	}
	//update isActive and the time he plays
	else{
		musicians.get(musician.uuid).activeSince = moment();
		musicians.get(musician.uuid).isActive = true;
	}
});

//Used to verify if a musician is still playing
setInterval(function(){

	dataToSend = new Array();

	for (var [key, value] of musicians.entries()) {

		var musician = new Object();
		musician.uuid =  value.uuid;
		musician.instrument = value.instrument;
		musician.activeSince = value.activeSince;

		var time = moment().diff(musician.activeSince);

		//verifiy if the musician is still playing
		if(time >= 5000){
			musicians.get(musician.uuid).isActive = false;
		}

		//if the musician is still active, it will be put in the Array to send
		if(musicians.get(musician.uuid).isActive){
			dataToSend.push(musician);
		}
	}

}, 1000);

//Server TCP 
var server = net.createServer(function (socket) {
	var payload = JSON.stringify(dataToSend);
	socket.write(payload + '\r\n');
	socket.pipe(socket);
	socket.end();
});

server.listen(2205, '0.0.0.0');
