# Networking Physics

## What is this?
The code in the repository is a client-side prediction simulation. Instead of having the client and server seperated from browser and node process, I merged them for testing purposes. This is so I can easily figure out how to synchronize 2 physics worlds and the positions of a player. Currentley it assumed there is only 1 player, however it will work for more.

#### What I am trying to do:
I am trying to implement client-side prediction in a *real-time 3d game*. I am using a custom version of [Ammo.js](https://github.com/kripken/ammo.js/) which is a javascript port of Bullet Physics.  What I want to do is to be able to simulate and synchronize a physics world on the **client** and **server**. 

#### Client Pseudo Code

```javascript
var action = {
    forwards: false,
    backwards: false,
    left: false,
    right: false
}

function tick() {
    const delta = 1000 / 60;
    //Apply input on client(client-side prediciont)
    player.applyInput(action, delta);
    
    //Send the input to the server
    Socket.send(action, delta)
    
    //tick client physics
    Physics.tick(delta)
}
setInterval(tick, 1000 / 60); //60 tps
```

#### Server Pseudo Code

```javascript
var players = {}
function tickServer() {
    const delta = 1000 / 20;
    
    //loop through all players
    for (const player in players) {
    
        //Apply all stores/unprocessed inputs(move player)
        for (var i = 0;i < player.inputs;i++) {
            player.applyInput(player.inputs[i], delta / player.inputs)
        }
        player.inputs = [];
    }
    //Tick Server Physics
    Physics.tick(delta)
}

function onmessage(playerId, input) {
    var player = this.players[playerId];
    if (!player) this.players[playerId] = [];
    
    //store the inputs to apply on tick
    this.players[playerId].push(input);
}
setInterval(tick, 1000 / 20); //20 tps
```
#### The Problem
When I try this code, after all the inputs are processed he final positions are very different
```
SERVER 16.362 -635.418 -78.911
CLIENT 47.701 -657.194 -233.892
```

### How I match up the positions and why it wont work
I noticed that if I **move and tick the server physics** as soon as I *receive a message* the positions will match up perfectley. I showed this in [GameServer_Working.js](GameServer_Working.js), where I do

```javascript
//Receive input is when I receive a message from the client
static receiveInput(action) {
	//Moves the player with the clients delta as soon as a message is received
	this.player.move(action, action.delta);
	//Ticks the server physics world as soon as the message is received
	ServerPhysics.tick(action.delta, 1);
}
```
The output for that code is
```
CLIENT 47.544 -742.495 -232.633
SERVER 47.544 -732.672 -232.633
```

As you can see after the inputs are processed the positions are matched up completley(except for the y which makes sense since the server is behind and the player is constantly falling)

however, this wouldnt work as it ticks the physics after every input received which would not work with multiple players.

