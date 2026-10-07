/*
  Program: Lab 2 Part 2 - Student and Meal Booking Integration
  Student Name: Taisen Marainump
  Student ID: 250692
  Description: MealBooking stores a reference to a Student object.
*/

const Student = require("./Student");
const DiningAccount = require("./DiningAccount");

class MealBooking {
    #student;
    #mealDate;
    #mealType;
    #quantity;
    #dietaryNote;
    #bookingStatus;
    #paid = false;
    #paymentResult = null;

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
        this.#quantity = this.#parseQuantity(quantity);
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

    #parseQuantity(value) {
        if (typeof value === "number") return value;
        if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value.trim());
        return NaN;
    }

    #updateUnpaidField(field, value) {
        if (this.#paid) throw new Error("A paid booking's meal details cannot be changed.");
        if (this.#bookingStatus === "Cancelled") throw new Error("A cancelled booking cannot be changed.");
        const previous = { date: this.#mealDate, type: this.#mealType, quantity: this.#quantity };
        if (field === "date") this.#mealDate = value;
        if (field === "type") this.#mealType = value;
        if (field === "quantity") this.#quantity = this.#parseQuantity(value);
        try { this.validate(); }
        catch (error) {
            this.#mealDate = previous.date;
            this.#mealType = previous.type;
            this.#quantity = previous.quantity;
            throw error;
        }
    }

    set mealDate(value) { this.#updateUnpaidField("date", value); }
    set mealType(value) { this.#updateUnpaidField("type", value); }
    set quantity(value) { this.#updateUnpaidField("quantity", value); }

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

        if (!Number.isSafeInteger(this.#quantity) || this.#quantity < 1) {
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

        const total = mealPrices[this.#mealType] * this.#quantity;
        if (!Number.isSafeInteger(total * 100)) throw new RangeError("Booking total exceeds the supported money limit.");
        return total;
    }

    get isPaid() { return this.#paid; }
    get paymentStatus() { return this.#paid ? "Successful" : "Unpaid"; }
    getPaymentResult() { return this.#paymentResult ? { ...this.#paymentResult } : null; }

    processPayment(diningAccount = this.#student.getDiningAccount()) {
        const failure = message => {
            const result = { success: false, message, bookingStatus: this.#bookingStatus };
            // Keep the last successful receipt after a duplicate-payment rejection.
            if (!this.#paid) this.#paymentResult = Object.freeze(result);
            return result;
        };
        if (this.#paid || this.#bookingStatus === "Confirmed") {
            return failure("Payment rejected: this booking has already been paid or confirmed.");
        }
        if (this.#bookingStatus === "Cancelled") {
            return failure("Payment rejected: a cancelled booking cannot be paid.");
        }
        this.#bookingStatus = "Pending";
        if (!(diningAccount instanceof DiningAccount)) {
            return failure("Payment rejected: assign a valid dining account first.");
        }
        if (diningAccount !== this.#student.getDiningAccount()) {
            return failure("Payment rejected: use this student's assigned dining account.");
        }
        try {
            this.validate();
            const amount = this.calculateTotal();
            const description = `${this.#mealType} booking on ${this.#mealDate}`;
            // One polymorphic call: there is no subtype-specific payment branch.
            const accepted = diningAccount.payForMeal(amount, description);
            if (accepted !== true) return failure("Payment rejected by dining account.");
            this.#paid = true;
            this.#bookingStatus = "Confirmed";
            const result = { success: true, message: "Payment successful",
                amount, accountNumber: diningAccount.getAccountNumber(),
                remainingBalance: diningAccount.getBalance(), bookingStatus: "Confirmed" };
            this.#paymentResult = Object.freeze(result);
            return { ...result };
        } catch (error) {
            return failure(`Payment rejected: ${error.message}`);
        }
    }

    // Retained Lab 2 API; confirmation now requires a successful payment.
    confirmBooking() {
        const result = this.processPayment();
        if (!result.success) throw new Error(result.message);
        return result;
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
Payment:       ${this.paymentStatus}
Total cost:    K${this.calculateTotal().toFixed(2)}`.trim();
    }
}

module.exports = MealBooking;
