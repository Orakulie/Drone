import { Engine, Body, Mouse } from "matter-js";

let canvas!: HTMLCanvasElement;
let ctx!: CanvasRenderingContext2D;
let engine!: Engine;
let bodies!: Body[]; 
let mouse!: Mouse;
let frame_count!: number;

export default{
	canvas,
	ctx,
	engine,
	bodies,
	mouse,
	frame_count,
}
