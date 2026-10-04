/*
  Program: Lab 2 Part 2 - Student and Meal Booking Integration
  Student Name: Taisen Marainump
  Student ID: 20260001
  Description: MealBooking stores a reference to a Student object.
*/

const Student = require("./Student");

class MealBooking {
    #student;
    #mealDate;
    #mealType;
    #quantity;
    #dietaryNote;
    #bookingStatus;

    constructor({
        student,
        mealDate,
        mealType,
        quantity,
        dietaryNote = "None"
    }) {
        this.#student = student;
        this.#mealDate = mealDate;
        this.#mealType = mealType;
        this.#quantity = Number(quantity);
        this.#dietaryNote =
            dietaryNote && String(dietaryNote).trim() !== ""
                ? String(dietaryNote).trim()
                : "None";
        this.#bookingStatus = "Pending";

        this.validate();
    }

    get student() {
        return this.#student;
    }

    get mealDate() {
        return this.#mealDate;
    }

    get mealType() {
        return this.#mealType;
    }

    get quantity() {
        return this.#quantity;
    }

    get dietaryNote() {
        return this.#dietaryNote;
    }

    get bookingStatus() {
        return this.#bookingStatus;
    }

    set mealDate(value) {
        this.#mealDate = value;
        this.validate();
    }

    set mealType(value) {
        this.#mealType = value;
        this.validate();
    }

    set quantity(value) {
        this.#quantity = Number(value);
        this.validate();
    }

    set dietaryNote(value) {
        this.#dietaryNote =
            value && String(value).trim() !== ""
                ? String(value).trim()
                : "None";
    }

    validate() {
        // Credit requirement: MealBooking must receive a valid Student object.
        if (!(this.#student instanceof Student)) {
            throw new Error(
                "A valid Student object must be provided to MealBooking."
            );
        }

        if (!this.#mealDate || String(this.#mealDate).trim() === "") {
            throw new Error("Meal date cannot be empty.");
        }

        const validMealTypes = ["Breakfast", "Lunch", "Dinner"];
        const value = String(this.#mealType || "").trim();
        const formattedMealType =
            value.charAt(0).toUpperCase() +
            value.slice(1).toLowerCase();

        if (!validMealTypes.includes(formattedMealType)) {
            throw new Error(
                "Meal type must be Breakfast, Lunch, or Dinner."
            );
        }

        this.#mealType = formattedMealType;

        if (!Number.isInteger(this.#quantity) || this.#quantity < 1) {
            throw new Error(
                "Quantity must be a whole number of 1 or more."
            );
        }

        return true;
    }

    calculateTotal() {
        const mealPrices = {
            Breakfast: 10,
            Lunch: 15,
            Dinner: 20
        };

        return mealPrices[this.#mealType] * this.#quantity;
    }

    confirmBooking() {
        if (this.#bookingStatus === "Cancelled") {
            throw new Error(
                "A cancelled booking cannot be confirmed."
            );
        }
        this.#bookingStatus = "Confirmed";
    }

    cancelBooking() {
        this.#bookingStatus = "Cancelled";
    }

    getSummary() {
        return `
Student:       ${this.#student.getFullName()} (${this.#student.studentId})
Meal date:     ${this.#mealDate}
Meal type:     ${this.#mealType}
Quantity:      ${this.#quantity}
Dietary note:  ${this.#dietaryNote}
Status:        ${this.#bookingStatus}
Total cost:    K${this.calculateTotal().toFixed(2)}`.trim();
    }
}

module.exports = MealBooking;
