const User = require("./User");

try {
    const user = new User(
        "U001",
        "Taisen",
        "Marainump",
        "taisen@example.com",
        "Student"
    );

    console.log("User created successfully.");
    console.log("Valid:", user.validate());
    console.log("Full Name:", user.getFullName());
    console.log(user.displayInfo());

} catch (error) {
    console.log("Error:", error.message);
}