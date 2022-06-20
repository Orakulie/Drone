import { Body, Vector } from "matter-js";

export function lerp(a: number, b: number, percentage: number) {
    return (1 - percentage) * a + percentage * b;
}

export function randomGaussian() {
    var u = 0;
    var v = 0;
    while (u == 0) {
        u = Math.random();
    }
    while (v == 0) {
        v = Math.random();
    }

    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function calculate_distance(v1: Vector, v2: Vector) {
    const distance = Math.sqrt(Math.pow(v2.y - v1.y, 2) + Math.pow(v2.x - v1.x, 2));
    return Math.abs(distance);
}

export function draw_body(ctx: CanvasRenderingContext2D, body: Body) {
    ctx.beginPath();
    var vertices = body.vertices;

    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (var j = 1; j < vertices.length; j += 1) {
        ctx.lineTo(vertices[j].x, vertices[j].y);
    }

    ctx.lineTo(vertices[0].x, vertices[0].y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#999";
    ctx.stroke();
}

export function sleep(milliseconds: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}


/**
 * return a random value between the two given numbers
 * */
export function random(min: number, max: number) {

    return Math.floor(Math.random() * (max - min + 1) + min);
}
