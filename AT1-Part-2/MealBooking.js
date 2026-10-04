/*
  Program: AT1 Part 2 - Complete Dining Meal Booking Feature
  Student Name: Taisen Marainump
  Student ID: 20260001
  Date: 24 July 2026
  Description: A complete Node.js console application demonstrating
  classes, objects, constructors, private fields, validation,
  getters, setters, methods, arrays and error handling.
*/

class MealBooking {
    #studentId;
    #studentName;
    #mealDate;
    #mealType;
    #quantity;
    #dietaryNote;
    #bookingStatus;

    constructor({
        studentId,
        studentName,
        mealDate,
        mealType,
        quantity,
        dietaryNote = "None"
    }) {
        this.#studentId = studentId;
        this.#studentName = studentName;
        this.#mealDate = mealDate;
        this.#mealType = mealType;
        this.#quantity = Number(quantity);
        this.#dietaryNote =
            dietaryNote && String(dietaryNote).trim() !== ""
                ? String(dietaryNote).trim()
                : "None";

        // Required default status
        this.#bookingStatus = "Pending";

        // Reject invalid information when an object is created
        this.validate();
    }

    // ---------------- GETTERS ----------------
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

    // ---------------- SETTERS ----------------
    set studentId(value) {
        this.#studentId = value;
        this.validate();
    }

    set studentName(value) {
        this.#studentName = value;
        this.validate();
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

    // ---------------- VALIDATION ----------------
    validate() {
        if (!this.#studentId || String(this.#studentId).trim() === "") {
            throw new Error("Student ID is required.");
        }

        if (!this.#studentName || String(this.#studentName).trim() === "") {
            throw new Error("Student name is required.");
        }

        if (!this.#mealDate || String(this.#mealDate).trim() === "") {
            throw new Error("Meal date is required.");
        }

        const validMealTypes = ["Breakfast", "Lunch", "Dinner"];

        const formattedMealType =
            String(this.#mealType || "").trim().charAt(0).toUpperCase() +
            String(this.#mealType || "").trim().slice(1).toLowerCase();

        if (!validMealTypes.includes(formattedMealType)) {
            throw new Error(
                "Invalid meal type. Please enter Breakfast, Lunch, or Dinner."
            );
        }

        this.#mealType = formattedMealType;

        if (
            !Number.isInteger(this.#quantity) ||
            this.#quantity < 1
        ) {
            throw new Error(
                "Quantity must be a whole number of 1 or more."
            );
        }

        return true;
    }

    // ---------------- CALCULATION ----------------
    calculateTotal() {
        const mealPrices = {
            Breakfast: 10,
            Lunch: 15,
            Dinner: 20
        };

        return mealPrices[this.#mealType] * this.#quantity;
    }

    // ---------------- BOOKING CONTROLS ----------------
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

    // ---------------- RECEIPT ----------------
    getSummary() {
        return `
========================================
           BOOKING RECEIPT
========================================
Student:       ${this.#studentName} (${this.#studentId})
Meal date:     ${this.#mealDate}
Meal type:     ${this.#mealType}
Quantity:      ${this.#quantity}
Dietary note:  ${this.#dietaryNote}
Status:        ${this.#bookingStatus}
Total cost:    K${this.calculateTotal().toFixed(2)}
========================================`.trim();
    }
}

module.exports = MealBooking;
