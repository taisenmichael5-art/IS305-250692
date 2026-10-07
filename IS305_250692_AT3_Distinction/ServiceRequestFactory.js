const { requestFromJSON } = require('./SpecialisedRequests');
class ServiceRequestFactory {
  static createFromData(savedData, users, history = savedData.history) {
    return requestFromJSON({ ...savedData, className: savedData.requestType || savedData.className,
      technicianId: savedData.assignedTechnicianId !== undefined ? savedData.assignedTechnicianId : savedData.technicianId, history }, users);
  }
}
module.exports = ServiceRequestFactory;
