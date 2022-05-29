import { Chart, ChartData } from "chart.js";
import { Body, Vector } from "matter-js";
import { Evolution, Generation } from "./Genetic_Algorithm/evolution";
import globals from "./globals";
import { Drone } from "./Objects/drone";
import { calculate_distance } from "./util";

export abstract class UI {
	private static generation_span = document.getElementById("generation_span")!;
	private static time_label = document.getElementById("time_label")!;
	private static time_slider = document.getElementById("time_slider")! as HTMLInputElement;

	// INFO CANVAS
	private static info_canvas = document.getElementById("info_canvas")! as HTMLCanvasElement;
	static info_ctx = this.info_canvas.getContext("2d")!;
	private static selected_drone: Drone | null;

	// CHART CANVAS
	private static chart_canvas = document.getElementById("chart_canvas")! as HTMLCanvasElement;
	static chart_ctx = this.chart_canvas.getContext("2d")!;
	private static chart: Chart;

	static update_generation(gen: number) {
		this.generation_span.textContent = `Generation: ${gen}`;
	}
	static time_change(callback: Function) {
		this.time_slider.onchange = () => {
			callback(this.time_slider.value);
			this.time_label.textContent = this.time_slider.value;
		};
	}

	static fix_dpi() {
		[this.info_canvas, this.chart_canvas].forEach((canvas) => {
			const height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
			const width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
			canvas.setAttribute("height", "" + height * window.devicePixelRatio);
			canvas.setAttribute("width", "" + width * window.devicePixelRatio);
		});
	}

	static draw_info() {
		// RESET CANVAS
		this.info_ctx.fillStyle = "#161616";
		this.info_ctx.fillRect(0, 0, this.info_canvas.width, this.info_canvas.height);

		this.info_ctx.fillStyle = "white";
		this.info_ctx.font = "15px mono";
		this.info_ctx.textAlign = "center";
		const line_height = 17;

		if (!this.selected_drone) {
			this.info_ctx.fillText("Select a drone.", this.info_canvas.width / 2, this.info_canvas.height / 2);
		} else if (this.selected_drone.thrusters[0]) {
			this.info_ctx.fillText(`Drone ${this.selected_drone.body.id}`, this.info_canvas.width / 2, line_height * 1);
			const output = [
				`Score: ${this.selected_drone.score.toFixed(3)}`,
				`Alive: ${!this.selected_drone.is_destroyed}`,
				`Distance: ${this.selected_drone.get_distance_to_taget()}`,
				`Target_Vector: ${this.selected_drone.target_vector.x.toFixed(
					1
				)}, ${this.selected_drone.target_vector.y.toFixed(1)}`,
				`Velocity: ${this.selected_drone.body.velocity.x.toFixed(
					1
				)}, ${this.selected_drone.body.velocity.y.toFixed(1)}`,
				`Angular_Velocity: ${this.selected_drone.body.angularVelocity.toFixed(1)}`,
				`sin(Angle): ${Math.sin(this.selected_drone.body.angle).toFixed(1)}`,
				`sin(Angle_L): ${Math.sin(this.selected_drone.thrusters[0].body.angle).toFixed(1)}`,
				`sin(Angle_R): ${Math.sin(this.selected_drone.thrusters[1].body.angle).toFixed(1)}`,
			];
			this.info_ctx.textAlign = "left";
			for (let i = 0; i < output.length; i++) {
				const str = output[i];
				this.info_ctx.fillText(str, 5, line_height * (i + 2));
			}
		} else {
			this.selected_drone = null;
		}
	}

	static select_drone(evt: MouseEvent, evolution: Evolution) {
		// this.selected_drone = evolution.get_drone_to_body(evt.body);
		let closest_distance = Infinity;
		let closest_drone: Drone | null = null;
		evolution.drones.forEach((drone) => {
			const distance = calculate_distance(drone.body.position, globals.mouse.position);
			if (distance < closest_distance) {
				closest_distance = distance;
				closest_drone = drone;
			}
		});
		this.selected_drone = closest_drone;
	}

	static draw_chart(generations: Generation[]) {
		if (!this.chart) {
			this.init_chart(generations);
			return;
		}

		const last_generation = generations[generations.length - 1];
		this.chart.data.labels?.push(last_generation.id);
		this.chart.data.datasets[0].data.push(last_generation.fitness);
		this.chart.data.datasets[1].data.push(last_generation.best_drone.score);
		this.chart.update();
	}

	static init_chart(generations: Generation[]) {
		const labels = generations.map((g) => g.id);
		const data: ChartData = {
			labels: labels,
			datasets: [
				{
					label: "Average",
					data: generations.map((g) => g.fitness),
					borderColor: "#999",
				},
				{
					label: "Best",
					data: generations.map((g) => g.best_drone.score),
					borderColor: "crimson",
				},
			],
		};
		this.chart = new Chart(this.chart_ctx, {
			type: "line",
			data: data,
			options: { responsive: true, maintainAspectRatio: false },
		});
	}
}
