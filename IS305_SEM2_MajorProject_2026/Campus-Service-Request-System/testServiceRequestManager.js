const User = require("./User");
const ServiceRequest = require("./ServiceRequest");
const ServiceRequestManager = require("./ServiceRequestManager");

const manager = new ServiceRequestManager();

console.log("============================================");
console.log("SERVICE REQUEST MANAGER TEST");
console.log("============================================");

try {
    // ==========================================
    // 1. REGISTER USERS
    // ==========================================

    const user1 = new User(
        "U001",
        "Taisen",
        "Marainump",
        "taisen@example.com",
        "Student"
    );

    const user2 = new User(
        "U002",
        "Glen",
        "N",
        "glen@example.com",
        "Staff"
    );

    manager.registerUser(user1);
    manager.registerUser(user2);

    console.log("\n1. User registration");
    console.log("Users registered successfully.");

    // ==========================================
    // 2. TEST DUPLICATE USER
    // ==========================================

    try {
        const duplicateUser = new User(
            "U001",
            "Another",
            "Person",
            "another@example.com",
            "Student"
        );

        manager.registerUser(duplicateUser);
    } catch (error) {
        console.log("Duplicate user rejected:", error.message);
    }

    // ==========================================
    // 3. CREATE REQUEST
    // ==========================================

    const request1 = new ServiceRequest(
        "REQ001",
        user1,
        "Wi-Fi Problem",
        "Wi-Fi is not working in the computer lab.",
        "LAB 133",
        "ICT Support",
        "High"
    );

    manager.submitRequest(request1);

    console.log("\n2. Request submission");
    console.log("Request submitted successfully.");
    console.log("Status:", request1.status);

    // ==========================================
    // 4. SECOND REQUEST
    // ==========================================

    const request2 = new ServiceRequest(
        "REQ002",
        user2,
        "Broken Chair",
        "A chair is broken in the classroom.",
        "LAB 131",
        "Facilities Maintenance",
        "Normal"
    );

    manager.submitRequest(request2);

    console.log("Second request submitted successfully.");

    // ==========================================
    // 5. VIEW USER REQUESTS
    // ==========================================

    console.log("\n3. Requests belonging to U001");

    const userRequests = manager.getRequestsByUser("U001");

    for (const request of userRequests) {
        console.log(
            `${request.requestId} - ${request.title} - ${request.status}`
        );
    }

    // ==========================================
    // 6. VIEW ALL REQUESTS
    // ==========================================

    console.log("\n4. All requests");

    const allRequests = manager.getAllRequests();

    for (const request of allRequests) {
        console.log(
            `${request.requestId} - ${request.title} - ${request.status}`
        );
    }

    // ==========================================
    // 7. UPDATE OWN REQUEST
    // ==========================================

    console.log("\n5. Update own request");

    manager.updateRequest("REQ001", "U001", {
        description: "Wi-Fi is completely unavailable in LAB 133.",
        priority: "Urgent"
    });

    console.log("Request updated successfully.");
    console.log("New priority:", request1.priority);

    // ==========================================
    // 8. PREVENT OTHER USER FROM UPDATING
    // ==========================================

    console.log("\n6. Prevent another user from updating");

    try {
        manager.updateRequest("REQ001", "U002", {
            priority: "Low"
        });
    } catch (error) {
        console.log("Update rejected:", error.message);
    }

    // ==========================================
    // 9. SEARCH
    // ==========================================

    console.log("\n7. Search for 'Wi-Fi'");

    const searchResults = manager.searchRequests("Wi-Fi");

    for (const request of searchResults) {
        console.log(
            `${request.requestId} - ${request.title}`
        );
    }

    // ==========================================
    // 10. CANCEL OWN REQUEST
    // ==========================================

    console.log("\n8. Cancel own request");

    manager.cancelRequest("REQ001", "U001");

    console.log("Request cancelled successfully.");
    console.log("New status:", request1.status);

    // ==========================================
    // 11. PREVENT OTHER USER CANCELLATION
    // ==========================================

    console.log("\n9. Prevent another user from cancelling");

    try {
        manager.cancelRequest("REQ002", "U001");
    } catch (error) {
        console.log("Cancellation rejected:", error.message);
    }

    // ==========================================
    // 12. REQUEST SUMMARY
    // ==========================================

    console.log("\n10. Request summary by status");

    const summary = manager.getRequestSummaryByStatus();

    console.log("Submitted:", summary.Submitted);
    console.log("Cancelled:", summary.Cancelled);

    console.log("\n============================================");
    console.log("MANAGER TEST COMPLETED");
    console.log("============================================");

} catch (error) {
    console.log("\nTEST ERROR:", error.message);
}