class Validator {



    static checkEmpty(value, fieldName){


        if(value.trim() === "") {


            throw new Error(
                `${fieldName} cannot be empty`
            );


        }


    }




    static validateMealType(mealType){


        let validMeals = [

            "Breakfast",
            "Lunch",
            "Dinner"

        ];



        if(!validMeals.includes(mealType)){


            throw new Error(
                "Meal must be Breakfast, Lunch or Dinner"
            );


        }


    }




    static validateQuantity(quantity){


        if(isNaN(quantity) || quantity <= 0){


            throw new Error(
                "Quantity must be a number greater than zero"
            );


        }


    }



}


module.exports = Validator;