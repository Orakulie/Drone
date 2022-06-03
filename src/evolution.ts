import { Drone } from "./Drone/drone";
import { UI } from "./ui";

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

	constructor(drone_amount: number) {
		this.drone_amount = drone_amount;
		this.drones = [];
		this.generations = [];
		this.generation_count = 1;
		this.elite_count = 0.1;

		UI.drone_callback = () => {
			this.drone_amount = UI.drone_count;
		};

		// init all drones
		for (let i = 0; i < drone_amount; i++) {
			const drone = new Drone();
			this.drones.push(drone);
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

		this.draw();
	}

	draw() {
		UI.clear_canvas(UI.main_ctx);
		this.drones.forEach((drone) => {
			drone.draw();
			// globals.ctx.fillStyle = "red";
			// globals.ctx.fillRect(drone.targets[drone.current_target].x, drone.targets[drone.current_target].y, 10, 10);
		});
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
		const elites = Math.floor(this.drone_amount * this.elite_count);

		// best drones gets taken over the next generation
		for (let i = 0; i < elites; i++) {
			const best_drone = this.drones[i];
			if (best_drone) {
				const new_drone = new Drone(best_drone.brain.copy());
				new_drones.push(new_drone);
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
		// UI.draw_chart(this.generations);

		// dispose all old drones
		this.drones.forEach((drone) => {
			drone.dispose();
		});

		// set new drones
		this.drones = new_drones;
		this.generation_count++;
		// UI.update_generation(this.generation_count);
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
