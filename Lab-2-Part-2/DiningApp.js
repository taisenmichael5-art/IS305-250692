/*
  Program: Lab 2 Part 2 - Student and Meal Booking Integration
  Student Name: Taisen Marainump
  Student ID: 20260001
  Description: Integrates Student and MealBooking objects using
  shared object references and JavaScript arrays.
*/

const readline = require("readline");
const Student = require("./Student");
const MealBooking = require("./MealBooking");

// Required JavaScript array. No database is used.
const bookings = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Duplicate = same student ID + meal date + meal type.
function isDuplicateBooking(newBooking, bookingArray) {
    return bookingArray.some((booking) =>
        booking.student.studentId.toLowerCase() ===
            newBooking.student.studentId.toLowerCase() &&
        booking.mealDate === newBooking.mealDate &&
        booking.mealType.toLowerCase() ===
            newBooking.mealType.toLowerCase()
    );
}

function addBooking(booking, bookingArray = bookings) {
    if (!(booking instanceof MealBooking)) {
        throw new Error("Only MealBooking objects can be stored.");
    }

    if (isDuplicateBooking(booking, bookingArray)) {
        throw new Error(
            `Duplicate booking rejected: ${booking.student.studentId} ` +
            `already has ${booking.mealType} on ${booking.mealDate}.`
        );
    }

    bookingArray.push(booking);
}

// Required Lab 2 Part 2 function.
function displayBookingHistory(student, bookingArray) {
    if (!(student instanceof Student)) {
        throw new Error(
            "displayBookingHistory() requires a valid Student object."
        );
    }

    const studentBookings = bookingArray.filter(
        (booking) =>
            booking.student.studentId.toLowerCase() ===
            student.studentId.toLowerCase()
    );

    let combinedCost = 0;

    console.log("\n" + student.displayInfo());
    console.log("\n========================================");
    console.log("            BOOKING HISTORY");
    console.log("========================================");

    if (studentBookings.length === 0) {
        console.log("No bookings found for this student.");
    } else {
        studentBookings.forEach((booking, index) => {
            const cost = booking.calculateTotal();
            combinedCost += cost;

            console.log(
                `${index + 1}. ${booking.mealType} - ${booking.mealDate}`
            );
            console.log(`   Quantity: ${booking.quantity}`);
            console.log(`   Dietary note: ${booking.dietaryNote}`);
            console.log(`   Status: ${booking.bookingStatus}`);
            console.log(`   Cost: K${cost.toFixed(2)}`);
            console.log("");
        });
    }

    console.log(`Total Bookings: ${studentBookings.length}`);
    console.log(`Combined Cost: K${combinedCost.toFixed(2)}`);
    console.log("========================================");
}

async function interactiveApplication() {
    console.log("\n========================================");
    console.log("    LAB 2 DINING BOOKING APPLICATION");
    console.log("========================================");

    // 1. Collect student details.
    const studentId = await askQuestion("Student ID: ");
    const firstName = await askQuestion("First name: ");
    const lastName = await askQuestion("Last name: ");

    // 2. Create one Student object.
    const student = new Student(
        studentId,
        firstName,
        lastName
    );

    console.log("\nStudent created successfully.");
    console.log(student.displayInfo());

    let keepAdding = true;

    while (keepAdding) {
        // 3. Collect meal-booking details.
        console.log("\nEnter meal booking details:");
        const mealDate = await askQuestion(
            "Meal date (YYYY-MM-DD): "
        );
        const mealType = await askQuestion(
            "Meal type (Breakfast/Lunch/Dinner): "
        );
        const quantity = await askQuestion("Quantity: ");
        const dietaryNote = await askQuestion(
            "Dietary note (Enter for None): "
        );

        try {
            // 4. Connect the same Student object to MealBooking.
            const booking = new MealBooking({
                student,
                mealDate,
                mealType,
                quantity,
                dietaryNote
            });

            // 5. Store MealBooking object in array.
            addBooking(booking);

            const action = await askQuestion(
                "Confirm this booking? (y/n): "
            );

            if (action.toLowerCase() === "y") {
                booking.confirmBooking();
            }

            // 6. Display related student and booking information.
            console.log("\n========================================");
            console.log("          BOOKING CREATED");
            console.log("========================================");
            console.log(booking.getSummary());
            console.log("========================================");

        } catch (error) {
            console.log(`\nERROR: ${error.message}`);
        }

        const again = await askQuestion(
            "\nAdd another booking for this student? (y/n): "
        );

        keepAdding = again.toLowerCase() === "y";
    }

    // Display complete history.
    displayBookingHistory(student, bookings);

    // Controlled update demonstration.
    const updateName = await askQuestion(
        "\nUpdate the student's name? (y/n): "
    );

    if (updateName.toLowerCase() === "y") {
        const newFirstName = await askQuestion(
            `New first name (${student.firstName}): `
        );
        const newLastName = await askQuestion(
            `New last name (${student.lastName}): `
        );

        if (newFirstName !== "") {
            student.firstName = newFirstName;
        }

        if (newLastName !== "") {
            student.lastName = newLastName;
        }

        console.log(
            "\nStudent updated. Existing bookings now use the updated name."
        );

        // The same Student reference is used, so all existing
        // booking summaries automatically show the new name.
        displayBookingHistory(student, bookings);
    }
}

function runRequiredTests() {
    console.log("\n========================================");
    console.log("       LAB 2 PART 2 REQUIRED TESTS");
    console.log("========================================");

    const testBookings = [];

    // TEST 1: Valid Student object
    console.log("\nTEST 1 - VALID STUDENT OBJECT");
    try {
        const student = new Student(
            "DWU2026001",
            "Maria",
            "Kila"
        );
        console.log("PASS: Student accepted.");
        console.log(student.displayInfo());
    } catch (error) {
        console.log(`FAIL: ${error.message}`);
    }

    // TEST 2: Invalid Student information
    console.log("\nTEST 2 - INVALID STUDENT INFORMATION");
    try {
        new Student("", "Maria", "Kila");
        console.log("FAIL: Empty student ID was accepted.");
    } catch (error) {
        console.log("PASS: Invalid student rejected.");
        console.log(`Error: ${error.message}`);
    }

    // Create shared Student for remaining tests.
    const sharedStudent = new Student(
        "DWU2026001",
        "Maria",
        "Kila"
    );

    // TEST 3: Student and booking integration
    console.log("\nTEST 3 - STUDENT AND BOOKING INTEGRATION");
    try {
        const lunch = new MealBooking({
            student: sharedStudent,
            mealDate: "12 August 2026",
            mealType: "Lunch",
            quantity: 2,
            dietaryNote: "No peanuts"
        });
        lunch.confirmBooking();
        addBooking(lunch, testBookings);

        const dinner = new MealBooking({
            student: sharedStudent,
            mealDate: "13 August 2026",
            mealType: "Dinner",
            quantity: 1,
            dietaryNote: "None"
        });
        addBooking(dinner, testBookings);

        console.log("PASS: MealBooking uses connected Student object.");
        console.log(lunch.getSummary());
    } catch (error) {
        console.log(`FAIL: ${error.message}`);
    }

    // Extra duplicate test retained from Lab 1.
    console.log("\nDUPLICATE BOOKING CHECK");
    try {
        const duplicate = new MealBooking({
            student: sharedStudent,
            mealDate: "12 August 2026",
            mealType: "Lunch",
            quantity: 1,
            dietaryNote: "None"
        });
        addBooking(duplicate, testBookings);
        console.log("FAIL: Duplicate was accepted.");
    } catch (error) {
        console.log("PASS: Duplicate booking rejected.");
        console.log(`Error: ${error.message}`);
    }

    // TEST 4: Updated student name
    console.log("\nTEST 4 - UPDATED STUDENT NAME");
    try {
        console.log(
            `Before update: ${testBookings[0].student.getFullName()}`
        );

        sharedStudent.firstName = "Mary";
        sharedStudent.lastName = "Kila-Smith";

        console.log(
            `After update:  ${testBookings[0].student.getFullName()}`
        );
        console.log("Existing booking summary:");
        console.log(testBookings[0].getSummary());

        if (
            testBookings[0].student.getFullName() ===
            "Mary Kila-Smith"
        ) {
            console.log(
                "PASS: Existing booking reflects updated Student object."
            );
        } else {
            console.log("FAIL: Updated name was not reflected.");
        }
    } catch (error) {
        console.log(`FAIL: ${error.message}`);
    }

    // TEST 5: Booking history
    console.log("\nTEST 5 - BOOKING HISTORY");
    try {
        displayBookingHistory(sharedStudent, testBookings);

        if (testBookings.length === 2) {
            console.log(
                "PASS: All student bookings displayed."
            );
        }
    } catch (error) {
        console.log(`FAIL: ${error.message}`);
    }
}

async function main() {
    try {
        console.log("========================================");
        console.log(" LAB 2 - STUDENT & MEAL BOOKING SYSTEM");
        console.log("========================================");
        console.log("1. Run interactive application");
        console.log("2. Run required tests");
        console.log("3. Exit");

        const choice = await askQuestion(
            "\nChoose an option (1-3): "
        );

        if (choice === "1") {
            await interactiveApplication();
        } else if (choice === "2") {
            runRequiredTests();
        } else if (choice === "3") {
            console.log("\nApplication closed.");
        } else {
            console.log("\nERROR: Invalid menu option.");
        }
    } catch (error) {
        console.log(`\nERROR: ${error.message}`);
    } finally {
        rl.close();
    }
}

main();

module.exports = {
    displayBookingHistory,
    addBooking,
    isDuplicateBooking
};
