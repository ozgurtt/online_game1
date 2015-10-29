var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');


app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/phaser', function(req, res){
  res.sendfile('phaser/phaser.min.js');
});

app.get('/assets/player.png', function(req, res){
  res.sendfile('assets/player.png');
});

app.get('/assets/enemy.png', function(req, res){
  res.sendfile('assets/enemy.png');
});

app.get('/assets/tiles.png', function(req, res){
  res.sendfile('assets/tiles.png');
});

app.get('/assets/swordy.png', function(req, res){
  res.sendfile('assets/swordy.png');
});

app.get('/assets/swordyside.png', function(req, res){
  res.sendfile('assets/swordyside.png');
});



var player_arr = [];
var contains_player = false;


function addChangePlayerArr(id,x,y,s) {
    player_arr.forEach(function(player, ind) { //if the array already contains the player it will update their coords
        if (player[0] == id) {
            player_arr[ind][1] = x;
            player_arr[ind][2] = y;
            contains_player = true;
        }
    });
    
    if (contains_player == false) {
        player_arr.push([id,x,y,s]); //otherwise it will add it to the array as a new entry
    }
    contains_player = false;
}

function removePlayerOnDC(id) { //searches for a player to remvoe from the player array after a dc
    var index;
      player_arr.forEach(function(player, ind) {
          //console.log(player[3] + " : " + id)
            if (player[3] == id) {
                
                index = ind;
            }
        });
    player_arr.splice(index, 1);
}


io.on('connection', function(socket){
  console.log("Player Connected")
  
  socket.on('player_data', function(pd){ // ricieves new data from players
    addChangePlayerArr(pd[0], pd[1], pd[2], socket.id);
    
    io.emit('player_data', player_arr); //emits the player array
    
  });
  
   socket.on('disconnect', function(){ //handles removeing players on dc
    removePlayerOnDC(socket.id);
    console.log("Player Disconnected")
  });
});

http.listen(PORT, function(){
  console.log('listening on *:8080');
});