const readline = require("readline-sync");


const Student = require("./classes/Student");
const MealBooking = require("./classes/MealBooking");
const BookingManager = require("./classes/BookingManager");
const Validator = require("./utils/Validator");



const bookingManager = new BookingManager();



console.log("\nDWU DINING MEAL BOOKING SYSTEM\n");



try {


    let studentID = readline.question(
        "Enter Student ID: "
    );


    let name = readline.question(
        "Enter Student Name: "
    );


    let email = readline.question(
        "Enter Email: "
    );



    Validator.checkEmpty(studentID,"Student ID");

    Validator.checkEmpty(name,"Student Name");

    Validator.checkEmpty(email,"Email");




    let student = new Student(

        studentID,
        name,
        email

    );




    let date = readline.question(
        "Enter Meal Date (DD-MM-YYYY): "
    );



    Validator.checkEmpty(date,"Meal Date");




    let mealType = readline.question(
        "Enter Meal Type (Breakfast/Lunch/Dinner): "
    );



    Validator.validateMealType(mealType);




    let quantity = Number(
        readline.question(
            "Enter Quantity: "
        )
    );



    Validator.validateQuantity(quantity);




    let note = readline.question(
        "Enter Dietary Note: "
    );




    let booking = new MealBooking(

        student,
        date,
        mealType,
        quantity,
        note

    );



    bookingManager.addBooking(booking);



    console.log(
        booking.displayBookingSummary()
    );



}

catch(error){


    console.log(
        "\nERROR:",
        error.message
    );


}