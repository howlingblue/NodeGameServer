var DEFAULT_HTTP_PORT = 8000;
var DEFAULT_TCP_PORT = 6000;
var DEFAULT_UDP_PORT = 5000;

//var requireCmapTools = require('./cmap.js');
var datagramPackage = require( 'dgram' );


function Client( ipAddress, portNumber )
{
	this.ipAddress = ipAddress;
	this.port = portNumber;
	this.secondsSinceLastReceivedData = 0;
}

//var udpClientList = tools.CMap();

var udpSocket = datagramPackage.createSocket( 'udp4' );
udpSocket.bind( DEFAULT_UDP_PORT );
udpSocket.on( 'message', 
				function( receivedMessage, messageSender )
				{
					console.log('Received UDP Packet from ' + messageSender.address + ':' + messageSender.port + "." );
				}
			);

console.log( "UDP server now listening on port " + DEFAULT_UDP_PORT + "..." );
