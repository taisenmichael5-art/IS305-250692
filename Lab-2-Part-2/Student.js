/*
  Program: Lab 2 Part 2 - Student and Meal Booking Integration
  Student Name: Taisen Marainump
  Student ID: 20260001
  Description: Student class used by MealBooking objects.
*/

class Student {
    #studentId;
    #firstName;
    #lastName;

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
