const User = require('./User');
const V = require('./validation');
const { CATEGORIES, PRIORITIES, STATUSES } = require('./constants');
class ServiceRequest {
  #requestId; #requester; #title; #description; #campusLocation; #category;
  #priority; #status = 'Submitted'; #dateSubmitted; #dateUpdated;
  #assignedTechnician = null; #history = [];
  constructor({ requestId, requester, title, description, campusLocation, category, priority = 'Normal' }) {
    this.#requestId = V.id(requestId, 'Request ID');
    if (!(requester instanceof User) || !['Student', 'Staff'].includes(requester.userType)) throw new Error('A Student or Staff requester object is required.');
    this.#requester = requester;
    this.#title = V.text(title, 'Title', 200); this.#description = V.text(description, 'Description');
    this.#campusLocation = V.text(campusLocation, 'Campus location', 200);
    this.#category = V.choice(category, CATEGORIES, 'Category'); this.#priority = V.choice(priority, PRIORITIES, 'Priority');
    this.#dateSubmitted = new Date().toISOString(); this.#dateUpdated = this.#dateSubmitted;
    this.#record(null, 'Submitted', 'Submitted', requester, 'Request submitted.');
    this.validate();
  }
  get requestId() { return this.#requestId; } get requester() { return this.#requester; }
  get title() { return this.#title; } get description() { return this.#description; }
  get campusLocation() { return this.#campusLocation; } get category() { return this.#category; }
  get priority() { return this.#priority; } get status() { return this.#status; }
  get dateSubmitted() { return this.#dateSubmitted; } get dateUpdated() { return this.#dateUpdated; }
  get assignedTechnician() { return this.#assignedTechnician; }
  validate() {
    V.id(this.#requestId); V.text(this.#title, 'Title', 200); V.text(this.#description, 'Description');
    V.text(this.#campusLocation, 'Campus location', 200); V.choice(this.#category, CATEGORIES, 'Category');
    V.choice(this.#priority, PRIORITIES, 'Priority'); V.choice(this.#status, STATUSES, 'Status'); return true;
  }
  #record(previousStatus, newStatus, action, actor, comment) {
    this.#dateUpdated = new Date().toISOString();
    this.#history.push(Object.freeze({ previousStatus, newStatus, action, actorId: actor.userId, actorRole: actor.userType, comment, timestamp: this.#dateUpdated }));
  }
  #role(actor, role) { if (!(actor instanceof User) || actor.userType !== role) throw new Error(`Only a ${role} may perform this action.`); }
  #owner(actor) { if (actor !== this.#requester) throw new Error('Only the original requester may update or cancel this request.'); }
  #expect(status) { if (this.#status !== status) throw new Error(`Invalid status transition: expected ${status}, found ${this.#status}.`); }
  #technician(actor) { this.#role(actor, 'Technician'); if (actor !== this.#assignedTechnician) throw new Error('Only the assigned Technician may perform this action.'); }
  #move(next, action, actor, comment) {
    const note = V.text(comment, 'Action comment'); const previous = this.#status;
    this.#status = next; this.#record(previous, next, action, actor, note); return this;
  }
  updateDetails(changes, actor = this.#requester) {
    this.#owner(actor); this.#expect('Submitted'); V.fields(changes, ['title', 'description', 'campusLocation', 'priority']);
    const title = changes.title === undefined ? this.#title : V.text(changes.title, 'Title', 200);
    const description = changes.description === undefined ? this.#description : V.text(changes.description, 'Description');
    const location = changes.campusLocation === undefined ? this.#campusLocation : V.text(changes.campusLocation, 'Campus location', 200);
    const priority = changes.priority === undefined ? this.#priority : V.choice(changes.priority, PRIORITIES, 'Priority');
    this.#title = title; this.#description = description; this.#campusLocation = location; this.#priority = priority;
    this.#record(this.#status, this.#status, 'Details Updated', actor, `Updated fields: ${Object.keys(changes).join(', ')}.`); return this;
  }
  cancelRequest(actor = this.#requester, comment = 'Cancelled by requester.') { this.#owner(actor); this.#expect('Submitted'); return this.#move('Cancelled', 'Cancelled', actor, comment); }
  review(actor, comment) { this.#role(actor, 'Service Officer'); this.#expect('Submitted'); return this.#move('Reviewed', 'Reviewed', actor, comment); }
  setPriority(priority, actor, comment = 'Priority reviewed by Service Officer.') {
    this.#role(actor, 'Service Officer'); this.#expect('Reviewed'); const value = V.choice(priority, PRIORITIES, 'Priority'); const note = V.text(comment, 'Priority comment');
    const old = this.#priority; this.#priority = value; this.#record(this.#status, this.#status, 'Priority Set', actor, `${old} → ${value}. ${note}`); return this;
  }
  assignTechnician(technician, actor, comment = 'Technician assigned.') {
    this.#role(actor, 'Service Officer'); this.#expect('Reviewed');
    if (!(technician instanceof User) || technician.userType !== 'Technician') throw new Error('Select a valid Technician object.');
    const note = V.text(comment, 'Assignment comment'); this.#assignedTechnician = technician;
    return this.#move('Assigned', 'Assigned', actor, `${technician.userId}. ${note}`);
  }
  startWork(actor, comment = 'Work started.') { this.#technician(actor); this.#expect('Assigned'); return this.#move('In Progress', 'Work Started', actor, comment); }
  addProgressNote(actor, comment) { this.#technician(actor); this.#expect('In Progress'); const note = V.text(comment, 'Progress note'); this.#record(this.#status, this.#status, 'Progress Note', actor, note); return this; }
  resolve(actor, comment) { this.#technician(actor); this.#expect('In Progress'); return this.#move('Resolved', 'Resolved', actor, comment); }
  close(actor, comment) { this.#role(actor, 'Service Officer'); this.#expect('Resolved'); return this.#move('Closed', 'Verified and Closed', actor, comment); }
  getHistory() { return this.#history.map(item => ({ ...item })); }
  calculatePriorityScore() { return { Low: 10, Normal: 30, High: 60, Urgent: 90 }[this.#priority]; }
  getTargetResolutionHours() { return { Low: 120, Normal: 72, High: 24, Urgent: 8 }[this.#priority]; }
  getRequestSummary() {
    return { requestId: this.requestId, requester: this.requester.getFullName(), requesterId: this.requester.userId,
      title: this.title, category: this.category, priority: this.priority, status: this.status,
      campusLocation: this.campusLocation, technicianId: this.assignedTechnician?.userId || 'Unassigned',
      dateSubmitted: this.dateSubmitted, score: this.calculatePriorityScore(), targetHours: this.getTargetResolutionHours() };
  }
  toJSON() {
    return { className: 'ServiceRequest', requestId: this.requestId, requesterId: this.requester.userId,
      title: this.title, description: this.description, campusLocation: this.campusLocation, category: this.category,
      priority: this.priority, status: this.status, dateSubmitted: this.dateSubmitted, dateUpdated: this.dateUpdated,
      technicianId: this.assignedTechnician?.userId || null, history: this.getHistory() };
  }
  restoreState(data, users) {
    // Restore only a fresh factory-created object. Used by the JSON hydration boundary.
    if (this.#history.length !== 1 || this.#status !== 'Submitted') throw new Error('State restoration requires a fresh request.');
    const status = V.choice(data.status, STATUSES, 'Saved status');
    const submitted = V.iso(data.dateSubmitted, 'Submission date'); const updated = V.iso(data.dateUpdated, 'Update date');
    if (updated < submitted) throw new Error('Saved update time precedes submission.');
    const technician = data.technicianId === null ? null : users.find(u => u.userId === data.technicianId);
    if (data.technicianId !== null && (!technician || technician.userType !== 'Technician')) throw new Error('Saved technician is invalid.');
    if (['Assigned', 'In Progress', 'Resolved', 'Closed'].includes(status) !== Boolean(technician)) throw new Error('Saved status and assignment are inconsistent.');
    if (!Array.isArray(data.history) || !data.history.length) throw new Error('Saved history must be a non-empty array.');
    const history = data.history.map(item => {
      const actor = users.find(user => user.userId === item.actorId);
      if (!actor || actor.userType !== item.actorRole) throw new Error('Unknown audit actor or mismatched role.');
      if (item.previousStatus !== null) V.choice(item.previousStatus, STATUSES, 'Previous status');
      V.choice(item.newStatus, STATUSES, 'History status'); V.text(item.action, 'History action'); V.text(item.comment, 'History comment'); V.iso(item.timestamp, 'History timestamp');
      return Object.freeze({ previousStatus: item.previousStatus, newStatus: item.newStatus, action: item.action, actorId: item.actorId, actorRole: item.actorRole, comment: item.comment, timestamp: item.timestamp });
    });
    if (history[0].previousStatus !== null || history[0].newStatus !== 'Submitted' || history[0].action !== 'Submitted' || history[0].actorId !== this.requester.userId) throw new Error('Invalid initial history entry.');
    let lastStatus = 'Submitted', lastTime = submitted;
    const next = { Submitted: ['Reviewed', 'Cancelled'], Reviewed: ['Assigned'], Assigned: ['In Progress'], 'In Progress': ['Resolved'], Resolved: ['Closed'], Closed: [], Cancelled: [] };
    for (const [i, item] of history.entries()) {
      if (item.timestamp < lastTime || item.timestamp > updated) throw new Error('History times are inconsistent.');
      if (i > 0) {
        if (item.previousStatus !== lastStatus) throw new Error('History status chain is broken.');
        if (item.newStatus !== lastStatus && !next[lastStatus].includes(item.newStatus)) throw new Error('Invalid saved status transition.');
        const officer = ['Reviewed', 'Priority Set', 'Assigned', 'Verified and Closed'].includes(item.action);
        const worker = ['Work Started', 'Progress Note', 'Resolved'].includes(item.action);
        const owner = ['Details Updated', 'Cancelled'].includes(item.action);
        if (officer && item.actorRole !== 'Service Officer') throw new Error('Saved workflow actor must be a Service Officer.');
        if (worker && (item.actorRole !== 'Technician' || item.actorId !== technician?.userId)) throw new Error('Saved workflow actor must be the assigned Technician.');
        if (owner && item.actorId !== this.requester.userId) throw new Error('Saved update/cancellation actor must be the requester.');
        const expected = { 'Details Updated': ['Submitted', 'Submitted'], Cancelled: ['Submitted', 'Cancelled'], Reviewed: ['Submitted', 'Reviewed'],
          'Priority Set': ['Reviewed', 'Reviewed'], Assigned: ['Reviewed', 'Assigned'], 'Work Started': ['Assigned', 'In Progress'],
          'Progress Note': ['In Progress', 'In Progress'], Resolved: ['In Progress', 'Resolved'], 'Verified and Closed': ['Resolved', 'Closed'] }[item.action];
        if (!expected || expected[0] !== item.previousStatus || expected[1] !== item.newStatus) throw new Error('Saved audit action is inconsistent with the status flow.');

      }
      lastStatus = item.newStatus; lastTime = item.timestamp;
    }
    if (lastStatus !== status || lastTime !== updated) throw new Error('Saved status does not match the latest history.');
    this.#status = status; this.#assignedTechnician = technician; this.#dateSubmitted = submitted; this.#dateUpdated = updated; this.#history = history;
  }
}
module.exports = ServiceRequest;
