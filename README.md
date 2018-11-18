# Networking Physics

#### What I am trying to do:
I am trying to implement client-side prediction in a real-time 3d game. I am using a custom version of [Ammo.js](https://github.com/kripken/ammo.js/) which is a javascript port of Bullet Physics.  What I want to do is to be able to simulate and synchronize a physics world on the **client** and **server**. 

##### Client Pseudo Code

```javascript
	var action = {forwards: false, backwards: false, left: false ,right: false}
	function tick() {
	    for (const player in players) {
	        player.applyInput(action, delta);
	    }
        Socket.send(action, delta)
        Physics.tick(delta)
    }

    setInterval(tick, 1000 / 60); //60 tps
```
