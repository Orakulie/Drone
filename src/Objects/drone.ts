import Matter, { Bodies, Body, Composite, Events, Vector } from "matter-js";
import globals from "../globals";
import { Thruster } from "./thruster";
import { Drone_Inputs, Neural_Network } from "../Neural_Network/neural_network";
import { calculate_distance, draw_body } from "../util";
import { Evolution } from "../Genetic_Algorithm/evolution";

export class Drone {
	body!: Body;
	main_body!: Body;

	// main_body size
	size: number = 20;
	// thrusters - 2 at the moment
	thrusters: Thruster[] = [];

	brain!: Neural_Network;

	// timer keeping track of current spent iterations
	timer!: number;
	// max amount of iterations before drone is supposed to reach target
	max_duration!: number;

	// drone goal
	targets = [
		Vector.create(globals.canvas.width / 2, globals.canvas.height / 2),
		Vector.create(400, 400),
		Vector.create(200, 350),
		Vector.create(600, 200),
	];
	current_target = 0;
	target_arrived: number = 0;
	target_arrived_total: number = 0;

	// score evaluated while flying
	score!: number;
	// fitness normalized score after generation is completed
	fitness!: number;

	is_destroyed!: boolean;
	constructor(brain: Neural_Network | null = null) {
		// create main_body of drone
		this.main_body = Bodies.rectangle(
			Math.round(globals.canvas.width / 2),
			Math.round(globals.canvas.height) - 200,
			this.size,
			this.size
		);

		// create 2 thrusters and add them to the drone body
		this.thrusters.push(new Thruster(this, Vector.create(10, 10), -0.0004));
		this.thrusters.push(new Thruster(this, Vector.create(-10, 10), -0.0004));
		const body_options: Matter.IBodyDefinition = { parts: [this.main_body], collisionFilter: { group: -1 } };
		for (let i = 0; i < this.thrusters.length; i++) {
			const thruster = this.thrusters[i];
			body_options.parts!.push(thruster.body);
		}
		this.body = Body.create(body_options);
		Composite.add(globals.engine.world, this.body);

		this.score = 0;
		this.fitness = 0;
		this.is_destroyed = false;
		if (brain) {
			this.brain = brain;
		} else {
			this.brain = new Neural_Network();
		}

		this.timer = 0;
		this.max_duration = 1000;
	}

	draw() {
		draw_body(globals.ctx, this.main_body);
		this.thrusters.forEach((thruster) => thruster.draw());
	}

	update() {
		if (this.is_destroyed || !this.targets[this.current_target]) return;

		// check if the drone is colliding with the ground
		globals.bodies.forEach((body) => {
			if (body.isStatic) {
				const is_colliding = Matter.SAT.collides(this.body, body);
				// if (is_colliding && this.score > 1) {
				// 	this.score -= 1;
				// }
				if (is_colliding && this.targets[this.current_target]) {
					this.is_destroyed = true;
					this.target_arrived = 0;
					Composite.remove(globals.engine.world, this.body, true);
					//this.score +=  Math.round(this.get_distance_to_taget()! * 0.1);
					// this.score = Math.round(this.score / 2);
				}
			}
		});

		let distance_score = 1 / (this.get_distance_to_taget()! + 1);
		this.score += Math.pow(distance_score, 1);

		// disaprove spinning
		// if (this.body.angularSpeed > 0.1 && this.score > 1) {
		// 	this.score -= 1;
		// }
		// check if the drone is on the target_positon -> increase score
		// if (
		// 	this.targets[this.current_target] &&
		// 	this.body.position.x > this.targets[this.current_target].x - 15 &&
		// 	this.body.position.x < this.targets[this.current_target].x + 15 &&
		// 	this.body.position.y > this.targets[this.current_target].y - 15 &&
		// 	this.body.position.y < this.targets[this.current_target].y + 15
		// ) {
		// 	this.score += 10;
		// }

		if (calculate_distance(this.targets[this.current_target], this.body.position) <= 20) {
			this.target_arrived++;
			if (this.target_arrived == 100) {
				//this.score += 25;
				this.score += (this.max_duration - this.timer) * 0.1;
				this.current_target++;
				this.target_arrived = 0;
				this.timer = 0;

				if (this.current_target == this.targets.length) {
					this.current_target = 0;
					this.is_destroyed = true;
				}
			}
			this.target_arrived_total++;
		} else {
			this.target_arrived = 0;
		}
		// calculate the next action
		this.calculate_action();

		// update all thrusters
		for (let i = 0; i < this.thrusters.length; i++) {
			const thruster = this.thrusters[i];
			thruster.update();
		}

		this.timer++;
		if (this.timer == this.max_duration) {
			this.is_destroyed = true;
		}
	}

	get_distance_to_taget() {
		const distance = Math.sqrt(
			Math.pow(this.targets[this.current_target].y - this.body.position.y, 2) +
				Math.pow(this.targets[this.current_target].x - this.body.position.x, 2)
		);
		return Math.round(distance);
	}

	get target_vector() {
		return Vector.sub(this.targets[this.current_target], this.body.position);
	}

	set_target(position: Vector) {
		this.targets[this.current_target] = position;
	}

	calculate_action() {
		if (this.targets[this.current_target] == null) return;
		// const target_vector = Vector.div(Vector.sub(this.targets[this.current_target], this.body.position), Evolution.max_distance);
		const target_vector = Vector.sub(this.targets[this.current_target], this.body.position);
		const inputs: Drone_Inputs = {
			velocity: this.body.velocity,
			angular_velocity: this.body.angularVelocity,
			angle: this.body.angle,
			target_vector: target_vector,
		};

		const outputs = this.brain.predict(inputs);

		const left_thrust = Math.abs(outputs[0]);
		const right_thrust = Math.abs(outputs[1]);

		const left_angle = outputs[2] * 2 * Math.PI;
		const right_angle = outputs[3] * 2 * Math.PI;

		this.thrusters[0].set_angle(left_angle);
		this.thrusters[1].set_angle(right_angle);

		this.thrusters[0].set_power(left_thrust);
		this.thrusters[1].set_power(right_thrust);
	}

	dispose() {
		// const body_index = globals.bodies.findIndex((i) => i == this.main_body);
		// globals.bodies.splice(body_index, 1);
		// const left_thruster_index = globals.bodies.findIndex((i) => i == this.thrusters[0].body);
		// globals.bodies.splice(left_thruster_index, 1);
		// const right_thruster_index = globals.bodies.findIndex((i) => i == this.thrusters[1].body);
		// globals.bodies.splice(right_thruster_index, 1);

		Composite.remove(globals.engine.world, this.body, true);
		delete this.thrusters[0];
		delete this.thrusters[1];
		this.brain.dispose();
	}
	copy() {
		const drone_copy = new Drone(this.brain.copy());
		drone_copy.score = this.score;
		return drone_copy;
	}
}
