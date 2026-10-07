const readline = require("readline-sync");

const User = require("./User");
const ServiceRequest = require("./ServiceRequest");
const ServiceRequestManager = require("./ServiceRequestManager");

const manager = new ServiceRequestManager();


// ==========================================
// DISPLAY MENU
// ==========================================

function displayMenu() {
    console.log("\n============================================");
    console.log("       CAMPUS SERVICE REQUEST SYSTEM");
    console.log("============================================");
    console.log("1. Register User");
    console.log("2. Submit Service Request");
    console.log("3. View Request by ID");
    console.log("4. View My Requests");
    console.log("5. View All Requests");
    console.log("6. Update My Request");
    console.log("7. Cancel My Request");
    console.log("8. Search Requests");
    console.log("9. View Request Summary");
    console.log("10. Exit");
    console.log("============================================");
}


// ==========================================
// REGISTER USER
// ==========================================

function registerUser() {
    console.log("\n--- Register User ---");

    try {
        const userId = readline.question("Enter User ID: ");
        const firstName = readline.question("Enter First Name: ");
        const lastName = readline.question("Enter Last Name: ");
        const email = readline.question("Enter Email Address: ");
        const userType = readline.question("Enter User Type: ");

        const user = new User(
            userId,
            firstName,
            lastName,
            email,
            userType
        );

        manager.registerUser(user);

        console.log("\nUser registered successfully.");
        console.log(user.displayInfo());

    } catch (error) {
        console.log(`\nError: ${error.message}`);
    }
}


// ==========================================
// SUBMIT SERVICE REQUEST
// ==========================================

function submitServiceRequest() {
    console.log("\n--- Submit Service Request ---");

    try {
        const requestId = readline.question("Enter Request ID: ");
        const userId = readline.question("Enter Requester User ID: ");

        const user = manager.findUserById(userId);

        if (!user) {
            console.log("User not found. Please register the user first.");
            return;
        }

        const title = readline.question("Enter Request Title: ");
        const description = readline.question("Enter Description: ");
        const campusLocation = readline.question("Enter Campus Location: ");

        console.log("\nCategories:");
        ServiceRequest.CATEGORIES.forEach((category, index) => {
            console.log(`${index + 1}. ${category}`);
        });

        const categoryChoice = readline.questionInt(
            "Select Category: "
        );

        if (
            categoryChoice < 1 ||
            categoryChoice > ServiceRequest.CATEGORIES.length
        ) {
            console.log("Invalid category selection.");
            return;
        }

        const category =
            ServiceRequest.CATEGORIES[categoryChoice - 1];

        console.log("\nPriority Values:");

        ServiceRequest.PRIORITIES.forEach((priority, index) => {
            console.log(`${index + 1}. ${priority}`);
        });

        const priorityChoice = readline.questionInt(
            "Select Priority: "
        );

        if (
            priorityChoice < 1 ||
            priorityChoice > ServiceRequest.PRIORITIES.length
        ) {
            console.log("Invalid priority selection.");
            return;
        }

        const priority =
            ServiceRequest.PRIORITIES[priorityChoice - 1];

        const request = new ServiceRequest(
            requestId,
            user,
            title,
            description,
            campusLocation,
            category,
            priority
        );

        manager.submitRequest(request);

        console.log("\nService request submitted successfully.");
        console.log(`Request ID: ${request.requestId}`);
        console.log(`Status: ${request.status}`);

    } catch (error) {
        console.log(`\nError: ${error.message}`);
    }
}


// ==========================================
// VIEW REQUEST BY ID
// ==========================================

function viewRequestById() {
    console.log("\n--- View Request by ID ---");

    const requestId = readline.question("Enter Request ID: ");

    const request = manager.findRequestById(requestId);

    if (!request) {
        console.log("Request not found.");
        return;
    }

    console.log("\n" + request.getRequestSummary());
}


// ==========================================
// VIEW MY REQUESTS
// ==========================================

function viewMyRequests() {
    console.log("\n--- View My Requests ---");

    const userId = readline.question("Enter Your User ID: ");

    const user = manager.findUserById(userId);

    if (!user) {
        console.log("User not found.");
        return;
    }

    const requests = manager.getRequestsByUser(userId);

    if (requests.length === 0) {
        console.log("You have no service requests.");
        return;
    }

    console.log(`\nRequests for ${user.getFullName()}:`);

    requests.forEach((request, index) => {
        console.log("\n--------------------------------------------");
        console.log(`Request ${index + 1}`);
        console.log(`Request ID: ${request.requestId}`);
        console.log(`Title: ${request.title}`);
        console.log(`Category: ${request.category}`);
        console.log(`Priority: ${request.priority}`);
        console.log(`Status: ${request.status}`);
        console.log("--------------------------------------------");
    });
}


// ==========================================
// VIEW ALL REQUESTS
// ==========================================

function viewAllRequests() {
    console.log("\n--- View All Requests ---");

    const requests = manager.getAllRequests();

    if (requests.length === 0) {
        console.log("No service requests found.");
        return;
    }

    requests.forEach((request, index) => {
        console.log("\n--------------------------------------------");
        console.log(`Request ${index + 1}`);
        console.log(`Request ID: ${request.requestId}`);
        console.log(`Requester: ${request.requester.getFullName()}`);
        console.log(`Title: ${request.title}`);
        console.log(`Category: ${request.category}`);
        console.log(`Priority: ${request.priority}`);
        console.log(`Status: ${request.status}`);
        console.log("--------------------------------------------");
    });
}


// ==========================================
// UPDATE MY REQUEST
// ==========================================

function updateMyRequest() {
    console.log("\n--- Update My Request ---");

    try {
        const requestId = readline.question("Enter Request ID: ");
        const userId = readline.question("Enter Your User ID: ");

        const request = manager.findRequestById(requestId);

        if (!request) {
            console.log("Request not found.");
            return;
        }

        console.log("\nLeave a field blank if you do not want to change it.");

        const title = readline.question(
            `New Title [${request.title}]: `
        );

        const description = readline.question(
            `New Description [${request.description}]: `
        );

        const campusLocation = readline.question(
            `New Campus Location [${request.campusLocation}]: `
        );

        console.log("\nCategories:");

        ServiceRequest.CATEGORIES.forEach((category, index) => {
            console.log(`${index + 1}. ${category}`);
        });

        const categoryInput = readline.question(
            `New Category [${request.category}]: `
        );

        console.log("\nPriorities:");

        ServiceRequest.PRIORITIES.forEach((priority, index) => {
            console.log(`${index + 1}. ${priority}`);
        });

        const priorityInput = readline.question(
            `New Priority [${request.priority}]: `
        );

        const changes = {};

        if (title.trim() !== "") {
            changes.title = title;
        }

        if (description.trim() !== "") {
            changes.description = description;
        }

        if (campusLocation.trim() !== "") {
            changes.campusLocation = campusLocation;
        }

        if (categoryInput.trim() !== "") {
            const categoryChoice = Number(categoryInput);

            if (
                categoryChoice < 1 ||
                categoryChoice > ServiceRequest.CATEGORIES.length
            ) {
                console.log("Invalid category selection.");
                return;
            }

            changes.category =
                ServiceRequest.CATEGORIES[categoryChoice - 1];
        }

        if (priorityInput.trim() !== "") {
            const priorityChoice = Number(priorityInput);

            if (
                priorityChoice < 1 ||
                priorityChoice > ServiceRequest.PRIORITIES.length
            ) {
                console.log("Invalid priority selection.");
                return;
            }

            changes.priority =
                ServiceRequest.PRIORITIES[priorityChoice - 1];
        }

        if (Object.keys(changes).length === 0) {
            console.log("No changes were entered.");
            return;
        }

        manager.updateRequest(
            requestId,
            userId,
            changes
        );

        console.log("\nRequest updated successfully.");

    } catch (error) {
        console.log(`\nError: ${error.message}`);
    }
}


// ==========================================
// CANCEL MY REQUEST
// ==========================================

function cancelMyRequest() {
    console.log("\n--- Cancel My Request ---");

    try {
        const requestId = readline.question("Enter Request ID: ");
        const userId = readline.question("Enter Your User ID: ");

        manager.cancelRequest(requestId, userId);

        console.log("\nRequest cancelled successfully.");

    } catch (error) {
        console.log(`\nError: ${error.message}`);
    }
}


// ==========================================
// SEARCH REQUESTS
// ==========================================

function searchRequests() {
    console.log("\n--- Search Requests ---");

    const searchText = readline.question(
        "Enter search text: "
    );

    const results = manager.searchRequests(searchText);

    if (results.length === 0) {
        console.log("No matching requests found.");
        return;
    }

    console.log(`\nFound ${results.length} matching request(s):`);

    results.forEach(request => {
        console.log("\n--------------------------------------------");
        console.log(`Request ID: ${request.requestId}`);
        console.log(`Requester: ${request.requester.getFullName()}`);
        console.log(`Title: ${request.title}`);
        console.log(`Category: ${request.category}`);
        console.log(`Priority: ${request.priority}`);
        console.log(`Status: ${request.status}`);
        console.log("--------------------------------------------");
    });
}


// ==========================================
// REQUEST SUMMARY
// ==========================================

function viewRequestSummary() {
    console.log("\n--- Request Summary ---");

    const summary = manager.getRequestSummaryByStatus();

    const total =
        summary.Submitted +
        summary.Cancelled;

    console.log(`Submitted Requests: ${summary.Submitted}`);
    console.log(`Cancelled Requests: ${summary.Cancelled}`);
    console.log(`Total Requests: ${total}`);
}


// ==========================================
// MAIN APPLICATION
// ==========================================

function runApplication() {
    console.log("\n============================================");
    console.log("       CAMPUS SERVICE REQUEST SYSTEM");
    console.log("============================================");
    console.log("Welcome!");

    let running = true;

    while (running) {
        displayMenu();

        const choice = readline.question(
            "Select an option: "
        );

        switch (choice) {
            case "1":
                registerUser();
                break;

            case "2":
                submitServiceRequest();
                break;

            case "3":
                viewRequestById();
                break;

            case "4":
                viewMyRequests();
                break;

            case "5":
                viewAllRequests();
                break;

            case "6":
                updateMyRequest();
                break;

            case "7":
                cancelMyRequest();
                break;

            case "8":
                searchRequests();
                break;

            case "9":
                viewRequestSummary();
                break;

            case "10":
                running = false;
                console.log("\nThank you for using the Campus Service Request System.");
                break;

            default:
                console.log(
                    "\nInvalid option. Please select 1-10."
                );
        }
    }
}


// Start application
runApplication();