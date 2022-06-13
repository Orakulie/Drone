import Matter from "matter-js";
import { UI } from "../Trainer/ui";
import { Boundary } from "./boundary";

class Matter_Manager {
	// matter-js engine
	engine!: Matter.Engine;
	// list of all walls
	boundaries!: Boundary[];
	// Mouse tracker for the main canvas
	mouse!: Matter.Mouse;	
	

	constructor() {
		this.engine = Matter.Engine.create();
		this.mouse = Matter.Mouse.create(UI.main_canvas);
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
	new Boundary(UI.main_canvas.width / 2, UI.main_canvas.height + 10, UI.main_canvas.width * 4, 20),
	new Boundary(UI.main_canvas.width / 2, -10, UI.main_canvas.width, 20),
	new Boundary(-10, UI.main_canvas.height / 2, 20, UI.main_canvas.height),
	new Boundary(UI.main_canvas.width + 10, UI.main_canvas.height / 2, 20, UI.main_canvas.height),
];
