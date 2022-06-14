import { Chart, registerables } from "chart.js";
import { Mat } from "./Matter/matter";
import { Evolution } from "./Trainer/evolution";
import { UI } from "./Trainer/ui";

// const dpi = window.devicePixelRatio;
let evolution!: Evolution;

function setup() {
	// registers chart-js
	Chart.register(...registerables);
	// setting canvas
	Mat.set_canvas(UI.main_canvas);
	// creates new evolution to start
	evolution = new Evolution();

	// start update loop
	window.requestAnimationFrame(update);
}

async function update() {
	if (!UI.time_stop) {
		// calculate multiple iterations based on current speed
		for (let i = 0; i < UI.speed; i++) {
			await evolution.update();
			Mat.update();
		}
	}
	evolution.draw();
	window.requestAnimationFrame(update);
}

setup();
