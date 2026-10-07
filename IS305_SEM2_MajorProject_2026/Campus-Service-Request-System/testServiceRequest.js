const User = require("./User");
const ServiceRequest = require("./ServiceRequest");

try {
    // Create a user
    const user = new User(
        "U001",
        "Taisen",
        "Marainump",
        "taisen@example.com",
        "Student"
    );

    // Create a service request
    const request = new ServiceRequest(
        "REQ001",
        user,
        "Wi-Fi Problem",
        "The Wi-Fi is not working in the computer lab.",
        "LAB 133",
        "ICT Support",
        "High"
    );

    console.log("============================================");
    console.log("SERVICE REQUEST TEST");
    console.log("============================================");

    console.log("\nRequest created successfully.");
    console.log("Valid:", request.validate());
    console.log("Status:", request.status);

    console.log("\n--- Request Summary ---");
    console.log(request.getRequestSummary());

    console.log("\n--- Updating Request ---");

    request.updateDetails({
        description: "The Wi-Fi connection is completely unavailable in LAB 133.",
        priority: "Urgent"
    });

    console.log("Request updated successfully.");
    console.log("New Priority:", request.priority);

    console.log("\n--- Cancelling Request ---");

    request.cancelRequest();

    console.log("Request cancelled successfully.");
    console.log("New Status:", request.status);

} catch (error) {
    console.log("ERROR:", error.message);
}