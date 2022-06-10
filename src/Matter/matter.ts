import Matter from "matter-js";
import { Config } from "../config";
import { Boundary } from "./boundary";

class Matter_Manager {
	// matter-js engine
	engine!: Matter.Engine;
	// list of all walls
	boundaries!: Boundary[];

	constructor() {
		this.engine = Matter.Engine.create();
	}

	add_boundary(boundary: Boundary) {
		this.boundaries.push(boundary);
	}

	update() {
		Matter.Engine.update(this.engine);
	}
}

export const Mat = new Matter_Manager();

// create walls on the canvas border
Mat.boundaries = [
	new Boundary(Config.canvas.width / 2, Config.canvas.height + 10, Config.canvas.width * 4, 20),
	new Boundary(Config.canvas.width / 2, -10, Config.canvas.width, 20),
	new Boundary(-10, Config.canvas.height / 2, 20, Config.canvas.height),
	new Boundary(Config.canvas.width + 10, Config.canvas.height / 2, 20, Config.canvas.height),
];
