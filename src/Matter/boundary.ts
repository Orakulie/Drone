import { Bodies, Body, Composite } from "matter-js";
import { Mat } from "./matter";

export class Boundary {
	body!: Body;
	width: number;
	height: number;

	constructor(x: number, y: number, w: number, h: number) {
		this.width = w;
		this.height = h;
		this.body = Bodies.rectangle(x, y, w, h);
        this.body.isStatic = true;
		Composite.add(Mat.engine.world, this.body);
	}
}
