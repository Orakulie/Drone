import * as tf from "@tensorflow/tfjs";
import { Sequential, TensorContainer } from "@tensorflow/tfjs";
import { Vector } from "matter-js";
import { Mat } from "../Matter/matter";
import { randomGaussian } from "../util";

export interface Drone_Inputs {
	velocity: Vector;
	angular_velocity: number;
	angle: number;
	target_vector: Vector;
}
type Drone_Outputs = [left_thrust: number, right_thrust: number, left_angle: number, right_angle: number];

export class Neural_Network {
	model!: Sequential;
	constructor(model: Sequential | null = null) {
		// if called with an already exisiting model (for copying) -> take it over
		if (model) {
			this.model = model;
		} else {
			// otherwise generate a new neural network
			this.model = Neural_Network.create_network();
		}

		// gpu seems slower
		tf.setBackend("cpu");
	}

	/**
	 *	Creates a new tensorflow model
	 * @returns a new neural network model
	 */
	static create_network() {
		const model = tf.sequential();

		// Creates a hidden layer
		//Missing: Determine optimal count of nodes and layer
		const hidden_layer_1 = tf.layers.dense({
			units: 10,
			inputShape: [6],
			activation: "tanh",
		});

		model.add(hidden_layer_1);

		const hidden_layer_2 = tf.layers.dense({
			units: 10,
			activation: "tanh",
		});

		model.add(hidden_layer_2);

		// Output layer
		// Angle 1 & 2 + Power 1 & 2
		const output_layer = tf.layers.dense({
			units: 4,
			activation: "tanh",
		});

		model.add(output_layer);
		return model;
	}

	/**
	 * @returns a copy of the current neural network
	 */
	copy() {
		return tf.tidy(() => {
			const model_copy = Neural_Network.create_network();
			const weights_copy = this.copy_weights();
			model_copy.setWeights(weights_copy);
			tf.dispose(weights_copy);
			return new Neural_Network(model_copy) as unknown as TensorContainer;
		}) as unknown as Neural_Network;
	}

	/**
	 * @returns a copy of the current model weights
	 */
	private copy_weights() {
		const weights = this.model.getWeights();
		const weights_copy = [];
		for (let i = 0; i < weights.length; i++) {
			weights_copy[i] = weights[i].clone();
		}
		return weights_copy;
	}
	/**
	 *	Creates a new model based on the characteristics from parentA(this) and parentB(parameter).
	 * 	Might cause issues. Needs more research.
	 * @param model parentB
	 * @returns a new child neural_network
	 */
	crossover(model: Sequential) {
		return tf.tidy(() => {
			const weights_a = this.model.getWeights();
			const weights_b = model.getWeights();
			// const weights = [];
			// for (let i = 0; i < weights_a.length; i++) {
			// 	let tens = weights_a[i];
			// 	let tens2 = weights_b[i];
			// 	let shape = weights_a[i].shape;
			// 	let values = tens.dataSync().slice();
			// 	let values2 = tens2.dataSync().slice();
			// 	if (Math.random() < 0.5) {
			// 		values = values2;
			// 	}
			// 	let newTens = tf.tensor(values, shape);
			// 	weights[i] = newTens;
			// }
			const weights = Math.random() < 0.5 ? weights_a : weights_b;
			const new_model = Neural_Network.create_network();
			new_model.setWeights(weights);
			return new Neural_Network(new_model) as unknown as any;
		}) as Neural_Network;
	}

	/**
	 * Randomly mutates model weights.
	 * Needs more testing to find optimal probability
	 */
	mutate() {
		tf.tidy(() => {
			const weights = this.model.getWeights();
			const mutated_weigths = [];
			for (let i = 0; i < weights.length; i++) {
				let tens = weights[i];
				let shape = weights[i].shape;
				let values = tens.dataSync().slice();
				for (let j = 0; j < values.length; j++) {
					if (Math.random() < 0.2) {
						// Mutation chance 20%
						let w = values[j];
						// not fully new values, instead adjust current value by a random value
						values[j] = w + randomGaussian() * 0.25;
					}
				}
				let new_tens = tf.tensor(values, shape);
				mutated_weigths[i] = new_tens;
			}
			this.model.setWeights(mutated_weigths);
		});
	}

	/**
	 * Predicts next thruster introductions based on the current drone statistics.
	 * @param inputs drone inputs
	 * @returns drone thruster introductions
	 */
	async predict(inputs: Drone_Inputs) {
		// return tf.tidy(() => {
		// normalizes the drone inputs
		const input_tensor = tf.tensor2d([
			[
				inputs.velocity.x / 100,
				inputs.velocity.y / 100,
				inputs.angular_velocity / 2,
				inputs.target_vector.x / Mat.canvas.width,
				inputs.target_vector.y / Mat.canvas.height,
				Math.sin(inputs.angle),
			],
		]);

		const pending_outputs = this.model.predict(input_tensor);
		try {
			// const outputs = (pending_outputs as tf.Tensor<tf.Rank>).dataSync();
			const outputs = await (pending_outputs as tf.Tensor<tf.Rank>).data();
			tf.dispose(pending_outputs);
			tf.dispose(input_tensor);
			return outputs as unknown as Drone_Outputs;
		} catch (error) {
			throw error;
		}
		// });
	}

	/**
	 * disposes current tf-model
	 */
	dispose() {
		this.model.dispose();
	}
}
