const test = require('node:test'); const assert = require('node:assert/strict');
const User = require('../User'); const Request = require('../ServiceRequest');
const { StudentRequester, StaffRequester, ServiceOfficer, Technician } = require('../UserRoles');
const { ICTSupportRequest, MaintenanceRequest, CleaningRequest } = require('../SpecialisedRequests');
const { fixture, assign, finish } = require('./helpers');
test('Credit: all required user subclasses chain to User and expose specialised fields', () => {
  const m = fixture('credit'); for (const u of m.getUsers()) assert.ok(u instanceof User);
  assert.ok(m.findUserById('250692') instanceof StudentRequester); assert.ok(m.findUserById('STF001') instanceof StaffRequester);
  assert.ok(m.findUserById('OFF001') instanceof ServiceOfficer); assert.ok(m.findUserById('TECH001') instanceof Technician);
  assert.equal(m.findUserById('250692').yearLevel, 3);
});
test('Credit: invalid specialised user data rejected', () => {
  assert.throws(() => new StudentRequester('X', 'A', 'B', 'a@example.test', '', 3));
  assert.throws(() => new StudentRequester('X', 'A', 'B', 'a@example.test', 'BIS', 0));
  assert.throws(() => new Technician('X', 'A', 'B', 'a@example.test', ''));
});
test('Credit: all three specialised requests extend base and use distinct behaviour', () => {
  const m = fixture('credit');
  assert.ok(m.findRequestById('REQ001') instanceof ICTSupportRequest); assert.ok(m.findRequestById('REQ002') instanceof MaintenanceRequest); assert.ok(m.findRequestById('REQ003') instanceof CleaningRequest);
  for (const r of m.getAllRequests()) { assert.ok(r instanceof Request); assert.equal(typeof r.calculatePriorityScore(), 'number'); }
  assert.equal(m.findRequestById('REQ001').getRequestSummary().systemName, 'Windows workstation');
  assert.equal(m.findRequestById('REQ003').getTargetResolutionHours(), 12);
});
test('Credit: specialised data validation and class/category mismatch rejected', () => {
  const m = fixture(); const common = { requestId: 'NEW', requester: m.findUserById('250692'), title: 'Test', description: 'Test issue', campusLocation: 'Lab', category: 'ICT Support' };
  assert.throws(() => new ICTSupportRequest(common, { deviceType: '', systemName: 'Windows', faultType: 'None', networkImpact: 'None' }));
  assert.throws(() => new ICTSupportRequest(common, { deviceType: 'PC', systemName: 'Windows', faultType: 'None', networkImpact: 'Unsupported' }));
  assert.throws(() => m.submitRequest(new Request(common)), /specialised/);
});
test('Credit: full permitted lifecycle with all request-history fields', () => {
  const m = fixture('credit'); const r = finish(m); assert.equal(r.status, 'Closed');
  assert.equal(r.getHistory().length, 8);
  for (const h of r.getHistory()) for (const key of ['previousStatus', 'newStatus', 'action', 'actorId', 'actorRole', 'comment', 'timestamp']) assert.ok(Object.hasOwn(h, key));
  assert.equal(r.getHistory().at(-1).action, 'Verified and Closed');
});
test('Credit: only Service Officer reviews, sets priority, assigns or closes', () => {
  const m = fixture(); assert.throws(() => m.reviewRequest('REQ001', '250692', 'Review'), /Service Officer/);
  m.reviewRequest('REQ001', 'OFF001', 'Review'); assert.throws(() => m.setRequestPriority('REQ001', '250692', 'Urgent'), /Service Officer/);
  assert.throws(() => m.assignTechnician('REQ001', 'TECH001', 'TECH002'), /Service Officer/);
  m.assignTechnician('REQ001', 'OFF001', 'TECH001'); m.startWork('REQ001', 'TECH001'); m.resolveRequest('REQ001', 'TECH001', 'Fixed');
  assert.throws(() => m.closeRequest('REQ001', 'TECH001', 'Close'), /Service Officer/); assert.equal(m.findRequestById('REQ001').status, 'Resolved');
});
test('Credit: only assigned Technician starts, notes and resolves', () => {
  const m = fixture(); const r = assign(m); const before = r.getHistory();
  assert.throws(() => m.startWork('REQ001', 'TECH002'), /assigned/); assert.deepEqual(r.getHistory(), before);
  m.startWork('REQ001', 'TECH001'); assert.throws(() => m.addProgressNote('REQ001', 'TECH002', 'Wrong'), /assigned/);
  assert.throws(() => m.resolveRequest('REQ001', 'TECH002', 'Wrong'), /assigned/); assert.equal(r.status, 'In Progress');
});
test('Credit: invalid transitions cannot skip workflow stages', () => {
  const m = fixture(); assert.throws(() => m.assignTechnician('REQ001', 'OFF001', 'TECH001'), /expected Reviewed/);
  assert.throws(() => m.closeRequest('REQ001', 'OFF001', 'Close'), /expected Resolved/);
  assign(m); assert.throws(() => m.resolveRequest('REQ001', 'TECH001', 'Done'), /expected In Progress/);
});
test('Credit: requester cannot update/cancel after review; cancellation is final', () => {
  const m = fixture(); m.reviewRequest('REQ001', 'OFF001', 'Reviewed');
  assert.throws(() => m.updateRequest('REQ001', '250692', { title: 'Change' }), /expected Submitted/);
  assert.throws(() => m.cancelRequest('REQ001', '250692'), /expected Submitted/);
  m.cancelRequest('REQ004', '250692'); assert.throws(() => m.reviewRequest('REQ004', 'OFF001', 'Reopen'), /Submitted/);
});
test('Credit: failed assignment and empty action comments do not change state', () => {
  const m = fixture(); m.reviewRequest('REQ001', 'OFF001', 'Review'); const r = m.findRequestById('REQ001'); const history = r.getHistory();
  assert.throws(() => m.assignTechnician('REQ001', 'OFF001', '250692')); assert.throws(() => m.assignTechnician('REQ001', 'OFF001', 'TECH001', ''));
  assert.equal(r.assignedTechnician, null); assert.equal(r.status, 'Reviewed'); assert.deepEqual(r.getHistory(), history);
});
test('Credit: search/filter/sort support category, status, priority and technician', () => {
  const m = fixture(); assign(m);
  assert.equal(m.filterRequests({ category: 'ICT Support' }).length, 1); assert.equal(m.filterRequests({ status: 'Assigned' }).length, 1);
  assert.equal(m.filterRequests({ priority: 'High' }).length, 2); assert.equal(m.filterRequests({ technicianId: 'TECH001' }).length, 1);
  assert.equal(m.sortRequests('priority', 'asc')[0].priority, 'Low');
  assert.equal(m.getVisibleRequests('TECH001').length, 1); assert.equal(m.getVisibleRequests('TECH002').length, 0);
  assert.equal(m.getVisibleRequests('OFF001').length, 4);
});
test('Credit: specialised summary/detail snapshots are defensive copies', () => {
  const r = fixture().findRequestById('REQ001'); r.specialisedDetails.networkImpact = 'Campus Wide';
  assert.equal(r.specialisedDetails.networkImpact, 'Multiple Users'); assert.equal(r.calculatePriorityScore(), 75);
});
