//Port Settings
const DEFAULT_HTTP_PORT = 8000;
const DEFAULT_TCP_PORT = 6000;
const DEFAULT_UDP_PORT = 5000;

//Time Definitions
var MILLISECONDS_BEFORE_CLIENT_TIMES_OUT = 5000;
var MILLISECONDS_IN_SECOND = 1000;

//Includes
var datagramPackage = require( 'dgram' );
var Vector = require( 'collection' ).Vector;



//-----------------------------------------------------------------------------------------------
function Client( ipAddress, portNumber )
{
	this.ipAddress = ipAddress;
	this.port = portNumber;
	this.timeLastReceivedPacket = 0;
}



//+++++++++++++++++++++++++++++++++++++++ Keep Alive ++++++++++++++++++++++++++++++++++++++++++++
var clientList = new Vector();

function BroadcastMessageToAllClients( message )
{
	for( var i = 0; i < clientList.size(); ++i )
	{
		var client = clientList.get( i );
		udpSocket.send( message, 0, message.length, client.port, client.ipAddress );
	}
}

//-----------------------------------------------------------------------------------------------
function HandleUDPMessage( receivedMessage, messageSender )
{
	console.log('Received UDP Packet from ' + messageSender.address + ':' + messageSender.port + '.' );
	
	var sendingClient = null;
	for( var i = 0; i < clientList.size(); ++i )
	{
		var currentClient = clientList.get( i );
		if( currentClient.ipAddress === messageSender.address && currentClient.port === messageSender.port )
		{
			currentClient.timeLastReceivedPacket = Date.now();
			sendingClient = currentClient;
			break;
		}
	}
	if( sendingClient == null )
	{
		var newClient = new Client( messageSender.address, messageSender.port );
		newClient.timeLastReceivedPacket = Date.now();
		clientList.add( newClient );
	}

	BroadcastMessageToAllClients( receivedMessage );
}

//-----------------------------------------------------------------------------------------------
function PrintClientInfo( client, vectorModifier )
{
	console.log( '\tClient ' + vectorModifier.index() + ' - @' + client.ipAddress + ':' + client.port );
}

//-----------------------------------------------------------------------------------------------
function PrintClientList()
{
	if( clientList.isEmpty() )
	{
		console.log( 'No clients connected.' );
	}
	else
	{
		console.log( 'Client List:' );
		clientList.each( PrintClientInfo );
	}

	setTimeout( PrintClientList, 5000 );
}

//-----------------------------------------------------------------------------------------------
function RemoveClientIfTimedOut( client, vectorModifier )
{
	var timeNow = Date.now();
	if( timeNow - client.timeLastReceivedPacket > MILLISECONDS_BEFORE_CLIENT_TIMES_OUT )
	{
		vectorModifier.remove(); //Remove this client
		console.log( 'Removed client @' + client.ipAddress + ':' + client.port + ' due to ' + 
						( MILLISECONDS_BEFORE_CLIENT_TIMES_OUT / MILLISECONDS_IN_SECOND ) + ' seconds of inactivity.' )
	}
}

//-----------------------------------------------------------------------------------------------
function RemoveTimedOutClients()
{
	clientList.each( RemoveClientIfTimedOut );

	setTimeout( RemoveTimedOutClients, 1000 );
}



//++++++++++++++++++++++++++++++++++++++++++ Main +++++++++++++++++++++++++++++++++++++++++++++++
var udpSocket = datagramPackage.createSocket( 'udp4' );
udpSocket.bind( DEFAULT_UDP_PORT );
udpSocket.on( 'message', HandleUDPMessage );

console.log( "UDP server now listening on port " + DEFAULT_UDP_PORT + "..." );
setTimeout( PrintClientList, 5000 );
setTimeout( RemoveTimedOutClients, 1000 );
