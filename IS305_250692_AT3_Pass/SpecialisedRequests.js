const ServiceRequest = require('./ServiceRequest');
const V = require('./validation');
class ICTSupportRequest extends ServiceRequest {
  #details;
  constructor(commonRequestData, specialisedData) {
    super(commonRequestData);
    if (this.category !== 'ICT Support') throw new Error('ICTSupportRequest requires ICT Support category.');
    this.#details = this.validateSpecialisedFields(specialisedData);
  }
  validateSpecialisedFields(data = this.#details) {
    if (!data || typeof data !== 'object') throw new Error('ICT details are required.');
    return Object.freeze({ deviceType: V.text(data.deviceType, 'Device type', 100), systemName: V.text(data.systemName, 'System name', 100),
      faultType: V.text(data.faultType, 'Fault type', 200), networkImpact: V.choice(data.networkImpact, ['None', 'Single User', 'Multiple Users', 'Campus Wide'], 'Network impact') });
  }
  get specialisedDetails() { return { ...this.#details }; }
  calculatePriorityScore() { return super.calculatePriorityScore() + { None: 0, 'Single User': 5, 'Multiple Users': 15, 'Campus Wide': 30 }[this.#details.networkImpact]; }
  getTargetResolutionHours() { return Math.max(1, super.getTargetResolutionHours() * (this.#details.networkImpact === 'Campus Wide' ? .5 : 1)); }
  getRequestSummary() { return { ...super.getRequestSummary(), requestType: 'ICTSupportRequest', ...this.specialisedDetails }; }
  toJSON() { return { ...super.toJSON(), className: 'ICTSupportRequest', specialisedData: this.specialisedDetails }; }
}
class MaintenanceRequest extends ServiceRequest {
  #details;
  constructor(commonRequestData, specialisedData) {
    super(commonRequestData);
    if (this.category !== 'Facilities Maintenance') throw new Error('MaintenanceRequest requires Facilities Maintenance category.');
    this.#details = this.validateSpecialisedFields(specialisedData);
  }
  validateSpecialisedFields(data = this.#details) {
    if (!data || typeof data !== 'object') throw new Error('Maintenance details are required.');
    return Object.freeze({ building: V.text(data.building, 'Building', 100), roomNumber: V.text(data.roomNumber, 'Room number', 60),
      hazardLevel: V.choice(data.hazardLevel, ['Low', 'Medium', 'High'], 'Hazard level'), equipmentAffected: V.text(data.equipmentAffected, 'Equipment affected', 200) });
  }
  get specialisedDetails() { return { ...this.#details }; }
  calculatePriorityScore() { return super.calculatePriorityScore() + { Low: 0, Medium: 15, High: 30 }[this.#details.hazardLevel]; }
  getTargetResolutionHours() { return Math.max(1, super.getTargetResolutionHours() * (this.#details.hazardLevel === 'High' ? .5 : 1)); }
  getRequestSummary() { return { ...super.getRequestSummary(), requestType: 'MaintenanceRequest', ...this.specialisedDetails }; }
  toJSON() { return { ...super.toJSON(), className: 'MaintenanceRequest', specialisedData: this.specialisedDetails }; }
}
class CleaningRequest extends ServiceRequest {
  #details;
  constructor(commonRequestData, specialisedData) {
    super(commonRequestData);
    if (this.category !== 'Cleaning and Sanitation') throw new Error('CleaningRequest requires Cleaning and Sanitation category.');
    this.#details = this.validateSpecialisedFields(specialisedData);
  }
  validateSpecialisedFields(data = this.#details) {
    if (!data || typeof data !== 'object') throw new Error('Cleaning details are required.');
    return Object.freeze({ cleaningArea: V.text(data.cleaningArea, 'Cleaning area', 150), hygieneRisk: V.choice(data.hygieneRisk, ['Low', 'Medium', 'High'], 'Hygiene risk'),
      serviceType: V.text(data.serviceType, 'Service type', 100), preferredServiceTime: V.text(data.preferredServiceTime, 'Preferred service time', 100) });
  }
  get specialisedDetails() { return { ...this.#details }; }
  calculatePriorityScore() { return super.calculatePriorityScore() + { Low: 0, Medium: 10, High: 25 }[this.#details.hygieneRisk]; }
  getTargetResolutionHours() { return Math.max(1, super.getTargetResolutionHours() * (this.#details.hygieneRisk === 'High' ? .5 : 1)); }
  getRequestSummary() { return { ...super.getRequestSummary(), requestType: 'CleaningRequest', ...this.specialisedDetails }; }
  toJSON() { return { ...super.toJSON(), className: 'CleaningRequest', specialisedData: this.specialisedDetails }; }
}
function createRequest(common, specialised, level = 'distinction') {
  if (level === 'pass') return new ServiceRequest(common);
  switch (common.category) {
    case 'ICT Support': return new ICTSupportRequest(common, specialised);
    case 'Facilities Maintenance': return new MaintenanceRequest(common, specialised);
    case 'Cleaning and Sanitation': return new CleaningRequest(common, specialised);
    default: return new ServiceRequest(common);
  }
}
function requestFromJSON(data, users) {
  const requester = users.find(user => user.userId === data.requesterId);
  if (!requester) throw new Error('Saved request refers to an unknown requester.');
  const common = { ...data, requester };
  let request;
  switch (data.className) {
    case 'ServiceRequest': request = new ServiceRequest(common); break;
    case 'ICTSupportRequest': request = new ICTSupportRequest(common, data.specialisedData); break;
    case 'MaintenanceRequest': request = new MaintenanceRequest(common, data.specialisedData); break;
    case 'CleaningRequest': request = new CleaningRequest(common, data.specialisedData); break;
    default: throw new Error(`Unknown saved request class: ${data.className}.`);
  }
  request.restoreState(data, users); return request;
}
module.exports = { ICTSupportRequest, MaintenanceRequest, CleaningRequest, createRequest, requestFromJSON };
