/* IS305 Lab 3 — extends the supplied Lab 2 Part 2 application.
   Author: Taisen Marainump | Student ID: 250692. In-memory objects and arrays. */
const readline = require("node:readline");
const Student = require("./Student");
const MealBooking = require("./MealBooking");
const DiningAccount = require("./DiningAccount");
const RewardsDiningAccount = require("./RewardsDiningAccount");
const CreditDiningAccount = require("./CreditDiningAccount");
const { runPart1Demonstration, runPart2Demonstration, displayTransactionHistory } = require("./Lab3Demonstrations");
const bookings = []; // Retained default collection for the original helper API.
let rl, answers;
async function askQuestion(question) {
    process.stdout.write(question);
    const answer = await answers.next();
    if (answer.done) throw new Error("Input closed. Application ended.");
    return answer.value.trim();
}
function parseMoney(text, label, allowZero = false) {
    if (!/^\d+(?:\.\d{1,2})?$/.test(text.trim())) throw new Error(`${label}: enter a non-negative amount with at most two decimals.`);
    const value = Number(text);
    if (!Number.isFinite(value) || (!allowZero && value <= 0)) throw new Error(`${label} must be ${allowZero ? "non-negative" : "positive"}.`);
    return value;
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

    sharedStudent.assignDiningAccount(new DiningAccount("LAB2-TEST", 100));

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


class DiningApp {
    #students = [];
    #bookings = [];

    getStudents() { return [...this.#students]; }
    getBookings() { return [...this.#bookings]; }
    findStudent(id) {
        return this.#students.find(student => student.studentId.toLowerCase() === String(id).trim().toLowerCase());
    }
    registerStudent(student) {
        if (!(student instanceof Student)) throw new Error("A valid Student object is required.");
        if (this.findStudent(student.studentId)) throw new Error("Student ID already exists.");
        if (student.diningAccount && this.#students.some(other => other.diningAccount &&
            other.diningAccount.getAccountNumber().toLowerCase() === student.diningAccount.getAccountNumber().toLowerCase())) {
            throw new Error("Account number is already assigned to another student.");
        }
        this.#students.push(student);
        return student;
    }
    assignAccount(student, account) {
        if (!this.#students.includes(student)) throw new Error("Register this Student object first.");
        if (!(account instanceof DiningAccount)) throw new Error("A valid dining account is required.");
        const duplicate = this.#students.some(other => other !== student && other.diningAccount &&
            other.diningAccount.getAccountNumber().toLowerCase() === account.getAccountNumber().toLowerCase());
        if (duplicate) throw new Error("Account number is already assigned to another student.");
        return student.assignDiningAccount(account);
    }
    addBooking(booking) {
        if (!(booking instanceof MealBooking) || !this.#students.includes(booking.student)) {
            throw new Error("Booking must refer to a registered Student object.");
        }
        addBooking(booking, this.#bookings); // Retains Lab 2 duplicate rule.
        return booking;
    }
    bookAndPay(student, details) {
        const booking = new MealBooking({ ...details, student });
        this.addBooking(booking); // Validate duplicate first; rejected payment leaves this Pending.
        const result = booking.processPayment(student.getDiningAccount());
        return { booking, result };
    }
    printHistory(student) { displayBookingHistory(student, this.#bookings); }

    async interactiveApplication() {
        console.log("\n=== STUDENT DINING ACCOUNT AND MEAL BOOKING ===");
        const studentId = await askQuestion("Student ID: ");
        const firstName = await askQuestion("First name: ");
        const lastName = await askQuestion("Last name: ");
        const student = new Student(studentId, firstName, lastName);
        console.log(student.displayInfo());
        console.log("Account types: 1 Standard | 2 Rewards | 3 Credit");
        const type = await askQuestion("Choose account type (1-3): ");
        const number = await askQuestion("Account number: ");
        const opening = parseMoney(await askQuestion("Opening balance (kina): "), "Opening balance", true);
        let account;
        if (type === "1") account = new DiningAccount(number, opening);
        else if (type === "2") {
            const rate = parseMoney(await askQuestion("Reward rate percent (e.g. 2.5): "), "Reward rate", true);
            account = new RewardsDiningAccount(number, opening, rate);
        } else if (type === "3") {
            const limit = parseMoney(await askQuestion("Credit limit (kina): "), "Credit limit", true);
            account = new CreditDiningAccount(number, opening, limit);
        } else throw new Error("Choose account type 1, 2 or 3.");
        student.assignDiningAccount(account);
        this.registerStudent(student);
        account.displayAccountSummary();
        let again = true;
        while (again) {
            console.log("\nEnter meal booking details:");
            const mealDate = await askQuestion("Meal date (YYYY-MM-DD): ");
            const mealType = await askQuestion("Meal type (Breakfast/Lunch/Dinner): ");
            const quantity = await askQuestion("Quantity: ");
            const dietaryNote = await askQuestion("Dietary note (Enter for None): ");
            try {
                const booking = new MealBooking({ student, mealDate, mealType, quantity, dietaryNote });
                this.addBooking(booking);
                const pay = await askQuestion("Pay and confirm this booking? (y/n): ");
                if (pay.toLowerCase() === "y") {
                    const result = booking.processPayment(account);
                    console.log(result.message);
                }
                console.log(booking.getSummary());
                console.log(`Remaining Balance: K${account.getBalance().toFixed(2)}`);
            } catch (error) { console.log(`ERROR: ${error.message}`); }
            again = (await askQuestion("Add another booking for this student? (y/n): ")).toLowerCase() === "y";
        }
        this.printHistory(student);
        displayTransactionHistory(account);
        if ((await askQuestion("Update the student's name? (y/n): ")).toLowerCase() === "y") {
            const first = await askQuestion(`New first name (${student.firstName}): `);
            const last = await askQuestion(`New last name (${student.lastName}): `);
            if (first) student.firstName = first;
            if (last) student.lastName = last;
            console.log("Existing bookings use the updated Student name.");
            this.printHistory(student);
        }
    }

    async selectStudent() {
        const id = await askQuestion("Student ID: ");
        const student = this.findStudent(id);
        if (!student) throw new Error("Student not found. Create the student using option 1.");
        return student;
    }
    async selectBooking(student) {
        const list = this.#bookings.filter(booking => booking.student === student);
        if (!list.length) throw new Error("No bookings for this student.");
        list.forEach((booking, index) => console.log(`${index + 1}. ${booking.mealType} / ${booking.mealDate} / ${booking.bookingStatus} / K${booking.calculateTotal().toFixed(2)}`));
        const input = await askQuestion("Booking number: ");
        if (!/^\d+$/.test(input)) throw new Error("Enter a whole-number booking selection.");
        const booking = list[Number(input) - 1];
        if (!booking) throw new Error("Invalid booking selection.");
        return booking;
    }
    async accountAction(choice) {
        const student = await this.selectStudent();
        const account = student.getDiningAccount();
        if (!account) throw new Error("This student has no dining account.");
        if (choice === "6") {
            const amount = parseMoney(await askQuestion("Deposit amount (kina): "), "Deposit");
            const note = await askQuestion("Description (Enter for default): ");
            if (note) account.deposit(amount, note); else account.deposit(amount);
            account.displayAccountSummary();
        } else if (choice === "7") {
            const booking = await this.selectBooking(student);
            console.log(booking.processPayment(account).message);
            console.log(booking.getSummary());
        } else if (choice === "8") {
            if (!(account instanceof RewardsDiningAccount)) throw new Error("Only a rewards account can apply a reward.");
            console.log(`Reward earned: K${account.calculateReward().toFixed(2)}`);
            account.applyReward(); account.displayAccountSummary();
        } else if (choice === "9") {
            this.printHistory(student); account.displayAccountSummary(); displayTransactionHistory(account);
        } else if (choice === "10") {
            const booking = await this.selectBooking(student); booking.cancelBooking();
            console.log("Booking cancelled. Any previous payment remains recorded; automatic refunds are not implemented.");
        } else if (choice === "11") {
            const booking = await this.selectBooking(student);
            if (booking.isPaid || booking.bookingStatus === "Cancelled") throw new Error("Only Pending unpaid bookings can be updated.");
            const field = await askQuestion("Change 1 date, 2 meal type, 3 quantity, 4 dietary note: ");
            const value = await askQuestion("New value: ");
            const details = { student, mealDate: booking.mealDate, mealType: booking.mealType,
                quantity: booking.quantity, dietaryNote: booking.dietaryNote };
            if (field === "1") details.mealDate = value;
            else if (field === "2") details.mealType = value;
            else if (field === "3") details.quantity = value;
            else if (field === "4") details.dietaryNote = value;
            else throw new Error("Invalid field choice.");
            const candidate = new MealBooking(details);
            if (isDuplicateBooking(candidate, this.#bookings.filter(other => other !== booking))) {
                throw new Error("Update rejected: duplicate booking.");
            }
            if (field === "1") booking.mealDate = candidate.mealDate;
            if (field === "2") booking.mealType = candidate.mealType;
            if (field === "3") booking.quantity = candidate.quantity;
            if (field === "4") booking.dietaryNote = candidate.dietaryNote;
            console.log(booking.getSummary());
        }
    }
}

async function main() {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    answers = rl[Symbol.asyncIterator]();
    const app = new DiningApp();
    try {
        while (true) {
            console.log("\n=== DWU DINING — LAB 3 DISTINCTION EXTENSION ===");
            console.log("1. Student and meal-booking application");
            console.log("2. Retained Lab 2 tests (with payment confirmation)");
            console.log("3. Exit");
            console.log("4. Required Part 1 account demonstrations");
            console.log("5. Required Part 2 demonstrations");
            console.log("6. Deposit funds");
            console.log("7. Pay / retry a Pending booking");
            console.log("8. Calculate and apply a reward");
            console.log("9. View account, bookings and transactions");
            console.log("10. Cancel a booking");
            console.log("11. Update a Pending booking");
            const choice = await askQuestion("Choose an option (1-11): ");
            if (choice === "3") { console.log("Application closed."); break; }
            try {
                if (choice === "1") await app.interactiveApplication();
                else if (choice === "2") runRequiredTests();
                else if (choice === "4") runPart1Demonstration();
                else if (choice === "5") runPart2Demonstration();
                else if (["6", "7", "8", "9", "10", "11"].includes(choice)) await app.accountAction(choice);
                else console.log("ERROR: Invalid menu option.");
            } catch (error) {
                if (error.message.startsWith("Input closed")) throw error;
                console.log(`ERROR: ${error.message}`);
            }
        }
    } catch (error) { console.log(error.message); }
    finally { rl.close(); }
}

if (require.main === module) {
    if (process.argv.includes("--part1")) runPart1Demonstration();
    else if (process.argv.includes("--demo")) runPart2Demonstration();
    else if (process.argv.includes("--lab2-tests")) runRequiredTests();
    else main();
}
module.exports = { DiningApp, displayBookingHistory, addBooking, isDuplicateBooking, runRequiredTests, main };
