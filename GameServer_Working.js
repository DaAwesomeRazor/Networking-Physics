global.performance = require('perf_hooks').performance;
global.Ammo = require('ammo.js')();

global.Vector3 = require('./math/Vector3');
global.PhysicsHelper = require('./Physics');

//Create server physics world
global.ServerPhysics = new PhysicsHelper();
//Create client physics World
global.ClientPhysics = new PhysicsHelper();

const MapLoader = require('./maps/MapLoader');
const Player = require('./Player');
const map = MapLoader.get('default');

const tmpVec = new Ammo.btVector3();

//Load in the map for the physics world
/*
map.forEach(triangle => {
	ServerPhysics.addTriangleMesh({
		scale: { x: 5, y: 5, z: 5 },
		triangles: triangle,
		mass: 0
	});
	
	ClientPhysics.addTriangleMesh({
		scale: { x: 5, y: 5, z: 5 },
		triangles: triangle,
		mass: 0
	});
});*/

const log = true

class Server {
	static init() {
		//Create the servers player using the Server Physics World
		this.player = new Player(ServerPhysics);
		this.actions = [];
		
		//Create the delta and tick interval
		this.physicsDelta = 1000 / 20;
		setInterval(this.tick.bind(this), this.physicsDelta);
	}

	static tick() {
		//Ticks the server physics world with 1000/20
		ServerPhysics.tick(this.physicsDelta, 1);

		//Log the players position
		if (log) {
			const pos = ServerPhysics.getPosition(this.player.body);
			console.log('SERVER', Math.round(pos.x * 1000) / 1000, Math.round(pos.y * 1000) / 1000, Math.round(pos.z * 1000) / 1000);
		}
	}

	static receiveInput(action) {
		//Moves the player with the clients delta as soon as a message is received
		this.player.move(action, action.delta);
	}
}

class Client {
	static init() {
		
		//Create the client player and pass the Client physics world
		this.player = new Player(ClientPhysics);

		this.lastTime = performance.now();

		
		this.action = {
			forwards: false,
			backwards: false,
			left: false,
			right: false,
			walking: false,
			onLadder: false,
			onGround: true,
			jump: false,
			clickR: false,
			clickL: false,
			clickM: false
		};
		
		//Create client physics tick
		this.tickCount = 0;
		setInterval(this.tick.bind(this), 1000 / 60);
	}

	static tick() {
		const now = performance.now();
		const delta = now - this.lastTime;
		this.lastTime = now;

		//Move the player with the current input and delta
		this.player.move(this.action, delta);
		
		//Send the input to the server
		this.sendInput(JSON.parse(JSON.stringify(this.action)), delta);
		
		//Tick the client physics world
		ClientPhysics.tick(delta, 1);

		if (log) {
			const pos = ClientPhysics.getPosition(this.player.body);
			console.log('CLIENT', Math.round(pos.x * 1000) / 1000, Math.round(pos.y * 1000) / 1000, Math.round(pos.z * 1000) / 1000);
		}
		
		/** START ACTION SIMULATION **/
		
		//This code simualtes actions on the client
		if (this.tickCount == 5) {
			this.action.forwards = true;
		}
		if (this.tickCount == 200) {
			this.action.forwards = false;
		}
		if (this.tickCount == 50) {
			this.action.right = true;
		}
		if (this.tickCount == 102) {
			this.action.right = false;
		}
		
		/** END ACTION SIMULATION **/
		
		//increments tickCount vairable 
		this.tickCount++
		
		
	}

	static sendInput(action, delta) {
		//Pass the clients delta in the input
		action.delta = delta;
		
		// Account for 150ms latency
		setTimeout(() => {
			Server.receiveInput(action, delta);
		}, 150);
	}
}

Server.init();
Client.init();

console.log('Game server loaded');
