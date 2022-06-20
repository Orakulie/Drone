import { Writer } from "./ASCII/writer";
import { Mat } from "./Matter/matter";
const canvas = document.getElementById("main-canvas")! as HTMLCanvasElement;

canvas.setAttribute("height", "" + canvas.parentElement!.clientHeight);
canvas.setAttribute("width", "" + canvas.parentElement!.clientWidth);


let writer: Writer;

function setup() {
    // setting canvas
    Mat.set_canvas(canvas);
    // setting starting word to 'Drone'
    writer = new Writer(canvas, "Drones");
    // start update loop
    window.requestAnimationFrame(update);
}

async function update() {
    if (!writer.drone_brain) { window.requestAnimationFrame(update); return; }
    // clear canvas to make it ready for a redraw
    Mat.ctx.clearRect(0, 0, Mat.canvas.width, Mat.canvas.height);

    // update drones & physics
    await writer.update();
    Mat.update();

    // draw drones
    writer.draw();
    window.requestAnimationFrame(update);
}

setup();
