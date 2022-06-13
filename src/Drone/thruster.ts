import Matter, { Vector } from "matter-js";
import { Bodies, Body } from "matter-js";
import { UI } from "../Trainer/ui";
import { draw_body } from "../util";
import { Drone } from "./drone";

export class Thruster {
	// the drone that the thruster is attached to
	drone!: Drone;
	// max thruster force
	force!: number;
	// current thruster power
	power!: number;
	// current_force = power * force
	current_force!: number;
	// matter-js body
	body: Body;

	constructor(drone: Drone, relative_position: Vector, force: number) {
		this.drone = drone;
		this.force = force;

		// creates matter-js body with no collisions
		this.body = Bodies.rectangle(
			this.drone.main_body.position.x + relative_position.x,
			this.drone.main_body.position.y + relative_position.y,
			5,
			10,
			{ isSensor: true }
		);

		Body.setAngle(this.body, -Math.PI);
		// init variables
		this.current_force = 0;
		this.power = 0;
	}

	/**
	 *  Rotates the thruster to the given angle
	 * @param angle in radians
	 */
	set_angle(angle: number) {
		Body.setAngle(this.body, this.drone.main_body.angle + angle);
	}

	/**
	 *  Sets the thruster current_force to the max foce * given power
	 * @param power between 0 and 1
	 */
	set_power(power: number) {
		this.power = power;
		this.current_force = power * this.force;
	}

	/**
	 * @returns current_force direction vector
	 */
	get_force() {
		return Matter.Vector.create(this.body.axes[1].y * this.current_force, this.body.axes[0].y * this.current_force);
	}

	update() {
		// apply current_force to the drone body
		Body.applyForce(this.drone.body, this.body.position, this.get_force());
	}

	draw() {
		draw_body(UI.main_ctx, this.body);
		if(this.drone.is_destroyed) return;

		const angle = this.body.angle + this.drone.body.angle + Math.PI;
		const scale = Math.pow(1.6, this.power*9) + Math.random() * 10 + 10;
		UI.main_ctx.translate(this.body.position.x, this.body.position.y);
		UI.main_ctx.rotate(angle);
		UI.main_ctx.drawImage(UI.flame_image, -scale / 2, 0, scale, scale);
		UI.main_ctx.rotate(-angle);
		UI.main_ctx.translate(-this.body.position.x, -this.body.position.y);
	}
}
