import { Vector } from "matter-js";
import * as tf from "@tensorflow/tfjs";
import { convert_ascii } from "./converter";
import { Neural_Network } from "../Drone/neural_network";
import { Drone } from "../Drone/drone";
import { calculate_distance } from "../util";

export class Writer {
    // current displayed word
    _word!: String;
    // canvas used for the drones
    canvas!: HTMLCanvasElement;
    ctx!: CanvasRenderingContext2D;

    // space taken by each individual pixel
    pixel_size: number = 30;

    // all currently used drones
    drones: Drone[] = [];

    // all destroyed drones that are not yet disposed
    destroyed_drones: Drone[] = []

    // drone that follows the pointer
    mouse_drone!: Drone;

    // input field used for changing the text
    input_field = document.getElementById("input-field") as HTMLInputElement;

    // timer that is used to wait for a certain time before updating the current word
    input_timer!: NodeJS.Timeout;

    // drone brain that is used to create each drone. Pretrained & Loaded
    drone_brain!: Neural_Network;

    // two html divs that appear when user scroll into them
    element_1 = document.getElementById("element-1") as HTMLElement;
    element_2 = document.getElementById("element-2") as HTMLElement;;

    // hover progress. 100 means -> redirect
    _hover_progress: number = 0;

    // hover area
    hover_field = document.getElementById("hover-progress") as HTMLElement;

    // position of the hover field on the canvas
    hover_position!: Vector


    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;

        // setting the hover_field position on the canvas matching the html element
        this.hover_position = Vector.create(canvas.width / 2, canvas.height / 2 + 132);

        // on input change -> set_word
        this.input_field.onchange = this.input_change.bind(this);
        this.input_field.onkeyup = this.input_change.bind(this);
        this.input_field.onpaste = this.input_change.bind(this);

        // load pretrained drone and set the starting word afterwards
        this.load_drone_brain().then((brain) => {
            this.drone_brain = brain;
            // bind document scroll event for dynamic words
            document.onscroll = this.scroll.bind(this);
            // "scroll" once to set the starting position
            this.scroll();
            // start the drone that follow the mouse
            this.init_mouse_drone();
        });
    }

    /**
     * @returns pretrained drone neural network
     */
    async load_drone_brain() {
        const model = (await tf.loadLayersModel("/res/trained_drone/drone.json")) as tf.Sequential;
        const brain = new Neural_Network(model);
        return brain;
    }

    /**
     * Checks whether the user reached the top or the bottom and displays the matching text
     * */
    scroll() {
        if (this.scroll_percentage >= 0.9) { // bottom of the page
            this.set_word("try it");
            this.element_1.style.display = "none";
            this.element_2.style.display = "flex";
        } else if (this.scroll_percentage <= 0.1) { // top of the page
            this.set_word("Drones");
            this.element_2.style.display = "none";
            this.element_1.style.display = "flex";
        }
        else {
            this.set_word("Ö") // display arrow
            this.element_2.style.display = "none";
            this.element_1.style.display = "none";
        }
    }

    /**
     *  Returns the current scrol_top in percent
     * */
    get scroll_percentage() {
        if (!document.scrollingElement) return 1;
        return document.scrollingElement.scrollTop / document.scrollingElement.clientHeight;
    }

    /**
     * Updates every drone
     */
    async update() {
        // update the drone that follows the drone
        await this.mouse_drone.update();

        // calculate the distance between mouse_drone and the hover_field
        const distance = (calculate_distance(this.mouse_drone.body.position, this.hover_position));

        // if drone is inside the hover_field -> increase hover_progress
        if (distance <= 20) {

            if (this.hover_progress < 100) {
                this.hover_progress++
            } else { // if hover_progress reached 100 -> redirect to trainer.html
                this.hover_progress = 0;
                window.location.href = "/trainer.html"
            }
        } else { // reset hover_progress if the drone leaves the hover_field
            this.hover_progress = 0;
        }

        // if mouse_drone is destroyed -> respawn it
        if (this.mouse_drone.is_destroyed) {
            this.mouse_drone.destroy();
            this.destroyed_drones.push(this.mouse_drone);
            this.init_mouse_drone();
        }
        // filter out all disposed drones
        this.destroyed_drones = this.destroyed_drones.filter(d => !d.is_disposed);

        // list of all drones that hit a boundary in this update
        const to_be_removed: number[] = [];

        // update all drones
        for (let i = 0; i < this.drones.length; i++) {
            const drone = this.drones[i];
            await drone.update();
            if (drone.is_destroyed) {
                to_be_removed.push(drone.brain.model.id);
            }
        }

        // destroy & remove destroyed drones from the array
        this.drones = this.drones.filter((drone) => {
            if (to_be_removed.includes(drone.brain.model.id)) {
                drone.destroy();
                this.destroyed_drones.push(drone);
                return false;
            }
            return true;
        });
    }


    /**
     * Draws every drone
     */
    draw() {
        [this.mouse_drone, ...this.drones, ...this.destroyed_drones].forEach((drone) => {
            drone.draw();
        })
    }

    /**
     *  Creates a drone that follows the mouse
     * */
    init_mouse_drone() {
        this.mouse_drone = new Drone(this.drone_brain.copy());
        this.mouse_drone.set_mouse_mode(true);
    }

    /**
     * Wait for a certain delay before updating the current word.
     * If there is another call while already waiting -> reset timer.
     */
    input_change() {
        clearTimeout(this.input_timer);
        this.input_timer = setTimeout(() => {
            if (this.input_field.value) this.set_word(this.input_field.value);
        }, 500);
    }


    get word() {
        return this._word;
    }

    /**
     * Sets the new word and spawns/destroys drones accordingly
     * @param new_word new word to be set
     */
    async set_word(new_word: String) {
        if (this.word == new_word) return;
        this._word = new_word;

        // all pixels that need to be "drawn"
        const positions: Vector[] = [];

        // x- & y-translation to center the word on the canvas
        const x_translation = ((this.canvas.width - 6 * new_word.length * this.pixel_size) + this.pixel_size) / 2;
        const y_translation = this.canvas.height / 2 - 4 * this.pixel_size;

        // calculate every pixel position on the canvas and save it to the positions array
        for (let i = 0; i < new_word.length; i++) {
            const letter = convert_ascii(new_word[i]);
            for (let x = 0; x < 6; x++) {
                for (let y = 0; y < 8; y++) {
                    if (letter[x][y]) {
                        const pos = Vector.create(
                            x * this.pixel_size + i * (6 * this.pixel_size) + x_translation,
                            y * this.pixel_size - this.pixel_size / 2 + y_translation
                        );
                        positions.push(pos);
                    }
                }
            }
        }


        const new_drones: Drone[] = [];

        // give each drone the new target (pixel)
        for (let i = 0; i < positions.length; i++) {
            // filter drones that dont have a new target
            const drones = this.drones.filter(d => !new_drones.includes(d));

            // does the new word require new drones?
            const can_spawn = this.drones.length < positions.length;

            // get closest drone, if nothing is found -> create new drone
            let drone = this.get_closest_drone(drones, positions[i], can_spawn);
            if (!drone) {
                drone = new Drone(this.drone_brain.copy())
            }

            // add new drone and set the new target
            new_drones.push(drone);
            drone.set_target(positions[i]);
        }

        // destroy all unused drones
        for (let i = 0; i < this.drones.length; i++) {
            if (!new_drones.includes(this.drones[i])) {
                this.drones[i].destroy();
                this.destroyed_drones.push(this.drones[i]);
            }
        }
        this.drones = new_drones;
    }

    /**
     * Returns the nearest drone to a given point. Return null if there are no drones present.
     * */
    get_closest_drone(drones: Drone[], position: Vector, can_spawn: Boolean) {
        if (drones.length == 0) return null;

        let closest_drone: Drone | null = null;
        let shortest_distance = Infinity;

        for (let i = 0; i < drones.length; i++) {
            const drone = drones[i];

            const distance = calculate_distance(drone.body.position, position);
            const spawn_distance = calculate_distance(Drone.spawn_point, position);

            // checks if the drone has a shorter way to the target than a new drone from the spawn
            if (distance < shortest_distance && !can_spawn || (distance < spawn_distance && distance < shortest_distance && can_spawn)) {
                closest_drone = drone;
                shortest_distance = distance;
            }
        }

        return closest_drone;
    }

    set hover_progress(new_value: number) {
        this._hover_progress = new_value;
        this.hover_field.style.height = `${new_value}%`
    }

    get hover_progress() {
        return this._hover_progress;
    }
}
