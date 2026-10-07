const User = require('./User');
const ServiceRequest = require('./ServiceRequest');
const { LEVELS, CATEGORIES, PRIORITIES, STATUSES } = require('./constants');
const V = require('./validation');
const { ICTSupportRequest, MaintenanceRequest, CleaningRequest, requestFromJSON } = require('./SpecialisedRequests');
const { userFromJSON } = require('./UserRoles');
class ServiceRequestManager {
  #users = []; #requests = []; #level;
  constructor(level = 'distinction') { this.#level = V.choice(level, LEVELS, 'Achievement level'); }
  get level() { return this.#level; }
  getUsers() { return [...this.#users]; }
  registerUser(user) {
    if (!(user instanceof User)) throw new Error('Register a valid User object.'); user.validate();
    if (this.#level === 'pass' && !['Student', 'Staff'].includes(user.userType)) throw new Error('Pass mode registers only Student or Staff requesters.');
    if (this.findUserById(user.userId)) throw new Error('Duplicate user ID.');
    this.#users.push(user); return user;
  }
  findUserById(id) { return this.#users.find(user => user.userId.toLowerCase() === String(id).trim().toLowerCase()) || null; }
  #actor(id) { const user = this.findUserById(id); if (!user) throw new Error('Unknown acting user ID.'); return user; }
  #request(id) { const request = this.findRequestById(id); if (!request) throw new Error('Request ID not found.'); return request; }
  #advanced() { if (this.#level === 'pass') throw new Error('This action requires Credit or Distinction mode.'); }
  #specialisation(request) {
    if (this.#level === 'pass') return;
    const required = { 'ICT Support': ICTSupportRequest, 'Facilities Maintenance': MaintenanceRequest, 'Cleaning and Sanitation': CleaningRequest }[request.category];
    if (required && !(request instanceof required)) throw new Error('Credit/Distinction requires the correct specialised request class.');
  }
  submitRequest(request) {
    if (!(request instanceof ServiceRequest)) throw new Error('Submit a valid ServiceRequest object.');
    if (this.findRequestById(request.requestId)) throw new Error('Duplicate request ID.');
    if (!this.#users.includes(request.requester)) throw new Error('Register the original requester object before submission.');
    if (request.status !== 'Submitted') throw new Error('Only a new Submitted request may be submitted.');
    request.validate(); this.#specialisation(request); this.#requests.push(request); return request;
  }
  findRequestById(id) { return this.#requests.find(request => request.requestId.toLowerCase() === String(id).trim().toLowerCase()) || null; }
  getRequestsByUser(id) { const user = this.#actor(id); return this.#requests.filter(request => request.requester === user); }
  getAllRequests() { return [...this.#requests]; }
  updateRequest(id, actorId, changes) { return this.#request(id).updateDetails(changes, this.#actor(actorId)); }
  cancelRequest(id, actorId, comment) { return this.#request(id).cancelRequest(this.#actor(actorId), comment); }
  reviewRequest(id, actorId, comment) { this.#advanced(); return this.#request(id).review(this.#actor(actorId), comment); }
  setRequestPriority(id, actorId, priority, comment) { this.#advanced(); return this.#request(id).setPriority(priority, this.#actor(actorId), comment); }
  assignTechnician(id, actorId, technicianId, comment) { this.#advanced(); return this.#request(id).assignTechnician(this.#actor(technicianId), this.#actor(actorId), comment); }
  startWork(id, actorId, comment) { this.#advanced(); return this.#request(id).startWork(this.#actor(actorId), comment); }
  addProgressNote(id, actorId, comment) { this.#advanced(); return this.#request(id).addProgressNote(this.#actor(actorId), comment); }
  resolveRequest(id, actorId, comment) { this.#advanced(); return this.#request(id).resolve(this.#actor(actorId), comment); }
  closeRequest(id, actorId, comment) { this.#advanced(); return this.#request(id).close(this.#actor(actorId), comment); }
  getVisibleRequests(actorId) {
    const user = this.#actor(actorId);
    if (['Service Officer', 'System Administrator'].includes(user.userType)) return this.getAllRequests();
    if (user.userType === 'Technician') return this.#requests.filter(request => request.assignedTechnician === user);
    return this.getRequestsByUser(user.userId);
  }
  viewRequest(id, actorId) {
    const request = this.#request(id);
    if (!this.getVisibleRequests(actorId).includes(request)) throw new Error('You do not have permission to view this request.');
    return request;
  }
  searchRequests(query, requests = this.#requests) {
    const search = V.text(query, 'Search text', 200).toLowerCase();
    return requests.filter(request => request.requestId.toLowerCase().includes(search) || request.title.toLowerCase().includes(search));
  }
  filterRequests({ category, status, priority, technicianId } = {}, requests = this.#requests) {
    if (category) V.choice(category, CATEGORIES, 'Category'); if (status) V.choice(status, STATUSES, 'Status'); if (priority) V.choice(priority, PRIORITIES, 'Priority');
    if (technicianId && this.#actor(technicianId).userType !== 'Technician') throw new Error('Filter ID must identify a Technician.');
    return requests.filter(request => (!category || request.category === category) && (!status || request.status === status) && (!priority || request.priority === priority) && (!technicianId || request.assignedTechnician === this.findUserById(technicianId)));
  }
  sortRequests(by = 'date', direction = 'asc', requests = this.#requests) {
    V.choice(by, ['date', 'priority'], 'Sort field'); V.choice(direction, ['asc', 'desc'], 'Sort direction');
    const sign = direction === 'asc' ? 1 : -1;
    return [...requests].sort((a, b) => sign * (by === 'date' ? a.dateSubmitted.localeCompare(b.dateSubmitted) : (PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) || a.calculatePriorityScore() - b.calculatePriorityScore())) || a.requestId.localeCompare(b.requestId));
  }
  getRequestSummaryByStatus(requests = this.#requests) { return Object.fromEntries((this.#level === 'pass' ? ['Submitted', 'Cancelled'] : STATUSES).map(status => [status, requests.filter(r => r.status === status).length])); }
  getAuditHistory(actorId) {
    if (this.#actor(actorId).userType !== 'System Administrator') throw new Error('Only a System Administrator may review the complete audit history.');
    return this.#requests.flatMap(request => request.getHistory().map(item => ({ requestId: request.requestId, ...item }))).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
  getManagementData(actorId) {
    if (!['Service Officer', 'System Administrator'].includes(this.#actor(actorId).userType)) throw new Error('Management reports require Service Officer or System Administrator role.');
    return this.getAllRequests();
  }
  toJSON() { return { schemaVersion: 1, savedAt: new Date().toISOString(), users: this.#users.map(user => user.toJSON()), requests: this.#requests.map(request => request.toJSON()) }; }
  static fromJSON(data) {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.users) || !Array.isArray(data.requests)) throw new Error('Invalid JSON store schema or version.');
    V.iso(data.savedAt, 'Save timestamp');
    const manager = new ServiceRequestManager('distinction');
    for (const item of data.users) manager.registerUser(userFromJSON(item));
    for (const item of data.requests) {
      const request = requestFromJSON(item, manager.#users); manager.#specialisation(request);
      if (manager.findRequestById(request.requestId)) throw new Error('Duplicate saved request ID.');
      manager.#requests.push(request);
    }
    return manager;
  }
}
module.exports = ServiceRequestManager;
