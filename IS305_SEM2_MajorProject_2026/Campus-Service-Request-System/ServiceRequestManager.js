const User = require("./User");
const ServiceRequest = require("./ServiceRequest");

class ServiceRequestManager {
    #users;
    #requests;

    constructor() {
        this.#users = [];
        this.#requests = [];
    }

    // ==========================================
    // USER MANAGEMENT
    // ==========================================

    registerUser(user) {
        if (!(user instanceof User)) {
            throw new Error("Only valid User objects can be registered.");
        }

        if (!user.validate()) {
            throw new Error("Cannot register an invalid user.");
        }

        if (this.findUserById(user.userId)) {
            throw new Error(`User ID ${user.userId} already exists.`);
        }

        this.#users.push(user);

        return true;
    }

    findUserById(userId) {
        return this.#users.find(
            user => user.userId === String(userId).trim()
        ) || null;
    }

    // ==========================================
    // SERVICE REQUEST MANAGEMENT
    // ==========================================

    submitRequest(request) {
        if (!(request instanceof ServiceRequest)) {
            throw new Error("Only valid ServiceRequest objects can be submitted.");
        }

        if (!request.validate()) {
            throw new Error("Cannot submit an invalid service request.");
        }

        if (this.findRequestById(request.requestId)) {
            throw new Error(`Request ID ${request.requestId} already exists.`);
        }

        // Make sure the requester is registered
        if (!this.findUserById(request.requester.userId)) {
            throw new Error(
                "The requester must be registered before submitting a request."
            );
        }

        this.#requests.push(request);

        return true;
    }

    findRequestById(requestId) {
        return this.#requests.find(
            request => request.requestId === String(requestId).trim()
        ) || null;
    }

    // ==========================================
    // REQUEST VIEWING
    // ==========================================

    getRequestsByUser(userId) {
        return this.#requests.filter(
            request => request.requester.userId === String(userId).trim()
        );
    }

    getAllRequests() {
        return [...this.#requests];
    }

    // ==========================================
    // REQUEST UPDATES
    // ==========================================

    updateRequest(requestId, userId, changes) {
        const request = this.findRequestById(requestId);

        if (!request) {
            throw new Error(`Request ${requestId} was not found.`);
        }

        // Only the requester can update their request
        if (request.requester.userId !== String(userId).trim()) {
            throw new Error(
                "You are not authorised to update another user's request."
            );
        }

        if (request.status === "Cancelled") {
            throw new Error("Cancelled requests cannot be updated.");
        }

        request.updateDetails(changes);

        return true;
    }

    // ==========================================
    // REQUEST CANCELLATION
    // ==========================================

    cancelRequest(requestId, userId) {
        const request = this.findRequestById(requestId);

        if (!request) {
            throw new Error(`Request ${requestId} was not found.`);
        }

        // Only the requester can cancel their request
        if (request.requester.userId !== String(userId).trim()) {
            throw new Error(
                "You are not authorised to cancel another user's request."
            );
        }

        if (request.status === "Cancelled") {
            throw new Error("Request is already Cancelled.");
        }

        request.cancelRequest();

        return true;
    }

    // ==========================================
    // SEARCH
    // ==========================================

    searchRequests(searchText) {
        if (!searchText || String(searchText).trim() === "") {
            return [];
        }

        const search = String(searchText).trim().toLowerCase();

        return this.#requests.filter(request => {
            return (
                request.requestId.toLowerCase().includes(search) ||
                request.title.toLowerCase().includes(search) ||
                request.description.toLowerCase().includes(search) ||
                request.campusLocation.toLowerCase().includes(search) ||
                request.category.toLowerCase().includes(search) ||
                request.priority.toLowerCase().includes(search) ||
                request.status.toLowerCase().includes(search) ||
                request.requester.getFullName().toLowerCase().includes(search)
            );
        });
    }

    // ==========================================
    // REQUEST SUMMARY BY STATUS
    // ==========================================

    getRequestSummaryByStatus() {
        const summary = {
            Submitted: 0,
            Cancelled: 0
        };

        for (const request of this.#requests) {
            if (summary[request.status] !== undefined) {
                summary[request.status]++;
            }
        }

        return summary;
    }
}

module.exports = ServiceRequestManager;