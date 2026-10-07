class Cat {
    #name;
    #color;

    constructor(name = "Unnamed", color = "gray") {
        this.#name = name;
        this.#color = color;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        this.#name = value;
    }

    get color() {
        return this.#color;
    }

    set color(value) {
        this.#color = value;
    }

    sayMeow() {
        console.log(`Cat ${this.#name} said Meowwwww!!`);
    }
}

module.exports = Cat;