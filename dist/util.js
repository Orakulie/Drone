export class Vector {
    x = 0;
    y = 0;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(vector) {
        const new_vector = new Vector(this.x, this.y);
        new_vector.x += vector.x;
        new_vector.y += vector.y;
        return new_vector;
    }
    times(x) {
        const new_vector = new Vector(this.x, this.y);
        new_vector.x *= x;
        new_vector.y *= x;
        return new_vector;
    }
}
