/*
  Program: Lab 2 Part 1 - Student Class and Constructor
  Student Name: Taisen Marainump
  Student ID: 20260001
  Description: Adds a Student class to the Dining Meal Booking application.
*/

class Student {
    // Private fields
    #studentId;
    #firstName;
    #lastName;

    // Constructor
    constructor(studentId, firstName, lastName) {
        // Use setters so the entered values are validated
        this.studentId = studentId;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Getter for student ID
    get studentId() {
        return this.#studentId;
    }

    // Setter for student ID
    set studentId(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Student ID cannot be empty.");
        }

        this.#studentId = String(value).trim();
    }

    // Getter for first name
    get firstName() {
        return this.#firstName;
    }

    // Setter for first name
    set firstName(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("First name cannot be empty.");
        }

        this.#firstName = String(value).trim();
    }

    // Getter for last name
    get lastName() {
        return this.#lastName;
    }

    // Setter for last name
    set lastName(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Last name cannot be empty.");
        }

        this.#lastName = String(value).trim();
    }

    // Return the student's complete name
    getFullName() {
        return `${this.#firstName} ${this.#lastName}`;
    }

    // Return student information in the required format
    displayInfo() {
        return `
========================================
             STUDENT DETAILS
========================================
Student ID:   ${this.#studentId}
Student Name: ${this.getFullName()}
========================================`.trim();
    }
}

module.exports = Student;
