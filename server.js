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


function addChangeArr(id,x,y,s) {
    player_arr.forEach(function(player, ind) {
        if (player[0] == id) {
            player_arr[ind][1] = x;
            player_arr[ind][2] = y;
            contains_player = true
        }
    
    })
    
    if (contains_player == false) {
        player_arr.push([id,x,y,s]);
    }
    contains_player = false;
}

function removeOnDC(id) {
    var ind = player_arr.indexOf(id);
    player_arr.splice(id, 1);
}

io.on('connection', function(socket){
    
 
  socket.on('player_data', function(pd){

      addChangeArr(pd[0], pd[1], pd[2], socket.id);
      console.log(player_arr);
      
    io.emit('player_data', player_arr);
  });
   socket.on('disconnect', function(){
    removeOnDC(socket.id);
  });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});