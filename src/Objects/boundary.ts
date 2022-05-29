import { Box } from "./box";

export class Boundary extends Box {
	constructor(x: number, y: number, w: number, h: number) {
		super(x, y, w, h);
        this.body.isStatic = true;
	}
}
