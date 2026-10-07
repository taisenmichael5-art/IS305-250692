/*
  Program: Dining Meal Booking Feature
  Student Name: Taisen Marainump
  Student ID: 20260001
  Date: 17 July 2026
  Description: A JavaScript program demonstrating classes,
  objects, constructors, private fields and methods.
*/

// Import the MealBooking class
const MealBooking = require("./MealBooking");

// Create a MealBooking object
const booking = new MealBooking({
    studentId: "20260001",
    studentName: "Taisen Marainump",
    mealDate: "17 July 2026",
    mealType: "Lunch",
    quantity: 2,
    dietaryNote: "No dietary restrictions"
});

// Call a setter to safely update the booking status
booking.bookingStatus = "Confirmed";

// Call the object's methods and display the results
console.log(booking.getSummary());
console.log(`Calculated Total: K${booking.calculateTotal().toFixed(2)}`);
