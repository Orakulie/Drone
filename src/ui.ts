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

	constructor() {
		window.onresize = this.resize_fix.bind(this);
		this.fix_resolution();

		this.speed_callback = () => {};
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
		this.best_score_span.textContent = score.toString();
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

	clear_canvas(ctx: CanvasRenderingContext2D) {
		this.main_ctx.fillStyle = "#161616";
		this.main_ctx.fillRect(0, 0, this.main_canvas.width, this.main_canvas.height);
	}
}

export const UI = new UI_Manager();
