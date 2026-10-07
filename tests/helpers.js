const { buildDemo } = require('../demoData');
function fixture(level = 'distinction') { return buildDemo(level); }
function assign(manager, id = 'REQ001') {
  manager.reviewRequest(id, 'OFF001', 'Verified.');
  manager.setRequestPriority(id, 'OFF001', 'High');
  manager.assignTechnician(id, 'OFF001', 'TECH001', 'Assigned for repair.'); return manager.findRequestById(id);
}
function finish(manager, id = 'REQ001') {
  assign(manager, id); manager.startWork(id, 'TECH001'); manager.addProgressNote(id, 'TECH001', 'Inspected.');
  manager.resolveRequest(id, 'TECH001', 'Repair tested.'); manager.closeRequest(id, 'OFF001', 'Completion verified.'); return manager.findRequestById(id);
}
module.exports = { fixture, assign, finish };
