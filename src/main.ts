import { Mat } from "./Matter/matter";
import { Evolution } from "./evolution";
import * as tf from "@tensorflow/tfjs-node";

let evolution!: Evolution;

function setup() {
	tf.setBackend("cpu")
	// creates new evolution to start
	evolution = new Evolution();
	// start update loop
	update();
}

async function update() {
	// calculate multiple iterations based on current speed
	await evolution.update();
	Mat.update();
	update();
}

setup();
