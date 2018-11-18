const transform = new Ammo.btTransform();
const tempQuat = new Ammo.btQuaternion();
const tempVec = new Ammo.btVector3();

class Physics {
	 constructor() {
		const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

		const solver = new Ammo.btSequentialImpulseConstraintSolver();
		const broadphase = new Ammo.btDbvtBroadphase();

		this.world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
		this.dispatcher = dispatcher;

		this.gravity = new Ammo.btVector3(0, -100, 0);
		this.world.setGravity(this.gravity);

		this.bodyToPlayerMap = new Map();
		this.syncQueue = [];

		this.collisionMap = new Map();
		this.addCollisionCallbacks();
		
		this.id = Math.random();
	}

	 moveBody(body, newPos, newQuat) {
		const transform = body.getWorldTransform();

		if (newQuat) {
			tempQuat.setValue(newQuat.x, newQuat.y, newQuat.z, newQuat.w);
			transform.setRotation(tempQuat);
		}

		if (newPos) {
			tempVec.setValue(newPos.x, newPos.y, newPos.z);
			transform.setOrigin(tempVec);
		}
	}

	 getPosition(body) {
		const motionState = body.getMotionState();
		if (!motionState) return;

		motionState.getWorldTransform(transform);
		const position = transform.getOrigin();

		return { x: position.x(), y: position.y(), z: position.z() };
	}

	 addCollisionCallbacks() {
		// Added, Destroyed, Processed
		function contactProcessedCallback(point_ptr, bodyA_ptr, bodyB_ptr) {
			const point = Ammo.wrapPointer(point_ptr, Ammo.btManifoldPoint);
			const bodyA = Ammo.wrapPointer(bodyA_ptr, Ammo.btRigidBody);
			const bodyB = Ammo.wrapPointer(bodyB_ptr, Ammo.btRigidBody);

			const bodyA_id = bodyA.getUserIndex();
			const bodyB_id = bodyB.getUserIndex();

			const playerA = this.bodyToPlayerMap.get(bodyA_id);
			const playerB = this.bodyToPlayerMap.get(bodyB_id);

			if (!this.collisionMap.has(bodyA_id)) {
				this.collisionMap.set(bodyA_id, bodyB_id);

				point.set_m_userPersistentData(bodyA_id);

				if (playerA && playerA.onCollideBegin) playerA.onCollideBegin(point);
				if (playerB && playerB.onCollideBegin) playerB.onCollideBegin(point);
			} else {
				if (playerA && playerA.onCollideUpdate) playerA.onCollideUpdate(point);
				if (playerB && playerB.onCollideUpdate) playerB.onCollideUpdate(point);
			}
		}

		const contactProcessedCallback_ptr = Ammo.addFunction(contactProcessedCallback.bind(this));
		this.world.setContactProcessedCallback(contactProcessedCallback_ptr);

		function contactDestroyedCallback(bodyA_id) {
			const bodyB_id = this.collisionMap.get(bodyA_id);

			const playerA = this.bodyToPlayerMap.get(bodyA_id);
			const playerB = this.bodyToPlayerMap.get(bodyB_id);

			this.collisionMap.delete(bodyA_id);

			if (playerA && playerA.onCollideEnd) playerA.onCollideEnd();
			if (playerB && playerB.onCollideEnd) playerB.onCollideEnd();
		}

		const contactDestroyedCallback_ptr = Ammo.addFunction(contactDestroyedCallback.bind(this));
		this.world.setContactDestroyedCallback(contactDestroyedCallback_ptr);
	}

	 addCapsule(settings) {
		const shape = new Ammo.btCapsuleShape(1.6, 1.1);

		return this.createBody(settings, shape);
	}

	 addBox(settings) {
		const shape = this.createBoxShape(settings);

		return this.createBody(settings, shape);
	}

	 addPlane(settings) {
		const shape = this.createPlaneShape();

		return this.createBody(settings, shape);
	}

	 addTriangleMesh(settings) {
		const shape = this.createTriangleMeshShape(settings);
		return this.createBody(settings, shape);
	}

	 createBoxShape({ width, height, depth }) {
		const dimensions = new Ammo.btVector3(width / 2, height / 2, depth / 2);
		const shape = new Ammo.btBoxShape(dimensions);

		return shape;
	}

	 createPlaneShape() {
		const shape = new Ammo.btPlaneShape(new Ammo.btVector3(0, 0, 1), 0.1);

		return shape;
	}

	 createTriangleMeshShape({ triangles, scale }) {
		const triangleMesh = new Ammo.btTriangleMesh();
		const xVec = new Ammo.btVector3();
		const yVec = new Ammo.btVector3();
		const zVec = new Ammo.btVector3();

		for (const triangle of triangles) {
			xVec.setX(triangle[0].x * scale.x);
			xVec.setY(triangle[0].y * scale.y);
			xVec.setZ(triangle[0].z * scale.z);

			yVec.setX(triangle[1].x * scale.x);
			yVec.setY(triangle[1].y * scale.y);
			yVec.setZ(triangle[1].z * scale.z);

			zVec.setX(triangle[2].x * scale.x);
			zVec.setY(triangle[2].y * scale.y);
			zVec.setZ(triangle[2].z * scale.z);

			triangleMesh.addTriangle(xVec, yVec, zVec, true);
		}

		const shape = new Ammo.btBvhTriangleMeshShape(triangleMesh, true, true);
		return shape;
	}

	 createBody(settings, shape) {
		const rotation = this._getDefault(settings, 'rotation');
		const position = this._getDefault(settings, 'position');

		const mass = settings.mass == null ? 5 : settings.mass;

		const transform = new Ammo.btTransform();
		transform.setIdentity();

		tempQuat.setEulerZYX(rotation.z, rotation.y, rotation.x);
		tempVec.setValue(position.x, position.y, position.z);

		transform.setRotation(tempQuat);
		transform.setOrigin(tempVec);

		const localInertia = new Ammo.btVector3(0, 0, 0);
		shape.calculateLocalInertia(mass, localInertia);

		const motionState = new Ammo.btDefaultMotionState(transform);

		const bodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
		const body = new Ammo.btRigidBody(bodyInfo);
		this.world.addRigidBody(body);

		const id = Math.floor((Math.random() * Date.now()) / 10000);
		body.setContactProcessingThreshold(0);
		body.setRestitution(0);
		body.setUserIndex(id);

		if (mass == 0) {
			body.setActivationState(8);
		} else {
			body.setActivationState(4);
		}

		if (settings.player) {
			if (mass > 0) this.syncQueue.push(settings.player);
			this.bodyToPlayerMap.set(id, settings.player);

			settings.player.onCollideUpdate = settings.player.onCollide;
			settings.player.onCollideBegin = settings.player.onCollide;
		}

		return body;
	}

	 _getDefault(settings, name, defaultVal = 0) {
		const prop = settings[name] || {};
		prop.x = prop.x || defaultVal;
		prop.y = prop.y || defaultVal;
		prop.z = prop.z || defaultVal;

		return prop;
	}

	 tick(delta, times) {
		this.world.stepSimulation(delta / 1000, 10 * times);

		this._sync();
	}

	 _sync() {
		this.syncQueue.forEach(player => {
			const body = player.body;

			const motionState = body.getMotionState();
			if (!motionState) return;

			motionState.getWorldTransform(transform);
			const position = transform.getOrigin();
			// const quat = transform.getRotation();

			player.position.x = position.x();
			player.position.y = position.y();
			player.position.z = position.z();

			// TODO: Actually rotation (quaternion to euler shit)
		});
	}
}


module.exports = Physics;
