import Matter, { Composite, Constraint, IConstraintDefinition, Vector } from "matter-js";
import { Bodies, Body } from "matter-js";
import globals from "../globals";
import { draw_body } from "../util";
import { Drone } from "./drone";

export class Thruster {
	drone!: Drone;
	force!: number;
	current_force!: number;

	// full_force_time: number = 4;
	// current_force_time: number;
	body: Body;

	power!: number;

	constructor(drone: Drone, relative_position: Vector, force: number) {
		this.drone = drone;
		this.force = force;
		// this.current_force_time = 0;

		this.body = Bodies.rectangle(
			this.drone.main_body.position.x + relative_position.x,
			this.drone.main_body.position.y + relative_position.y,
			5,
			10,
			{ isSensor: true }
		);

		this.current_force = 0;
		this.power = 0;
	}

	set_angle(angle: number) {
		Body.setAngle(this.body, angle);
	}

	set_power(power: number) {
		this.current_force = power * this.force;
	}

	get_force() {
		return Matter.Vector.create(this.body.axes[1].y * this.current_force, this.body.axes[0].y * this.current_force);
	}

	update() {
		// if (this.current_force_time < 1) {
		// 	this.current_force;
		// 	this.current_force.x = lerp(this.current_force.x, this.force.x, this.current_force_time);
		// 	this.current_force.y = lerp(this.current_force.y, this.force.y, this.current_force_time);
		// 	this.current_force_time += 1 / this.full_force_time;
		// }
		Body.applyForce(this.drone.body, this.body.position, this.get_force());
	}

	draw() {
		draw_body(globals.ctx, this.body);
	}
}
