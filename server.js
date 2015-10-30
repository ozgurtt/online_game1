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

var port = process.env.PORT || 8080;

var player_arr = [];
var blocks_arr = [];
var contains_player = false;


function addChangePlayerArr(player) {
    player_arr.forEach(function(stored_player, ind) { //if the array already contains the player it will update their coords
        if (stored_player.id == player.id) {
          
            player_arr[ind] = player;
            contains_player = true;
        }
    });
    
    if (contains_player == false) {
        player_arr.push(player); //otherwise it will add it to the array as a new entry
    }
    contains_player = false;
}

function removePlayerOnDC(id) { //searches for a player to remvoe from the player array after a dc
    var index;
      player_arr.forEach(function(player, ind) {
          //console.log(player[3] + " : " + id)
            if (player.socket_id == id) {
              index = ind;
            }
        });
    player_arr.splice(index, 1);
}

function addBlockArr(block) {
  
  var block_overlap = false
  
    blocks_arr.forEach(function(stored_block, ind) {
          //console.log(player[3] + " : " + id)
            if (stored_block.x == block.x && stored_block.y == block.y) {
              block_overlap = true
              console.log("OVERLAP")
            }
        });
        
      if (block_overlap == false) {
        blocks_arr.push(block);
      }
}


io.on('connection', function(socket){
  
  io.emit('blocks_data', blocks_arr); //emits the player array
  
  socket.on('player_data', function(player){// ricieves new data from players

    player.socket_id = socket.id;
    addChangePlayerArr(player);
    
    io.emit('player_data', player_arr); //emits the player array
    //console.log(player_arr)
    io.emit('blocks_data', blocks_arr); //emits the player array
    
  });
  
  socket.on('block_data', function(block){// ricieves new data from players
    addBlockArr(block);
    console.log(blocks_arr);
    io.emit('blocks_data', blocks_arr); //emits the player array
    
  });
  
   socket.on('disconnect', function(){ //handles removeing players on dc
    removePlayerOnDC(socket.id);
    console.log("Player Disconnected")
  });
});

http.listen(port, function(){
  console.log('listening on *:8080');
});