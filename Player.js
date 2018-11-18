const upAxis = new Ammo.btVector3(0, 1, 0);
const tmpVec = new Ammo.btVector3();
const speed = 1.2;
const jump = 377;

class Player {
	constructor(physics) {
		setDefaults(this);

		this.body = null;

		this.inputVelocity = new Vector3();
		this.direction = new Vector3();

		this.name = 'Unnamed';
		this.onGround = true;
		this.alive = false;

		this.inputs = [];
		
		this.physics = physics;
		this.spawn({});

		// setupNoSync(this);
	}

	onCollide(point) {
		const normal = point.get_m_normalWorldOnB();
		const dot = normal.dot(upAxis);

		if (dot >= 0.8) {
			this.onGround = true;
		}

		// else if (dot <= 0.2 && dot >= -0.2) {
		// if (object.name.toLowerCase().includes('ladder')) {
		// 	this.tmpVec.setValue(0, 45 - this.this.physicsBody.getLinearVelocity().y(), 0);
		// 	this.this.physicsBody.applyImpulse(this.tmpVec);
		// 	Controls.action.onLadder = true;
		// } else {
		// 	Controls.action.onLadder = false;
		// }
		// }
	}

	createBody() {
		this.body = this.physics.addCapsule({
			position: this.position,
			player: this,
			mass: 10
		});

		tmpVec.setValue(0, 0, 0);

		this.body.setCcdSweptSphereRadius(2);
		this.body.setCcdMotionThreshold(2);

		this.body.setAngularFactor(tmpVec);

		this.body.setCollisionFlags(8);
		this.body.setDamping(0.8, 0.4);
		this.body.setFriction(0);
	}

	processInput({ action, rotation }) {
		//this.rotation = rotation;

		this.inputs.push(action);
	}

	tick(delta) {
		const now = performance.now();
		console.log("LENGTH:" + this.inputs.length)
		this.inputs.forEach(action => {
			this.move(action, action.delta / this.inputs.length);
		});

		this.inputs.length = 0;
		
	}

	move(action, delta) {
		if (!this.body) return;

		const moveSpeed = speed * delta;

		this.inputVelocity.set(0, 0, 0);

		this.direction.z = action.backwards - action.forwards;
		this.direction.x = action.right - action.left;
		this.direction.normalize();

		if (action.forwards || action.backwards) this.inputVelocity.z = this.direction.z * moveSpeed;
		if (action.left || action.right) this.inputVelocity.x = this.direction.x * moveSpeed;

		this.inputVelocity.applyQuaternion({
			x: 0,
			y: this.rotation.body.y,
			z: 0,
			w: this.rotation.body.w
		});

		if (action.jump && this.onGround) {
			if (this.body.getLinearVelocity().y() < 4) {
				this.inputVelocity.y += jump;
			}

			this.onGround = false;
		}

		tmpVec.setValue(this.inputVelocity.x, this.inputVelocity.y, this.inputVelocity.z);
		this.body.applyImpulse(tmpVec);

		// const velocity = this.body.getLinearVelocity();

		// this.velocity = { x: velocity.x(), y: velocity.y(), z: velocity.z() };
	}

	spawn(data) {
		this.name = data.name;
		this.alive = true;

		this.createBody();
	}
}

function setupNoSync(player) {
	// Colyseus.nosync(player, 'inputVelocity');
	// Colyseus.nosync(player, 'direction');
	//Colyseus.nosync(player, 'body');
}

function setDefaults(player) {
	player.action = {
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

	player.position = {
		x: 0,
		y: 5,
		z: 0
	};

	player.velocity = {
		x: 0,
		y: 0,
		z: 0
	};

	player.rotation = {
		head: {
			x: 0,
			w: 1
		},
		body: {
			y: 0,
			w: 1
		}
	};
}

module.exports = Player;
