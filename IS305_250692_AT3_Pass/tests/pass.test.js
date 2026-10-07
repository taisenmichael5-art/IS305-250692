const test = require('node:test'); const assert = require('node:assert/strict');
const User = require('../User'); const Request = require('../ServiceRequest'); const Manager = require('../ServiceRequestManager');
const { fixture } = require('./helpers');
function request(manager, changes = {}) { return new Request({ requestId: 'NEW001', requester: manager.findUserById('250692'), title: 'Test request', description: 'Detailed issue', campusLocation: 'LAB 131', category: 'General Campus Service', ...changes }); }
test('Pass: valid registration and duplicate ID rejection, including case', () => {
  const m = new Manager('pass'); const u = new User('U1', 'Taisen', 'Marainump', 'taisen@example.test'); m.registerUser(u);
  assert.equal(m.findUserById('u1'), u); assert.throws(() => m.registerUser(new User('u1', 'Other', 'User', 'other@example.test')), /Duplicate/);
});
test('Pass: missing ID, names, malformed email and unsupported role rejected', () => {
  for (const args of [['', 'A', 'B', 'a@example.test'], ['X', '', 'B', 'a@example.test'], ['X', 'A', '', 'a@example.test'], ['X', 'A', 'B', 'bad'], ['X', 'A', 'B', 'a@example.test', 'Owner']]) assert.throws(() => new User(...args));
});
test('Pass: controlled User setters preserve valid data on rejection', () => {
  const u = new User('U1', 'Taisen', 'Marainump', 'a@example.test'); assert.throws(() => { u.email = 'bad'; }); assert.equal(u.email, 'a@example.test');
  u.firstName = 'Updated'; assert.equal(u.getFullName(), 'Updated Marainump'); assert.equal(u.validate(), true);
});
test('Pass: valid request defaults Submitted; arrays retain actual objects', () => {
  const m = fixture('pass'); const r = request(m); m.submitRequest(r);
  assert.equal(r.status, 'Submitted'); assert.equal(r.requester, m.findUserById('250692')); assert.equal(m.findRequestById('new001'), r);
});
test('Pass: duplicate request IDs rejected before collection changes', () => {
  const m = fixture('pass'); const count = m.getAllRequests().length;
  assert.throws(() => m.submitRequest(request(m, { requestId: 'req001' })), /Duplicate/); assert.equal(m.getAllRequests().length, count);
});
test('Pass: invalid title, description, location, category, priority rejected', () => {
  const m = fixture('pass');
  for (const bad of [{ title: '' }, { description: '' }, { campusLocation: '' }, { category: 'Finance' }, { priority: 'Critical' }, { requester: {} }]) assert.throws(() => request(m, bad));
});
test('Pass: requester must be original registered object', () => {
  const m = fixture('pass'); const clone = new User('250692', 'Taisen', 'Marainump', 'a@example.test');
  assert.throws(() => m.submitRequest(request(m, { requester: clone })), /original requester/);
});
test('Pass: own records are scoped to selected requester', () => {
  const m = fixture('pass'); assert.equal(m.getRequestsByUser('250692').length, 3);
  assert.equal(m.getRequestsByUser('STF001').length, 1); assert.equal(m.getVisibleRequests('STF001').length, 1);
  assert.throws(() => m.viewRequest('REQ001', 'STF001'), /permission/);
});
test('Pass: own Submitted update works; another user rejected unchanged', () => {
  const m = fixture('pass'); m.updateRequest('REQ001', '250692', { title: 'Updated title' }); assert.equal(m.findRequestById('REQ001').title, 'Updated title');
  const history = m.findRequestById('REQ001').getHistory(); assert.throws(() => m.updateRequest('REQ001', 'STF001', { title: 'Wrong' }), /requester/);
  assert.deepEqual(m.findRequestById('REQ001').getHistory(), history);
});
test('Pass: multi-field validation is atomic; unsupported fields rejected', () => {
  const m = fixture('pass'); const r = m.findRequestById('REQ001'); const title = r.title;
  assert.throws(() => m.updateRequest(r.requestId, '250692', { title: 'Valid new title', description: '' })); assert.equal(r.title, title);
  assert.throws(() => m.updateRequest(r.requestId, '250692', { status: 'Closed' })); assert.throws(() => m.updateRequest(r.requestId, '250692', {}));
});
test('Pass: only owner may cancel Submitted request; cancellation final', () => {
  const m = fixture('pass'); assert.throws(() => m.cancelRequest('REQ001', 'STF001'));
  m.cancelRequest('REQ001', '250692'); assert.equal(m.findRequestById('REQ001').status, 'Cancelled');
  assert.throws(() => m.cancelRequest('REQ001', '250692')); assert.throws(() => m.updateRequest('REQ001', '250692', { title: 'Reopen' }));
});
test('Pass: search by partial ID and title; missing IDs rejected', () => {
  const m = fixture('pass'); assert.equal(m.searchRequests('REQ001').length, 1); assert.equal(m.searchRequests('network').length, 1);
  assert.throws(() => m.updateRequest('UNKNOWN', '250692', { title: 'x' })); assert.throws(() => m.getRequestsByUser('UNKNOWN'));
});
test('Pass: collection and history copies cannot change internal arrays', () => {
  const m = fixture('pass'); m.getAllRequests().pop(); m.getUsers().pop();
  assert.equal(m.getAllRequests().length, 4); assert.equal(m.getUsers().length, 2);
  const r = m.findRequestById('REQ001'); const history = r.getHistory(); history[0].comment = 'tampered';
  assert.equal(r.getHistory()[0].comment, 'Request submitted.');
});
test('Pass: status counts reconcile to total and advanced actions disabled', () => {
  const m = fixture('pass'); const counts = m.getRequestSummaryByStatus(); assert.equal(counts.Submitted, 4);
  assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), 4); assert.throws(() => m.reviewRequest('REQ001', '250692', 'Review'), /requires Credit/);
  assert.throws(() => m.registerUser(new User('OFF', 'A', 'B', 'a@example.test', 'Service Officer')), /only Student/);
});
