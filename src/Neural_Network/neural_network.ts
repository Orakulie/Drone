import * as tf from "@tensorflow/tfjs";
import { Sequential, TensorContainer } from "@tensorflow/tfjs";
import { Vector } from "matter-js";
import globals from "../globals";
import { randomGaussian } from "../util";

export interface Drone_Inputs {
	velocity: Vector;
	angular_velocity: number;
	angle: number;
	target_vector: Vector;
}
//TODO NORMALIZE VECTOR
type Drone_Outputs = [left_thrust: number, right_thrust: number, left_angle: number, right_angle: number];

export class Neural_Network {
	model!: Sequential;
	constructor(model: Sequential | null = null) {
		if (model) {
			this.model = model;
		} else {
			this.model = Neural_Network.create_network();
		}

		tf.setBackend("cpu");
	}

	// Creates a new TF-Model
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

	copy() {
		return tf.tidy(() => {
			const model_copy = Neural_Network.create_network();
			const weights_copy = this.copy_weights();
			model_copy.setWeights(weights_copy);
			tf.dispose(weights_copy);
			// FIXME MAYBE DISPOSE COPIED WEIGHTS
			// Weird return types due to typescript?
			return new Neural_Network(model_copy) as unknown as TensorContainer;
		}) as unknown as Neural_Network;
	}

	private copy_weights() {
		const weights = this.model.getWeights();
		const weights_copy = [];
		for (let i = 0; i < weights.length; i++) {
			weights_copy[i] = weights[i].clone();
		}
		return weights_copy;
	}

	crossover(model: Sequential) {
		return tf.tidy(() => {
			const weights_a = this.model.getWeights();
			const weights_b = model.getWeights();
			// const weightsToAdd = [];
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
			// 	weightsToAdd[i] = newTens;
			// }
			const weights = Math.random() < 0.5 ? weights_a : weights_b;
			const new_model = Neural_Network.create_network();
			new_model.setWeights(weights);
			return new Neural_Network(new_model) as unknown as any;
		}) as Neural_Network;
	}
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
						// Mutation chance 10%
						let w = values[j];
						// if (Math.random() < 0.5) {
						values[j] = w + randomGaussian() * 0.5;
						// } else {
						// 	values[j] = w + randomGaussian();
						// }
					}
				}
				let new_tens = tf.tensor(values, shape);
				mutated_weigths[i] = new_tens;
			}
			this.model.setWeights(mutated_weigths);
		});
	}

	predict(inputs: Drone_Inputs) {
		return tf.tidy(() => {
			const input_tensor = tf.tensor2d([
				[
					inputs.velocity.x / 100,
					inputs.velocity.y / 100,
					inputs.angular_velocity / 2,
					inputs.target_vector.x / globals.canvas.width,
					inputs.target_vector.y / globals.canvas.height,
					Math.sin(inputs.angle),
				],
			]);

			const pending_outputs = this.model.predict(input_tensor);
			try {
				const outputs = (pending_outputs as tf.Tensor<tf.Rank>).dataSync();
				return outputs as unknown as Drone_Outputs;
			} catch (error) {
				// ??????
				throw error;
			}
		});
	}
	dispose() {
		this.model.dispose();
	}
}
