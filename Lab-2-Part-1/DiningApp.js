/*
  Program: Lab 2 Part 1 - Student Class and Constructor
  Student Name: Taisen Marainump
  Student ID: 20260001
  Description: Creates a Student object using information
  entered by the user through the Node.js console.
*/

const readline = require("readline");
const Student = require("./Student");

// MealBooking remains part of the Lab 1 project.
const MealBooking = require("./MealBooking");

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

async function main() {
    try {
        console.log("========================================");
        console.log("     LAB 2 - STUDENT INFORMATION");
        console.log("========================================");

        // Ask the user for the required Student information
        const studentId = await askQuestion("Enter student ID: ");
        const firstName = await askQuestion("Enter first name: ");
        const lastName = await askQuestion("Enter last name: ");

        // Create one Student object
        const student = new Student(
            studentId,
            firstName,
            lastName
        );

        // Display the Student object
        console.log("\n" + student.displayInfo());

    } catch (error) {
        // Display a clear error instead of crashing
        console.log(`\nERROR: ${error.message}`);
    } finally {
        rl.close();
    }
}

main();
