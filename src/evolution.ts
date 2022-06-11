import { Drone } from "./Drone/drone";
import * as tf from "@tensorflow/tfjs";
import { UI } from "./ui";
import { Neural_Network } from "./Drone/neural_network";
import { mod } from "@tensorflow/tfjs";

export class Generation {
	// total fitness of the generation
	fitness!: number;
	// drone with the highest score
	best_drone!: Drone;
	// generation id (counter)
	id!: number;

	constructor(id: number, fitness: number, best_drone: Drone) {
		this.id = id;
		this.fitness = fitness;
		this.best_drone = best_drone;
	}
}

export enum Visual_State {
	show_all,
	show_best,
}

export class Evolution {
	// amount of drones to spawn each generation
	drone_amount!: number;
	// list of all drones in the current generation
	drones!: Drone[];
	// generation counter
	generation_count!: number;
	// amount of elites in %, that are taken over to next generation
	elite_count!: number;
	// all previous generations
	generations!: Generation[];
	// highscore
	highscore!: number;

	constructor() {
		this.drone_amount = UI.drone_count;
		this.drones = [];
		this.generations = [];
		this.generation_count = 1;
		this.elite_count = 0.1;
		this.highscore = 0;

		UI.drone_callback = () => {
			this.drone_amount = UI.drone_count;
		};

		UI.save_callback = this.save_best_drone.bind(this);
		UI.load_callback = this.reset.bind(this);

		// init all drones
		for (let i = 0; i < this.drone_amount; i++) {
			const drone = new Drone();
			this.drones.push(drone);
		}
	}

	save_best_drone() {
		this.drones[0].brain.model.save("downloads://drone");
	}

	async load_drone(files: FileList) {
		const file_array = [...files];
		if (file_array.length == 2) {
			if (!file_array[0].name.includes("json")) {
				const temp = file_array[0];
				file_array[0] = file_array[1];
				file_array[1] = temp;
			}
			const model = (await tf.loadLayersModel(tf.io.browserFiles(file_array))) as tf.Sequential;
			const brain = new Neural_Network(model);
			const drone = new Drone(brain);
			return drone;
		}

		throw new Error("Invalid Files");
	}

	async reset() {
		const files = UI.load_input.files;
		if (!files) return;

		this.generation_count = 1;
		this.generations = [];
		this.highscore = 0;
		UI.generation = this.generation_count;
		UI.best_score = 0;
		UI.reset_chart();

		const loaded_drone = await this.load_drone(files);
		for (let i = 0; i < this.drone_amount; i++) {
			this.drones[i].dispose();

			let drone!: Drone;
			if (i == 0) drone = loaded_drone;
			else drone = this.breed(loaded_drone, loaded_drone);
			this.drones[i] = drone;
		}
	}

	async update() {
		// if all drones are destroyed -> next generation
		if (this.drones.every((drone) => drone.is_destroyed)) {
			this.init_next_generation();
			return;
		}
		// otherwise update each drone
		for (let i = 0; i < this.drones.length; i++) {
			const drone = this.drones[i];
			await drone.update();
		}

	}

	draw() {
		UI.clear_canvas(UI.main_ctx);

		// draw all drones or only the best one.
		for (let i = 0; i < this.drones.length; i++) {
			const drone = this.drones[i];
			if (i == 0 || UI.visual_state == Visual_State.show_all) {
				drone.draw();
			}
		}
	}

	/**
	 * Initialize next generation by taking and breeding the good drones to create the drones for the new generation
	 */
	init_next_generation() {
		// normalize scores and sort based on it
		const generation_fitness = this.evaluate_generation();

		// breed based on fitness
		const new_drones: Drone[] = [];

		// amount of elites based on drone_amount and elite_count percentage
		const elites = Math.max(Math.floor(this.drone_amount * this.elite_count), 1);

		// best drones gets taken over the next generation
		for (let i = 0; i < elites; i++) {
			const best_drone = this.drones[i];
			if (best_drone) {
				const new_drone = new Drone(best_drone.brain.copy());
				new_drones.push(new_drone);
				if (best_drone.score > this.highscore) {
					this.highscore = best_drone.score;
					UI.best_score = this.highscore;
				}
			}
		}

		// all slots are filled by randomly selecting two parents and creating offspring
		for (let i = elites; i < this.drone_amount; i++) {
			const new_drone = this.breed(this.choose_drone(), this.choose_drone());
			new_drones.push(new_drone);
		}

		// save current generation
		this.generations.push(new Generation(this.generation_count, generation_fitness, this.drones[0].copy()));

		// update chart
		UI.update_chart(this.generations);

		// dispose all old drones
		this.drones.forEach((drone) => {
			drone.dispose();
		});

		// set new drones
		this.drones = new_drones;
		this.generation_count++;
		UI.generation = this.generation_count;
	}

	/**
	 * Normalizes drone fitness and calculates the average
	 * @returns average fitness
	 */
	evaluate_generation() {
		// normalize the drones score
		const fitness_sum = this.drones.reduce((sum, drone) => sum + drone.score, 0);
		this.drones.forEach((drone) => (drone.fitness = drone.score / fitness_sum));
		// sort drones by fitness
		this.drones.sort((drone_a, drone_b) => {
			return drone_b.fitness - drone_a.fitness;
		});
		console.log(`Generation ${this.generation_count}: ${fitness_sum}\nBest Score: ${this.drones[0].score}`);
		// return average fitness
		return fitness_sum / this.drones.length;
	}

	/**
	 * Creates a new drone based on the characteristics of two given parents
	 * @param drone_a parentA
	 * @param drone_b parentB
	 * @returns child drone
	 */
	breed(drone_a: Drone, drone_b: Drone) {
		const new_brain = drone_a.brain.crossover(drone_b.brain.model);
		//const new_brain = drone_a.brain.copy();
		new_brain.mutate();
		return new Drone(new_brain);
	}

	/**
	 *  Randomly select a drone. Prioritize those with a higher fitness
	 * @returns randomly selected drone based on fitness
	 */
	choose_drone() {
		let index = 0;
		let r = Math.random();
		while (r > 0) {
			r = r - this.drones[index].fitness;
			index++;
		}
		index--;
		return this.drones[index];
	}
}
