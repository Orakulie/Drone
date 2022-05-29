import { Bodies, Body, Composite } from "matter-js";
import globals from "../globals";

export class Box {
	body!: Body;
	width: number;
	height: number;

	constructor(x: number, y: number, w: number, h: number) {
		this.width = w;
		this.height = h;
		this.body = Bodies.rectangle(x, y, w, h);
		Composite.add(globals.engine.world, this.body);
	}

	draw() {
		globals.ctx.fillStyle = "blue";
		globals.ctx.fillRect(this.body.position.x, this.body.position.y-this.height/2, this.width, this.height);
	}
}
