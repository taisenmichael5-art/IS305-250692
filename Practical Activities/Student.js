class Student {
    #id;
    #firstName;
    #lastName;

    constructor(id = null, firstName = "", lastName = "") {
        this.#id = id;
        this.#firstName = firstName;
        this.#lastName = lastName;
    }

    toString() {
        return `${this.#id ?? ""} ${this.#firstName} ${this.#lastName}`.trim();
    }
}

module.exports = Student;