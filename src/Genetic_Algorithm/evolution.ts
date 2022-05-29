import { Body, Vector } from "matter-js";
import globals from "../globals";
import { Drone } from "../Objects/drone";
import { UI } from "../ui";

export class Generation {
	fitness!: number;
	best_drone!: Drone;
	id!: number;
	constructor(id: number, fitness: number, best_drone: Drone) {
		this.id = id;
		this.fitness = fitness;
		this.best_drone = best_drone;
	}
}

export class Evolution {
	drone_amount!: number;
	drones!: Drone[];
	generation_duration!: number;
	generation_count!: number;
	elite_count!: number;
	current_highscore!: number;

	generations!: Generation[];

	constructor(drone_amount: number) {
		this.drone_amount = drone_amount;
		this.drones = [];
		this.generations = [];
		this.generation_duration = 1000;
		this.generation_count = 1;
		this.elite_count = 10;
		this.current_highscore = 0;
		for (let i = 0; i < drone_amount; i++) {
			const drone = new Drone();
			this.drones.push(drone);
		}
	}

	update() {
		// const new_target_drone = this.drones.find((drone) => drone.current_target > this.current_highscore);
		// if (new_target_drone) {
		// 	this.timer = 0;
		// 	this.current_highscore = new_target_drone.current_target;
		// }
		if (this.drones.every((drone) => drone.is_destroyed)) {
			this.init_next_generation();
			return;
		}
		this.drones.forEach((drone) => {
			drone.update();
		});
	}

	draw() {
		this.drones.forEach((drone) => {
			drone.draw();
			globals.ctx.fillStyle = "red";
			globals.ctx.fillRect(drone.targets[drone.current_target].x, drone.targets[drone.current_target].y, 10, 10);
		});
	}

	init_next_generation() {
		// normalize scores and sort based on it
		const generation_fitness = this.evaluate_generation();

		// breed based on fitness
		const new_drones: Drone[] = [];
		for (let i = this.elite_count; i < this.drone_amount; i++) {
			const new_drone = this.breed(this.choose_drone(), this.choose_drone());
			new_drones.push(new_drone);
		}

		// best drone gets taken over the next generation
		for (let i = 0; i < this.elite_count; i++) {
			const best_drone = this.drones[i];
			const new_drone = new Drone(best_drone.brain.copy());
			new_drones.push(new_drone);
		}

		// save current generation stats
		this.generations.push(new Generation(this.generation_count, generation_fitness, this.drones[0].copy()));
		UI.draw_chart(this.generations);

		// dispose all old drones
		this.drones.forEach((drone) => {
			drone.dispose();
		});

		// set new drones
		this.drones = new_drones;
		// this.timer = 0;
		this.generation_count++;
		UI.update_generation(this.generation_count);
	}

	evaluate_generation() {
		// console.log(Evolution.max_distance);
		// this.drones.forEach((drone) => {
		// 	if (!drone.is_destroyed) {
		// 		drone.score += Math.round(drone.get_distance_to_taget()! * 0.1);
		// 	}
		// });

		this.drones.forEach((drone) => {
			// if (!drone.is_destroyed) {
			// 	distance_score *= 2;
			// }
			// let distance_score = 1/drone.get_distance_to_taget()!;
			// drone.score = Math.pow(distance_score, 2);
			//drone.score *= drone.score; // pow2 score to emphasize higher survival scores
			//drone.score += Math.pow(drone.target_arrived_total,2) * 10; // add score for target visits
			// if (drone.target_arrived > 120) {
			// 	console.log("win");
			// 	// if enough time was passed on target -> next target
			// 	if (this.current_target == this.targets.length) this.current_target = 0;
			// }
		});

		// normalize the drones score
		const fitness_sum = this.drones.reduce((sum, drone) => sum + drone.score, 0);
		this.drones.forEach((drone) => (drone.fitness = drone.score / fitness_sum));
		this.drones.sort((drone_a, drone_b) => {
			return drone_b.fitness - drone_a.fitness;
		});
		console.log(`Generation ${this.generation_count}: ${fitness_sum}\nBest Score: ${this.drones[0].score}`);
		// console.log(
		// 	this.drones.map((d) => d.score),
		// 	this.drones.map((drone) => drone.fitness)
		// );
		return fitness_sum / this.drones.length;
	}

	breed(drone_a: Drone, drone_b: Drone) {
		const new_brain = drone_a.brain.crossover(drone_b.brain.model);
		//const new_brain = drone_a.brain.copy();
		new_brain.mutate();
		return new Drone(new_brain);
	}

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

	get_random_vector() {
		const x = Math.floor(Math.random() * (globals.canvas.width - 200) + 100);
		const y = Math.floor(Math.random() * (globals.canvas.height - 400) + 100);
		return Vector.create(150, 200);
	}

	static get max_distance() {
		return Math.sqrt(Math.pow(globals.canvas.width, 2) + Math.pow(globals.canvas.height, 2));
	}

	get_drone_to_body(body: Body) {
		return this.drones.find((drone) => drone.body.id == body.id);
	}
}
