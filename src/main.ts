import { Chart, registerables } from "chart.js";
import { Mat } from "./Matter/matter";
import { Evolution } from "./evolution";
import { UI } from "./ui";

// const dpi = window.devicePixelRatio;
let evolution!: Evolution;

function setup() {
	// registers chart-js
	Chart.register(...registerables);
	console.log(UI.main_canvas.width);
	// creates new evolution to start
	evolution = new Evolution(UI.drone_count);
	// start update loop
	window.requestAnimationFrame(update);
}

async function update() {
	// calculate multiple iterations based on current speed
	for (let i = 0; i < UI.speed; i++) {
		await evolution.update();
		Mat.update();
	}
	window.requestAnimationFrame(update);
}

setup();

// function draw() {
// 	// RESET CANVAS
// 	globals.ctx.fillStyle = "#161616";
// 	globals.ctx.fillRect(0, 0, globals.canvas.width, globals.canvas.height);

// 	evolution.draw();
// }

// function fix_dpi() {
// 	const height = +getComputedStyle(globals.canvas).getPropertyValue("height").slice(0, -2);
// 	const width = +getComputedStyle(globals.canvas).getPropertyValue("width").slice(0, -2);
// 	globals.canvas.setAttribute("height", "" + height * dpi);
// 	globals.canvas.setAttribute("width", "" + width * dpi);
// }
