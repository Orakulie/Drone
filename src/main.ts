import Matter, { Composite, Engine, Events, MouseConstraint, Vector } from "matter-js";
import { Drone } from "./Objects/drone";
import globals from "./globals";
import { Boundary } from "./Objects/boundary";
import { Evolution } from "./Genetic_Algorithm/evolution";
import { sleep } from "./util";
import { UI } from "./ui";
import { Chart, registerables } from "chart.js";

const dpi = window.devicePixelRatio;
let evolution!: Evolution;
let sleep_time = 0;
let speed_multiplier = 1;

function setup() {
	// set canvas and ctx
	globals.canvas = document.getElementById("canvas") as HTMLCanvasElement;
	globals.ctx = globals.canvas.getContext("2d")!;
	globals.frame_count = 0;

	Chart.register(...registerables);

	// fix offset pixels
	fix_dpi();
	UI.fix_dpi();

	// create & set engine
	globals.engine = Matter.Engine.create();

	setup_world();

	// start update loop
	window.requestAnimationFrame(update);
	window.requestAnimationFrame(update_ui);
}

function setup_world() {
	globals.bodies = [];

	const boundaries: Boundary[] = [
		new Boundary(globals.canvas.width / 2, globals.canvas.height + 10, globals.canvas.width * 4, 20),
		new Boundary(globals.canvas.width / 2, -10, globals.canvas.width, 20),
		new Boundary(-10, globals.canvas.height / 2, 20, globals.canvas.height),
		new Boundary(globals.canvas.width + 10, globals.canvas.height / 2, 20, globals.canvas.height),
	];

	evolution = new Evolution(300);

	globals.mouse = Matter.Mouse.create(globals.canvas);
	globals.canvas.onmousedown = (evt) => {
		UI.select_drone(evt, evolution);
	};
	// const mouse_constraint = MouseConstraint.create(globals.engine, { mouse: globals.mouse });
	// Events.on(mouse_constraint, "mousedown", (evt) => {
	// 	UI.select_drone(evt, evolution);
	// });
	// Composite.add(globals.engine.world, mouse_constraint);

	globals.bodies.push(...boundaries.map((b) => b.body));

	UI.time_change((time_value: number) => {
		if (time_value >= 1) {
			speed_multiplier = Math.round(+time_value);
			sleep_time = 0;
		} else if (time_value < 1 && time_value > 0) {
			speed_multiplier = 1;
			sleep_time = 1 / time_value;
		} else {
			//TODO IMPLEMENT TIME FREEZE
			sleep_time = 10;
		}
	});
}

async function update() {
	for (let i = 0; i < speed_multiplier; i++) {
		evolution.update();
		draw();
		Matter.Engine.update(globals.engine);
		globals.frame_count++;
		if (sleep_time != 0) await sleep(sleep_time * 1000);
	}
	window.requestAnimationFrame(update);
}

function update_ui() {
	UI.draw_info();
	window.requestAnimationFrame(update_ui);
}

function draw() {
	// RESET CANVAS
	globals.ctx.fillStyle = "#161616";
	globals.ctx.fillRect(0, 0, globals.canvas.width, globals.canvas.height);

	evolution.draw();
}

function fix_dpi() {
	const height = +getComputedStyle(globals.canvas).getPropertyValue("height").slice(0, -2);
	const width = +getComputedStyle(globals.canvas).getPropertyValue("width").slice(0, -2);
	globals.canvas.setAttribute("height", "" + height * dpi);
	globals.canvas.setAttribute("width", "" + width * dpi);
}

setup();
