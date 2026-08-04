class BookingManager {


    constructor(){

        this.bookings = [];

    }



    addBooking(booking){


        if(this.checkDuplicateBooking(booking)) {


            throw new Error(
                "Student already has a booking for this date and meal type."
            );


        }


        this.bookings.push(booking);


    }




    checkDuplicateBooking(newBooking){


        return this.bookings.some(existingBooking => {


            return (

                existingBooking.student.studentID === 
                newBooking.student.studentID

                &&

                existingBooking.mealDate === 
                newBooking.mealDate

                &&

                existingBooking.mealType ===
                newBooking.mealType

            );


        });


    }




    displayBookings(){


        this.bookings.forEach(booking => {


            console.log(
                booking.displayBookingSummary()
            );


        });


    }



}



module.exports = BookingManager;