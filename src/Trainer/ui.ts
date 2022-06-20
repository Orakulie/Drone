import { Chart, ChartData } from "chart.js";
import { Generation } from "./evolution";

export enum Visual_State {
	show_all,
	show_best,
}
class UI_Manager {
	// --- canvas ---
	main_canvas = document.getElementById("main-canvas")! as HTMLCanvasElement;
	chart_canvas = document.getElementById("chart-canvas")! as HTMLCanvasElement;

	main_ctx = this.main_canvas.getContext("2d")!;
	chart_ctx = this.chart_canvas.getContext("2d")!;

	// --- options ---
	private speed_slider = document.getElementById("time-slider")! as HTMLInputElement;
	private speed_slider_label = document.getElementById("time-label")! as HTMLLabelElement;
	private speed_slider_callback!: Function;

	private drone_count_slider = document.getElementById("count-slider")! as HTMLInputElement;
	private drone_count_label = document.getElementById("count-label")! as HTMLLabelElement;
	private drone_count_callback!: Function;

	private speed_reward_slider = document.getElementById("reward-slider")! as HTMLInputElement;
	private speed_reward_label = document.getElementById("reward-label")! as HTMLLabelElement;
	private speed_reward_callback!: Function;

	// -- info ---
	private generation_span = document.getElementById("generation-span")! as HTMLSpanElement;
	private best_score_span = document.getElementById("best-score-span")! as HTMLSpanElement;
	private chart!: Chart;

	// -- controls --
	private visual_state_button = document.getElementById("state-button")! as HTMLButtonElement;
	visual_state: Visual_State = Visual_State.show_all;

	private stop_button = document.getElementById("stop-button")! as HTMLButtonElement;
	time_stop: Boolean = true;

	private mouse_button = document.getElementById("mouse-button")! as HTMLButtonElement;
	mouse_state: Boolean = false;

	private toggle_menu_button = document.getElementById("toggle-menu-button")! as HTMLButtonElement;
	private menu_div = document.getElementById("menu")! as HTMLDivElement;
	menu_state: Boolean = true;

	// -- save & load --
	private save_button = document.getElementById("save-button")! as HTMLButtonElement;
	save_button_callback!: Function;
	load_input = document.getElementById("load-input")! as HTMLInputElement;
	load_input_callback!: Function;

	constructor() {
		// window.onresize = this.resize_fix.bind(this);
		this.fix_resolution();

		// changing speed will change variable
		this.speed_callback = () => {};

		// visual state = show_all | show_best
		this.visual_state_button.onclick = this.toggle_visual_state.bind(this);

		// toggles stop | play
		this.stop_button.onclick = this.toggle_time.bind(this);
		this.mouse_button.onclick = this.toggle_mouse_state.bind(this);
		this.toggle_menu_button.onclick = this.toggle_menu.bind(this);
	}

	/**
	 * Sets the canvas width & height based on the parent wrapper
	 */
	fix_resolution() {
		[this.main_canvas, this.chart_canvas].forEach((canvas) => {
			canvas.setAttribute("height", "" + canvas.parentElement!.clientHeight);
			canvas.setAttribute("width", "" + canvas.parentElement!.clientWidth);
		});
	}
	resize_fix() {
		[this.main_canvas, this.chart_canvas].forEach((canvas) => {
			canvas.setAttribute("height", "0");
			canvas.setAttribute("width", "0");
			setTimeout(() => {
				this.fix_resolution();
			}, 50);
		});
	}

	set generation(id: number) {
		this.generation_span.textContent = id.toString();
	}

	set best_score(score: number) {
		this.best_score_span.textContent = score.toFixed(2);
	}

	set speed_callback(callback: Function) {
		this.speed_slider.onchange = () => {
			this.speed_slider_label.textContent = this.speed_slider.value.toString();
			callback();
		};
	}

	get speed() {
		return +this.speed_slider.value;
	}

	set drone_callback(callback: Function) {
		this.drone_count_slider.onchange = () => {
			this.drone_count_label.textContent = this.drone_count_slider.value.toString();
			callback();
		};
	}

	get drone_count() {
		return +this.drone_count_slider.value;
	}

	set reward_callback(callback: Function) {
		this.speed_reward_slider.onchange = () => {
			this.speed_reward_label.textContent = this.speed_reward_slider.value.toString();
			callback();
		};
	}

	get speed_reward() {
		return +this.speed_reward_slider.value;
	}

	set save_callback(callback: Function) {
		this.save_button.onclick = () => {
			callback();
		};
	}

	set load_callback(callback: Function) {
		this.load_input.onchange = () => {
			callback();
		};
	}

	/**
	 * Toggles between all the visual states and changes the button text
	 */
	toggle_visual_state() {
		this.visual_state++;
		if (this.visual_state == Object.values(Visual_State).length / 2) this.visual_state = 0;

		switch (this.visual_state) {
			case Visual_State.show_best:
				this.visual_state_button.textContent = "Show all";
				break;
			case Visual_State.show_all:
				this.visual_state_button.textContent = "Show best";
		}
	}

	/**
	 * Toggles between play and stop and changes the button text
	 */
	toggle_time() {
		this.time_stop = !this.time_stop;

		this.stop_button.textContent = this.time_stop ? "Play" : "Stop";
	}

	toggle_menu() {
		this.menu_state = !this.menu_state;
		if (!this.menu_state) {
			this.menu_div.style.display = "None";
			this.toggle_menu_button.style.transform = "rotate(180deg)";
		} else {
			this.menu_div.style.display = "Block";
			this.toggle_menu_button.style.transform = "rotate(0)";
		}
	}

	toggle_mouse_state() {
		this.mouse_state = !this.mouse_state;
		this.mouse_button.textContent = this.mouse_state ? "Train" : "Mouse";
	}

	/**
	 * Clears the canvas
	 * @param ctx canvas rendering context 2d
	 */
	clear_canvas(ctx: CanvasRenderingContext2D) {
		this.main_ctx.fillStyle = "#161616";
		this.main_ctx.fillRect(0, 0, this.main_canvas.width, this.main_canvas.height);
	}

	update_chart(generations: Generation[]) {
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

	reset_chart() {
		if (this.chart) this.chart.reset();
	}

	init_chart(generations: Generation[]) {
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

export const UI = new UI_Manager();
