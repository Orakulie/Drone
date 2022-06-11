import { Chart, registerables } from "chart.js";
import { Mat } from "./Matter/matter";
import { Evolution } from "./evolution";
import { UI } from "./ui";

// const dpi = window.devicePixelRatio;
let evolution!: Evolution;

function setup() {
	// registers chart-js
	Chart.register(...registerables);
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
		evolution.draw();
	}
	window.requestAnimationFrame(update);
}

setup();
