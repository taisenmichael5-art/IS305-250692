class Student {

    #studentID;
    #studentName;
    #email;


    constructor(studentID, studentName, email) {

        this.#studentID = studentID;
        this.#studentName = studentName;
        this.#email = email;

    }


    // Getter and Setter for Student ID

    get studentID() {

        return this.#studentID;

    }


    set studentID(value) {

        this.#studentID = value;

    }



    // Getter and Setter for Name

    get studentName() {

        return this.#studentName;

    }


    set studentName(value) {

        this.#studentName = value;

    }



    // Getter and Setter for Email

    get email() {

        return this.#email;

    }


    set email(value) {

        this.#email = value;

    }



    displayStudentDetails() {

        return `
Student ID: ${this.#studentID}
Student Name: ${this.#studentName}
Email: ${this.#email}
`;

    }


}


module.exports = Student;