class User {
    #userId;
    #firstName;
    #lastName;
    #email;
    #userType;

    constructor(userId, firstName, lastName, email, userType) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.userType = userType;
    }

    // User ID
    get userId() {
        return this.#userId;
    }

    set userId(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("User ID is required.");
        }

        this.#userId = String(value).trim();
    }

    // First name
    get firstName() {
        return this.#firstName;
    }

    set firstName(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("First name is required.");
        }

        this.#firstName = String(value).trim();
    }

    // Last name
    get lastName() {
        return this.#lastName;
    }

    set lastName(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Last name is required.");
        }

        this.#lastName = String(value).trim();
    }

    // Email
    get email() {
        return this.#email;
    }

    set email(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Email address is required.");
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(String(value).trim())) {
            throw new Error("Invalid email address.");
        }

        this.#email = String(value).trim();
    }

    // User type
    get userType() {
        return this.#userType;
    }

    set userType(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("User type is required.");
        }

        this.#userType = String(value).trim();
    }

    // Return user's full name
    getFullName() {
        return `${this.#firstName} ${this.#lastName}`;
    }

    // Validate the complete user
    validate() {
        if (!this.#userId) {
            return false;
        }

        if (!this.#firstName) {
            return false;
        }

        if (!this.#lastName) {
            return false;
        }

        if (!this.#email) {
            return false;
        }

        if (!this.#userType) {
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailPattern.test(this.#email);
    }

    // Display user information
    displayInfo() {
        return `
User ID: ${this.#userId}
Name: ${this.getFullName()}
Email: ${this.#email}
User Type: ${this.#userType}
        `.trim();
    }
}

module.exports = User;