import { convert_ascii } from "./ASCII/converter";

const canvas = document.getElementById("main-canvas")! as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

canvas.setAttribute("height", "" + canvas.parentElement!.clientHeight);
canvas.setAttribute("width", "" + canvas.parentElement!.clientWidth);

console.log(convert_ascii("A"));

const size = 30;
const word = "Drone";
ctx.translate((canvas.width - (5*word.length * size))/2, canvas.height / 2 - 4 * size);
for (let i = 0; i < word.length; i++) {
	const letter = convert_ascii(word[i]);

	for (let x = 0; x < 6; x++) {
		for (let y = 0; y < 8; y++) {
			if (letter[x][y]) {
				ctx.fillRect(x * size + i * 160, y * size, size, size);
			}
		}
	}
}
