/*
  Program: Dining Meal Booking Feature
  Student Name: Taisen Marainump
  Student ID: 20260001
  Date: 17 July 2026
  Description: A JavaScript program demonstrating classes,
  objects, constructors, private fields and methods.
*/

class MealBooking {
    // Private fields
    #studentId;
    #studentName;
    #mealDate;
    #mealType;
    #quantity;
    #dietaryNote;
    #bookingStatus;

    // Constructor
    constructor({
        studentId,
        studentName,
        mealDate,
        mealType,
        quantity,
        dietaryNote = "None"
    }) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.mealDate = mealDate;
        this.mealType = mealType;
        this.quantity = quantity;
        this.dietaryNote = dietaryNote;
        this.#bookingStatus = "Pending";
    }

    // Getters
    get studentId() {
        return this.#studentId;
    }

    get studentName() {
        return this.#studentName;
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

    // Setters
    set studentId(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Student ID cannot be empty.");
        }
        this.#studentId = String(value).trim();
    }

    set studentName(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Student name cannot be empty.");
        }
        this.#studentName = String(value).trim();
    }

    set mealDate(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Meal date cannot be empty.");
        }
        this.#mealDate = value;
    }

    set mealType(value) {
        const validMealTypes = ["Breakfast", "Lunch", "Dinner"];
        const formattedType =
            String(value).charAt(0).toUpperCase() +
            String(value).slice(1).toLowerCase();

        if (!validMealTypes.includes(formattedType)) {
            throw new Error("Meal type must be Breakfast, Lunch, or Dinner.");
        }

        this.#mealType = formattedType;
    }

    set quantity(value) {
        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            throw new Error("Quantity must be a positive whole number.");
        }

        this.#quantity = number;
    }

    set dietaryNote(value) {
        this.#dietaryNote =
            value && String(value).trim() !== ""
                ? String(value).trim()
                : "None";
    }

    set bookingStatus(value) {
        const validStatuses = ["Pending", "Confirmed", "Cancelled"];

        if (!validStatuses.includes(value)) {
            throw new Error(
                "Booking status must be Pending, Confirmed, or Cancelled."
            );
        }

        this.#bookingStatus = value;
    }

    // Calculate the total cost based on meal type and quantity
    calculateTotal() {
        const mealPrices = {
            Breakfast: 10,
            Lunch: 15,
            Dinner: 20
        };

        return mealPrices[this.#mealType] * this.#quantity;
    }

    // Return a formatted booking summary
    getSummary() {
        return `
========== DINING MEAL BOOKING ==========
Student ID:       ${this.#studentId}
Student Name:     ${this.#studentName}
Meal Date:        ${this.#mealDate}
Meal Type:        ${this.#mealType}
Quantity:         ${this.#quantity}
Dietary Note:     ${this.#dietaryNote}
Booking Status:   ${this.#bookingStatus}
Total Cost:       K${this.calculateTotal().toFixed(2)}
=========================================
`.trim();
    }
}

// Export the class so it can be used in DiningApp.js
module.exports = MealBooking;
