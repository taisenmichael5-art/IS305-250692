/*
  Program: AT1 Part 2 - Complete Dining Meal Booking Feature
  Student Name: Taisen Marainump
  Student ID: 20260001
  Date: 24 July 2026
  Description: A complete Node.js console application for
  creating and managing dining meal bookings.
*/

const readline = require("readline");
const MealBooking = require("./MealBooking");

// JavaScript array only - no database or file storage
const bookings = [];

// Create the console input interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to ask a console question
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Check whether the same student already has the same
// meal type booked for the same date
function isDuplicateBooking(newBooking) {
    return bookings.some((booking) =>
        booking.studentId.toLowerCase() ===
            newBooking.studentId.toLowerCase() &&
        booking.mealDate === newBooking.mealDate &&
        booking.mealType.toLowerCase() ===
            newBooking.mealType.toLowerCase()
    );
}

// Add a booking to the array only when it is not a duplicate
function addBooking(booking) {
    if (isDuplicateBooking(booking)) {
        throw new Error(
            `Duplicate booking rejected: ${booking.studentId} already has ` +
            `${booking.mealType} booked on ${booking.mealDate}.`
        );
    }

    bookings.push(booking);
}

// Collect booking details from the user
async function createBookingFromInput() {
    console.log("\n========================================");
    console.log("       DWU DINING MEAL BOOKING");
    console.log("========================================");

    const studentId = await askQuestion("Student ID: ");
    const studentName = await askQuestion("Student name: ");
    const mealDate = await askQuestion("Meal date (YYYY-MM-DD): ");
    const mealType = await askQuestion(
        "Meal type (Breakfast/Lunch/Dinner): "
    );
    const quantity = await askQuestion("Quantity: ");
    const dietaryNote = await askQuestion(
        "Dietary note (press Enter for None): "
    );

    const booking = new MealBooking({
        studentId,
        studentName,
        mealDate,
        mealType,
        quantity,
        dietaryNote
    });

    addBooking(booking);

    console.log("\n========================================");
    console.log("          BOOKING CREATED");
    console.log("========================================");
    console.log(booking.getSummary());

    return booking;
}

// Required test demonstrations
function runRequiredTests() {
    console.log("\n\n========================================");
    console.log("       REQUIRED TEST DEMONSTRATIONS");
    console.log("========================================");

    // TEST 1: Valid booking
    console.log("\nTEST 1 - VALID BOOKING");

    try {
        const validBooking = new MealBooking({
            studentId: "DWU2026001",
            studentName: "Maria Kila",
            mealDate: "2026-07-18",
            mealType: "Lunch",
            quantity: 2,
            dietaryNote: "No peanuts"
        });

        addBooking(validBooking);

        console.log("PASS: Valid booking created.");
        console.log(validBooking.getSummary());
    } catch (error) {
        console.log(`FAIL: ${error.message}`);
    }

    // TEST 2: Invalid booking
    console.log("\nTEST 2 - INVALID BOOKING");

    try {
        const invalidBooking = new MealBooking({
            studentId: "",
            studentName: "John Test",
            mealDate: "2026-07-19",
            mealType: "Supper",
            quantity: 0,
            dietaryNote: "None"
        });

        addBooking(invalidBooking);

        console.log("FAIL: Invalid booking should not be accepted.");
    } catch (error) {
        console.log(`PASS: Invalid booking rejected.`);
        console.log(`Error: ${error.message}`);
    }

    // TEST 3: Duplicate booking
    console.log("\nTEST 3 - DUPLICATE BOOKING");

    try {
        const duplicateBooking = new MealBooking({
            studentId: "DWU2026001",
            studentName: "Maria Kila",
            mealDate: "2026-07-18",
            mealType: "Lunch",
            quantity: 1,
            dietaryNote: "None"
        });

        addBooking(duplicateBooking);

        console.log("FAIL: Duplicate booking should not be accepted.");
    } catch (error) {
        console.log("PASS: Duplicate booking rejected.");
        console.log(`Error: ${error.message}`);
    }

    console.log("\n========================================");
    console.log(`Bookings currently in array: ${bookings.length}`);
    console.log("========================================");
}

// Main application menu
async function main() {
    try {
        console.log("========================================");
        console.log("   DWU DINING MEAL BOOKING APPLICATION");
        console.log("========================================");
        console.log("1. Create a booking");
        console.log("2. Run required tests");
        console.log("3. Exit");

        const choice = await askQuestion("\nChoose an option (1-3): ");

        if (choice === "1") {
            try {
                const booking = await createBookingFromInput();

                console.log("\nBooking action:");
                console.log("1. Leave as Pending");
                console.log("2. Confirm booking");
                console.log("3. Cancel booking");

                const action = await askQuestion(
                    "Choose an action (1-3): "
                );

                if (action === "2") {
                    booking.confirmBooking();
                    console.log("\nBooking confirmed successfully.");
                } else if (action === "3") {
                    booking.cancelBooking();
                    console.log("\nBooking cancelled successfully.");
                } else {
                    console.log(
                        "\nBooking remains Pending."
                    );
                }

                console.log("\nFINAL RECEIPT");
                console.log(booking.getSummary());
            } catch (error) {
                console.log(`\nERROR: ${error.message}`);
            }
        } else if (choice === "2") {
            runRequiredTests();
        } else if (choice === "3") {
            console.log("\nThank you for using DWU Dining Meal Booking.");
        } else {
            console.log(
                "\nERROR: Invalid menu option. Please run the program again."
            );
        }
    } catch (error) {
        console.log(`\nERROR: ${error.message}`);
    } finally {
        rl.close();
    }
}

main();
