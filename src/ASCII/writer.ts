import { Vector } from "matter-js";
import * as tf from "@tensorflow/tfjs";
import { convert_ascii } from "./converter";
import { Neural_Network } from "../Drone/neural_network";
import { Drone } from "../Drone/drone";

export class Writer {
	// current displayed word
	_word!: String;
	// canvas used for the drones
	canvas!: HTMLCanvasElement;
	ctx!: CanvasRenderingContext2D;

	// space taken by each individual pixel
	pixel_size: number = 30;

	// all currently used drones
	drones: Drone[] = [];

	// input field used for changing the text
	input_field!: HTMLInputElement;

	// timer that is used to wait for a certain time before updating the current word
	input_timer!: NodeJS.Timeout;

	// drone brain that is used to create each drone. Pretrained & Loaded
	drone_brain!: Neural_Network;

	constructor(canvas: HTMLCanvasElement, starting_word: String) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d")!;
		this.input_field = document.getElementById("input-field") as HTMLInputElement;

		this.input_field.onchange = this.input_change.bind(this);
		this.input_field.onkeyup = this.input_change.bind(this);
		this.input_field.onpaste = this.input_change.bind(this);

		// load pretrained drone and set the starting word afterwards
		this.load_drone_brain().then((brain) => {
			this.drone_brain = brain;
			this.set_word(starting_word);
		});
	}

	/**
	 * @returns pretrained drone neural network
	 */
	async load_drone_brain() {
		const model = (await tf.loadLayersModel("/res/trained_drone/drone.json")) as tf.Sequential;
		const brain = new Neural_Network(model);
		return brain;
	}

	/**
	 * Updates every drone
	 */
	async update() {
		const to_be_removed: number[] = [];
		for (let i = 0; i < this.drones.length; i++) {
			const drone = this.drones[i];
			await drone.update();
			if (drone.is_destroyed) {
				to_be_removed.push(drone.brain.model.id);
			}
		}

		this.drones = this.drones.filter((drone) => {
			if (to_be_removed.includes(drone.brain.model.id)) {
				drone.dispose();
				return false;
			}
			return true;
		});
	}

	/**
	 * Draws every drone
	 */
	draw() {
		this.drones.forEach((drone) => {
			drone.draw();
		});
	}

	/**
	 * Wait for a certain delay before updating the current word.
	 * If there is another call while already waiting -> reset timer.
	 */
	input_change() {
		clearTimeout(this.input_timer);
		this.input_timer = setTimeout(() => {
			if (this.input_field.value) this.set_word(this.input_field.value);
		}, 500);
	}

	/**
	 * Disposes all drones
	 */
	dispose_drones() {
		this.drones.forEach((drone) => {
			drone.dispose();
		});
		this.drones = [];
	}

	get word() {
		return this._word;
	}

	/**
	 *	Sets the new word and spawns/destroys drones accordingly
	 * @param new_word new word to be set
	 */
	async set_word(new_word: String) {
		if (this.word == new_word) return;
		this._word = new_word;

		// all pixels that need to be "drawn"
		const positions: Vector[] = [];

		// x- & y-translation to center the word on the canvas
		const x_translation = (this.canvas.width - 5 * new_word.length * this.pixel_size) / 2;
		const y_translation = this.canvas.height / 2 - 4 * this.pixel_size;

		// calculate every pixel position on the canvas and save it to the positions array
		for (let i = 0; i < new_word.length; i++) {
			const letter = convert_ascii(new_word[i]);
			for (let x = 0; x < 6; x++) {
				for (let y = 0; y < 8; y++) {
					if (letter[x][y]) {
						const pos = Vector.create(
							x * this.pixel_size + i * 170 - this.pixel_size / 2 + x_translation,
							y * this.pixel_size - this.pixel_size / 2 + y_translation
						);
						positions.push(pos);
					}
				}
			}
		}

		// check if drones need to be added
		if (positions.length > this.drones.length) {
			for (let i = this.drones.length; i < positions.length; i++) {
				this.drones.push(new Drone(this.drone_brain.copy()));
			}
			// check if drones need to be removed
		} else if (positions.length < this.drones.length) {
			for (let i = positions.length; i < this.drones.length; i++) {
				this.drones[i].dispose();
			}
			this.drones.splice(positions.length, this.drones.length - positions.length);
		}

		// give each drone the new target (pixel)
		for (let i = 0; i < this.drones.length; i++) {
			const drone = this.drones[i];
			drone.set_target(positions[i]);
		}
	}
}
