# Networking Physics

#### What I am trying to do:
I am trying to implement client-side prediction in a real-time 3d game. I am using a custom version of [Ammo.js](https://github.com/kripken/ammo.js/) which is a javascript port of Bullet Physics.  What I want to do is to be able to simulate and synchronize a physics world on the **client** and **server**. 

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
