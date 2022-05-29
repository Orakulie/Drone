import Matter from "matter-js";
import { Drone } from "./drone";
// var Engine = Matter.Engine,
// 	Bodies = Matter.Bodies,
// 	Composite = Matter.Composite;
const dpi = window.devicePixelRatio;
let player;
let engine;
function setup() {
    globals.canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    fix_dpi();
    engine = Matter.Engine.create();
    player = new Drone();
    window.requestAnimationFrame(update);
}
function update() {
    // player.update();
    draw();
    Matter.Engine.update(engine, 1000 / 60);
    window.requestAnimationFrame(update);
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
}
function fix_dpi() {
    const height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    const width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    canvas.setAttribute("height", "" + height * dpi);
    canvas.setAttribute("width", "" + width * dpi);
}
setup();
