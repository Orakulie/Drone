import { Bodies, Composite } from "matter-js";
import { Thruster } from "./thruster";
import { Vector } from "./util";
export class Drone {
    pos;
    vel;
    size = 20;
    max_speed = 8;
    thrusters = [];
    constructor() {
        this.pos = new Vector(Math.round(canvas.width / 2), Math.round(canvas.height / 2));
        this.vel = new Vector(0, 0);
        this.thrusters.push(new Thruster(new Vector(0, -0.13), 0.05));
        this.thrusters[0].toggle();
        const drone = Bodies.rectangle(this.pos.x, this.pos.y, this.size, this.size);
        Composite.add(engine.world, drone);
    }
    update() {
        this.thrusters.forEach((thruster) => {
            thruster.update();
        });
        this.vel = this.vel.add(this.thrusters[0].vel);
        this.vel.y += 0.1;
        if (this.vel.x > this.max_speed) {
            this.vel.x = this.max_speed;
        }
        if (this.vel.y > this.max_speed) {
            this.vel.y = this.max_speed;
        }
        console.log(this.thrusters[0].vel);
        console.log(this.vel);
        this.pos = this.pos.add(this.vel);
        if (this.pos.x < 0) {
            this.pos.x = 0;
        }
        else if (this.pos.x + this.size > canvas.width) {
            this.pos.x = canvas.width - this.size;
        }
        if (this.pos.y + this.size > canvas.height) {
            this.pos.y = canvas.height - this.size;
        }
        else if (this.pos.y < 0) {
            this.pos.y = 0;
        }
    }
    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.pos.x, this.pos.y, this.size, this.size);
    }
}
