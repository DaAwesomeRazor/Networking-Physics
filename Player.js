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

	}

	onCollide(point) {
		const normal = point.get_m_normalWorldOnB();
		const dot = normal.dot(upAxis);

		if (dot >= 0.8) {
			this.onGround = true;
		}

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

	processInput(action) {
		//Push the input to an array
		this.inputs.push(action);
	}

	tick() {
		//Every tick loop through the inputs and apply them
		//Do delta / inputs.length(not sure if that is correct)
		
		if (this.inputs.length < 3) return;
		
		for (var i = 0;i < 3;i++) {
			this.move(this.inputs[i], this.inputs[i].delta);
			
		}
		this.inputs.splice(0, 3);
		//fancy way of clearing the inputs
		//this.inputs.length = 0;
		
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
	}

	spawn(data) {
		this.name = data.name;
		this.alive = true;

		this.createBody();
	}
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
