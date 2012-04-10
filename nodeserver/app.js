var url = require("url");
var express = require('express');

var http = require("http"),
	 io = require("socket.io"),
	 server = express.createServer();
  
// this simply holds a list of players	
// could live without this in this version of the game
// but hey, it doesn't do any harm... 
var playerlist = ['stevenmilne','digitaldelivery','borkbot','mcaulay'];	 
 
// this holds the play field of 25 slots.
var playfield = [['borkbot',0],['borkbot',1],['borkbot',2],['borkbot',3],['borkbot',4],['borkbot',5],['borkbot',6],['borkbot',7],['borkbot',8],['borkbot',9],['borkbot',10],['borkbot',11],['borkbot',12],['borkbot',13],['borkbot',14],['borkbot',15],['borkbot',16],['borkbot',17],['borkbot',18],['borkbot',19],['borkbot',20],['borkbot',21],['borkbot',22],['borkbot',23],['borkbot',24],['borkbot',25],['borkbot',26]]
 
function jumpPlayer (inPlayer) {
	// add the player to a random position on the playfield
	// this is the simplest action as we don't need to worry about any swapping
	// swapping would mean one tile per player
	// this way a super key tapper could swamp the board
	
	newSquare = randsquare();
	var tarr = [inPlayer, newSquare]
  playfield[newSquare] = tarr ;
}
 
function joinPlayer (inPlayer) {
	// check if already in playerlist
	var index = playerlist.indexOf(inPlayer);
	
	if(index < 0){
		// if not add to the playerlist
		playerlist.push( inPlayer );
		// and jump onto the board
		jumpPlayer(inPlayer);
	}
	else { 
		// if known to us jump them onto the board
		jumpPlayer(inPlayer); 
	}
 
}
 
function randsquare(){
	// remarkably crude random number
	// got to leave you something easy to improve on ;)
	var rand_no = Math.ceil(25*Math.random())
	return rand_no;
}
 
function sendPlayers () {
	return JSON.stringify(playerlist);
}
function sendPlayfield () {
	return JSON.stringify(playfield);
}

server.configure(function () {
  server.use(express.static(__dirname + '/public'));
});

server.get('/', function (req, res) {
  res.render('index', { layout: false });
});

server.listen(3000, function(){
	var addr = server.address();
	console.log('   app listening on http://' + addr.address + ':' + addr.port);
});	 

var socket = io.listen(server);

socket.sockets.on("connection", function(client){
	var user;
	console.log('Connected!');

//	client.send("hello! Welcome to Socket server!");

	client.on("message", function(msg){
		console.log("Arrived Message from Client!",msg);
		joinPlayer(msg);
		//client.send("I got  : "+msg);
	});

	client.on("setId", function(id){
		user = id;
	});

	var sendingMsg = setInterval(function(){
		// client.send("Players : "+ sendPlayers()  );
		client.send( sendPlayfield()  );
		//client.broadcast.emit("broadcast","This message is for everybody!");
		client.broadcast.emit("broadcast","- - - - -->" + sendPlayfield() );
	},1000);

	client.on("disconnect", function() {
		console.log("Client Disconnected!");
	});
});