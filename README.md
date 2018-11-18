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
    Physics.tick(delta)
}

function onmessage(playerId, input) {
    const player = getPlayer(playerId);
    player.applyInput(input, input.delta)
}
setInterval(tick, 1000 / 20); //20 tps
```
#### The Problem
When I try this code, the positions are very different
```
CLIENT 47.701 -657.194 -222.432
CLIENT 48.321 -658.144 -233.892
```

### The positions match up when I disable the ingame map

I noticed when I comment out the code for the ingame map(which is equivalent to disabling collisions), the positions match up perfectley
after all inputs are processed. I did this in [GameServer_Working.js](GameServer_Working.js)

The output for that code is
```
SERVER 54.842 -701.546 -265.926
CLIENT 54.842 -765.695 -265.926
```
