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
var enemies_arr = [];


function addChangePlayerArr(player) {
    var contains_player = false;
  
    player_arr.forEach(function(stored_player, ind) { //if the array already contains the player it will update their coords
        if (stored_player.id == player.id) {
          
            player_arr[ind] = player;
            contains_player = true;
        }
    });
    
    if (contains_player == false) {
        player_arr.push(player); //otherwise it will add it to the array as a new entry
    }
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
            }
        });
        
      if (block_overlap == false) {
        blocks_arr.push(block);
      }
}

function removeBlockArr(block) {
  
  var overlap_ind;
  var is_overlap = false
  
    blocks_arr.forEach(function(stored_block, ind) {
            if (stored_block.x == block.x && stored_block.y == block.y) {
              overlap_ind = ind;
              is_overlap = true
              console.log("OVERLAP" );
            }
        });
    
    if (is_overlap == true) {
      blocks_arr.splice(overlap_ind, 1);
    }
}

function enemyLogic() {
 enemies_arr.forEach(function(enemy){
   
   enemy.x_velocity = 0;
   enemy.y_velocity = 0;
   
   if (enemy.knockback < Date.now()) {
   
     player_arr.forEach(function(player){
       
        if (enemy.target == null) { //WILL SELECT A TARGET IF IT'S NULL
        
          if (((player.y > enemy.y) && (player.y < enemy.y + 200)) || ((player.y < enemy.y) && (player.y > enemy.y - 200))) {
            enemy.target = player.id;
          }
                
          if (((player.x > enemy.x) && (player.x < enemy.x + 200)) || ((player.x < enemy.x) && (player.x > enemy.x - 200))) {
            enemy.target = player.id;
          } 
        }
        if (enemy.target == player.id) { //LOGIC FOR TARGET
        
          var still_in_range = false; //if either the x or y tracking statments pass, will change to true and will keep the target
        
          if (((player.y > enemy.y) && (player.y < enemy.y + 200)) || ((player.y < enemy.y) && (player.y > enemy.y - 200))) { //only activates if you're in y range
            still_in_range = true;
            
            if ((player.x > enemy.x) && (player.x < enemy.x + 200)) {//x velocity logic
                enemy.alerted_timer = Date.now() + 300;
                enemy.x_velocity = 2;
            }
            else if ((player.x < enemy.x) && (player.x > enemy.x - 200)) {
                enemy.alerted_timer = Date.now() + 300;
                enemy.x_velocity = -2;
            }
          }
                
          if (((player.x > enemy.x) && (player.x < enemy.x + 200)) || ((player.x < enemy.x) && (player.x > enemy.x - 200))) { // only activates if you're in x range
            still_in_range = true;
            
            if ((player.y > enemy.y) && (player.y < enemy.y + 200)) { //y velocity logic
                enemy.alerted_timer = Date.now() + 300;
                enemy.y_velocity = 2;
            }
            else if ((player.y < enemy.y) && (player.y > enemy.y - 200)) {
                enemy.alerted_timer = Date.now() + 300;
                enemy.y_velocity = -2;
            }
          }
          
          
          if (still_in_range == false || player.dead == true) { enemy.target = null } //resets the enemies target
        }
      });
      
      if (enemy.alerted_timer < Date.now()) { //Wandering logic, will kick in if the alerted timer is less then the current time
        enemy.target = null; //reset the enemy target, this is a fail safe in case someone disconnects and the array iteration doesn't catch they're out ofrange
        
        if (enemy.change_direction_timer < Date.now()) { //will change the enemies wandering direction if 5 seconds have passed
            enemy.direction = Math.floor(Math.random() * (5 - 1) + 1); //random direction between 1-4
            enemy.change_direction_timer = Date.now() + 5000;
        }
        
        if (enemy.direction == 1) { //applies movement based on direction
            enemy.y_velocity = -1;
        }
        else if (enemy.direction == 2) {
            enemy.x_velocity = 1;
        }
        else if (enemy.direction == 3) {
            enemy.y_velocity = 1;
        }
        else if (enemy.direction == 4) {
            enemy.x_velocity = -1;
        }
      }
   }
   else {
        if (enemy.knock_back_direction == 1) { //applies movement based on direction
            enemy.y_velocity = -4;
        }
        else if (enemy.knock_back_direction == 2) {
            enemy.x_velocity = 4;
        }
        else if (enemy.knock_back_direction == 3) {
            enemy.y_velocity = 4;
        }
        else if (enemy.knock_back_direction == 4) {
            enemy.x_velocity = -4;
        }
   }
    
    player_arr.forEach(function(player){  //checking for overlaps
    
      if ( ((enemy.x + 25 + enemy.x_velocity > player.x ) && ( enemy.x + enemy.x_velocity < player.x + 25 )) ) 
      {
        if ( ( enemy.y + 25 > player.y ) && ( enemy.y < player.y + 25) ) {
          enemy.x_velocity = 0;
        }
      }
      
      if ( ((enemy.y + 25 + enemy.y_velocity > player.y ) && ( enemy.y + enemy.y_velocity < player.y + 25 )) ) 
      {
        if ( ( enemy.x + 25 > player.x ) && ( enemy.x < player.x + 25) ) {
          enemy.y_velocity = 0;
        }
      }
    
    });
    
    blocks_arr.forEach(function(player){  //checking for overlaps
    
      if ( ((enemy.x + 25 + enemy.x_velocity > player.x ) && ( enemy.x + enemy.x_velocity < player.x + 25 )) ) 
      {
        if ( ( enemy.y + 25 > player.y ) && ( enemy.y < player.y + 25) ) {
          enemy.x_velocity = 0;
        }
      }
      
      if ( ((enemy.y + 25 + enemy.y_velocity > player.y ) && ( enemy.y + enemy.y_velocity < player.y + 25 )) ) 
      {
        if ( ( enemy.x + 25 > player.x ) && ( enemy.x < player.x + 25) ) {
          enemy.y_velocity = 0;
        }
      }
    
    });
    
    enemies_arr.forEach(function(player){  //checking for overlaps
      if (enemy.id != player.id) {
    
        if ( ((enemy.x + 25 + enemy.x_velocity > player.x ) && ( enemy.x + enemy.x_velocity < player.x + 25 )) ) 
        {
          if ( ( enemy.y + 25 > player.y ) && ( enemy.y < player.y + 25) ) {
            enemy.x_velocity = 0;
          }
        }
        
        if ( ((enemy.y + 25 + enemy.y_velocity > player.y ) && ( enemy.y + enemy.y_velocity < player.y + 25 )) ) 
        {
          if ( ( enemy.x + 25 > player.x ) && ( enemy.x < player.x + 25) ) {
            enemy.y_velocity = 0;
          }
        }
      }
    
    });
    
    if ( (enemy.x + 25 + enemy.x_velocity > 1600 ) || (enemy.x + enemy.x_velocity < 0 )  )  //COLLIDE WORLD BOUNDS
    {
        enemy.x_velocity = 0;
    }
    
    if ( (enemy.y + 25 + enemy.y_velocity > 1200 ) || (enemy.y + enemy.y_velocity < 0 )  ) 
    {
        enemy.y_velocity = 0;
    }
    

    
    
    
    enemy.x = enemy.x + enemy.x_velocity;
    enemy.y = enemy.y + enemy.y_velocity;
    

    
 });
    setTimeout(function(){
        enemyLogic();
    }, 34);
}

function genEnemies() {
  console.log("making enemies")
  if (enemies_arr.length < 20) 
  {
  enemy = {
    
  id: Math.random(),
  x:Math.floor(Math.random() * (1500 - 1) + 1),
  y:Math.floor(Math.random() * (1100 - 1) + 1),
  x_velocity: 100,
  y_velocity: 200,
  alerted_timer:0,
  target:null,
  direction:1,
  change_direction_timer:0,
  health: 5,
  immunity: 0,
  knockback: 0,
  knock_back_direction: 1,
  attack: 1
  };
  
  enemies_arr.push(enemy);
    genEnemies();
  }
}

function damageEnemies(direction, id) {
  enemies_arr.forEach(function(enemy, index) {
    if (enemy.id == id) {
      if (enemy.immunity < Date.now()) {
        enemy.health -= 1;
        enemy.knock_back_direction = direction;
        enemy.knockback = Date.now() + 1000;
        enemy.immunity = Date.now() + 400;
      }
      
      if (enemy.health < 1) { enemies_arr.splice(index, 1) }
    }
    
  });
}

enemyLogic();
genEnemies();

io.on('connection', function(socket){
  
  
  socket.on('player_data', function(player){// ricieves new data from players

    player.socket_id = socket.id;
    addChangePlayerArr(player);
    
    io.emit('player_data', player_arr); //emits the player array
    io.emit('blocks_data', blocks_arr); //emits the block array
    io.emit('enemies_data', enemies_arr); //emits the enemy array
    
  });
  
  socket.on('block_data', function(block){// makes blocks
    addBlockArr(block);
    io.emit('blocks_data', blocks_arr);
  });
  
  socket.on('remove_block', function(block){// deletes blocks
    removeBlockArr(block);
    io.emit('blocks_data', blocks_arr); //emits the player array
  });
  
  socket.on('damage_enemy', function(enemy_dam){// deletes blocks
    damageEnemies(enemy_dam.facing, enemy_dam.id);
    console.log("in damage method")
  });
  
  
  
  socket.on('disconnect', function(){ //handles removeing players on dc
    removePlayerOnDC(socket.id);
    console.log("Player Disconnected")
  });
});

http.listen(port, function(){
  console.log('listening on *:8080');
});