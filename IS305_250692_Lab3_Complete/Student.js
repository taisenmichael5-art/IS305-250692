/*
  Program: Lab 2 Part 2 - Student and Meal Booking Integration
  Student Name: Taisen Marainump
  Student ID: 250692
  Description: Student class used by MealBooking objects.
*/

const DiningAccount = require("./DiningAccount");

class Student {
    #studentId;
    #firstName;
    #lastName;
    #diningAccount = null;

    constructor(studentId, firstName, lastName) {
        this.studentId = studentId;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    get studentId() {
        return this.#studentId;
    }

    set studentId(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Student ID cannot be empty.");
        }
        this.#studentId = String(value).trim();
    }

    get firstName() {
        return this.#firstName;
    }

    set firstName(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("First name cannot be empty.");
        }
        this.#firstName = String(value).trim();
    }

    get lastName() {
        return this.#lastName;
    }

    set lastName(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Last name cannot be empty.");
        }
        this.#lastName = String(value).trim();
    }

    assignDiningAccount(account) {
        if (!(account instanceof DiningAccount)) {
            throw new TypeError("Assign a valid DiningAccount or one of its subclasses.");
        }
        if (this.#diningAccount && this.#diningAccount !== account) {
            throw new Error("Student already has a dining account; replacement is not allowed.");
        }
        this.#diningAccount = account;
        return account;
    }

    get diningAccount() { return this.#diningAccount; }
    getDiningAccount() { return this.#diningAccount; }

    getFullName() {
        return `${this.#firstName} ${this.#lastName}`;
    }

    displayInfo() {
        return `
========================================
          STUDENT INFORMATION
========================================
Student ID:   ${this.#studentId}
Student Name: ${this.getFullName()}
========================================`.trim();
    }
}

module.exports = Student;
