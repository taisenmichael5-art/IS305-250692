class MealBooking {


    #student;
    #mealDate;
    #mealType;
    #quantity;
    #dietaryNote;
    #bookingStatus;
    #totalCost;



    constructor(student, mealDate, mealType, quantity, dietaryNote) {


        this.#student = student;
        this.#mealDate = mealDate;
        this.#mealType = mealType;
        this.#quantity = quantity;
        this.#dietaryNote = dietaryNote;

        this.#bookingStatus = "Confirmed";

        this.#totalCost = this.calculateCost();


    }



    calculateCost() {


        let price = 0;


        if(this.#mealType === "Breakfast") {

            price = 10;

        }

        else if(this.#mealType === "Lunch") {

            price = 15;

        }

        else if(this.#mealType === "Dinner") {

            price = 20;

        }


        return price * this.#quantity;


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



    get totalCost() {

        return this.#totalCost;

    }



    get bookingStatus() {

        return this.#bookingStatus;

    }




    displayBookingSummary() {


        return `

====================================
       DWU DINING BOOKING
====================================

${this.#student.displayStudentDetails()}

Meal Date      : ${this.#mealDate}
Meal Type      : ${this.#mealType}
Quantity       : ${this.#quantity}
Dietary Note   : ${this.#dietaryNote}
Status         : ${this.#bookingStatus}

Total Cost     : K${this.#totalCost.toFixed(2)}

====================================

`;

    }



}


module.exports = MealBooking;