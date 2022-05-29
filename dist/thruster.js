import { Vector } from "./util";
export class Thruster {
    max_vel;
    vel;
    power = 0;
    acc;
    is_activated = false;
    constructor(max_vel, acc) {
        this.max_vel = max_vel;
        this.vel = new Vector(0, 0);
        this.acc = acc;
    }
    turn_on() {
        this.is_activated = true;
    }
    turn_off() {
        this.is_activated = false;
    }
    toggle() {
        this.is_activated = !this.is_activated;
    }
    update() {
        if (this.is_activated) {
            this.power += this.acc;
            if (this.power > 1) {
                this.power = 1;
            }
            // if (this.vel.x < this.max_vel.x) {
            // 	this.vel.x += this.acc.x;
            // }
            // if (this.vel.y < this.max_vel.y) {
            // 	this.vel.y += this.acc.y;
            // }
        }
        if (!this.is_activated) {
            this.power -= this.acc;
            if (this.power < 0) {
                this.power = 0;
            }
            // if (this.vel.x > 0) {
            // 	this.vel.x -= this.acc.x;
            // }
            // if (this.vel.y > 0) {
            // 	this.vel.y -= this.acc.y;
            // }
        }
        this.vel = this.max_vel.times(this.power);
    }
}
