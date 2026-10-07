const User = require("./User");

class ServiceRequest {
    #requestId;
    #requester;
    #title;
    #description;
    #campusLocation;
    #category;
    #priority;
    #status;
    #dateSubmitted;
    #dateUpdated;

    static CATEGORIES = [
        "ICT Support",
        "Facilities Maintenance",
        "Cleaning and Sanitation",
        "General Campus Service"
    ];

    static PRIORITIES = [
        "Low",
        "Normal",
        "High",
        "Urgent"
    ];

    static STATUSES = [
        "Submitted",
        "Cancelled"
    ];

    constructor(
        requestId,
        requester,
        title,
        description,
        campusLocation,
        category,
        priority
    ) {
        this.requestId = requestId;
        this.requester = requester;
        this.title = title;
        this.description = description;
        this.campusLocation = campusLocation;
        this.category = category;
        this.priority = priority;

        // Default status required by Pass
        this.#status = "Submitted";

        // Record creation date
        this.#dateSubmitted = new Date();
        this.#dateUpdated = new Date();
    }

    // Request ID
    get requestId() {
        return this.#requestId;
    }

    set requestId(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Request ID is required.");
        }

        this.#requestId = String(value).trim();
    }

    // Requester
    get requester() {
        return this.#requester;
    }

    set requester(value) {
        if (!(value instanceof User)) {
            throw new Error("Requester must be a valid User object.");
        }

        this.#requester = value;
    }

    // Title
    get title() {
        return this.#title;
    }

    set title(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Request title is required.");
        }

        this.#title = String(value).trim();
    }

    // Description
    get description() {
        return this.#description;
    }

    set description(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Request description is required.");
        }

        this.#description = String(value).trim();
    }

    // Campus location
    get campusLocation() {
        return this.#campusLocation;
    }

    set campusLocation(value) {
        if (!value || String(value).trim() === "") {
            throw new Error("Campus location is required.");
        }

        this.#campusLocation = String(value).trim();
    }

    // Category
    get category() {
        return this.#category;
    }

    set category(value) {
        if (!ServiceRequest.CATEGORIES.includes(value)) {
            throw new Error(
                `Unsupported category. Choose one of: ${ServiceRequest.CATEGORIES.join(", ")}`
            );
        }

        this.#category = value;
    }

    // Priority
    get priority() {
        return this.#priority;
    }

    set priority(value) {
        if (!ServiceRequest.PRIORITIES.includes(value)) {
            throw new Error(
                `Unsupported priority. Choose one of: ${ServiceRequest.PRIORITIES.join(", ")}`
            );
        }

        this.#priority = value;
    }

    // Status
    get status() {
        return this.#status;
    }

    // Date submitted
    get dateSubmitted() {
        return this.#dateSubmitted;
    }

    // Date updated
    get dateUpdated() {
        return this.#dateUpdated;
    }

    // Validate complete request
    validate() {
        if (!this.#requestId) {
            return false;
        }

        if (!(this.#requester instanceof User)) {
            return false;
        }

        if (!this.#title) {
            return false;
        }

        if (!this.#description) {
            return false;
        }

        if (!this.#campusLocation) {
            return false;
        }

        if (!ServiceRequest.CATEGORIES.includes(this.#category)) {
            return false;
        }

        if (!ServiceRequest.PRIORITIES.includes(this.#priority)) {
            return false;
        }

        if (!ServiceRequest.STATUSES.includes(this.#status)) {
            return false;
        }

        return true;
    }

    // Update request details
    updateDetails(changes = {}) {
        if (this.#status === "Cancelled") {
            throw new Error("Cancelled requests cannot be updated.");
        }

        if (changes.title !== undefined) {
            this.title = changes.title;
        }

        if (changes.description !== undefined) {
            this.description = changes.description;
        }

        if (changes.campusLocation !== undefined) {
            this.campusLocation = changes.campusLocation;
        }

        if (changes.category !== undefined) {
            this.category = changes.category;
        }

        if (changes.priority !== undefined) {
            this.priority = changes.priority;
        }

        this.#dateUpdated = new Date();
    }

    // Cancel request
    cancelRequest() {
        if (this.#status === "Cancelled") {
            throw new Error("Request is already Cancelled.");
        }

        this.#status = "Cancelled";
        this.#dateUpdated = new Date();
    }

    // Request summary
    getRequestSummary() {
        return `
Request ID: ${this.#requestId}
Requester: ${this.#requester.getFullName()}
Title: ${this.#title}
Description: ${this.#description}
Campus Location: ${this.#campusLocation}
Category: ${this.#category}
Priority: ${this.#priority}
Status: ${this.#status}
Date Submitted: ${this.#dateSubmitted.toLocaleString()}
Date Updated: ${this.#dateUpdated.toLocaleString()}
        `.trim();
    }
}

module.exports = ServiceRequest;