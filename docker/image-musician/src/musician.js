// require = importe
var protocol = require('./musician-protocol');
const uuidv4 = require('uuid/v4');

/*
 * We use a standard Node.js module to work with UDP
 */
var dgram = require('dgram');

/*
 * Let's create a datagram socket. We will use it to send our UDP datagrams 
 */
var s = dgram.createSocket('udp4');

//instruments
var instruments = new Map();
instruments.set("piano", "ti-ta-ti");
instruments.set("trumpet", "pouet");
instruments.set("flute", "trulu");
instruments.set("violin", "gzi-gzi");
instruments.set("drum", "boum-boum");

/*
 * Let's define a javascript class for our Musician.
 */
function Musician(sound, uuid) {

	this.sound = sound;
	this.uuid = uuid; 

	Musician.prototype.update = function() {

	var data = {
		sound : this.sound,
		uuid : this.uuid
	};

	var payload = JSON.stringify(data);
/*
	   * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
	   * the multicast address. All subscribers to this address will receive the message.
	   */
		message = new Buffer(payload);
		s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + s.address().port);
		});

	}
/*
	 * Let's take and send a sound every 1000 ms
	 */
	setInterval(this.update.bind(this), 1000);
}

/*
 * Let's get the muscician properties from the command line attributes
 * Some error handling wouln't hurt here...
 */
var sound = instruments.get(process.argv[2]);
var uuid = uuidv4();

/*
 * Let's create a new Musician
 */
var m = new Musician(sound, uuid);
