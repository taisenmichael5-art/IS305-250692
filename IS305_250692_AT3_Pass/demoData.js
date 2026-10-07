const User = require('./User');
const { StudentRequester, StaffRequester, ServiceOfficer, Technician, SystemAdministrator } = require('./UserRoles');
const { createRequest } = require('./SpecialisedRequests');
const ServiceRequestManager = require('./ServiceRequestManager');
function buildDemo(level = 'distinction') {
  const manager = new ServiceRequestManager(level);
  const student = level === 'pass' ? new User('250692', 'Taisen', 'Marainump', 'taisen@example.test', 'Student') : new StudentRequester('250692', 'Taisen', 'Marainump', 'taisen@example.test', 'Bachelor of Information Systems', 3);
  const staff = level === 'pass' ? new User('STF001', 'Maria', 'Kila', 'maria@example.test', 'Staff') : new StaffRequester('STF001', 'Maria', 'Kila', 'maria@example.test', 'Information Systems');
  manager.registerUser(student); manager.registerUser(staff);
  if (level !== 'pass') {
    manager.registerUser(new ServiceOfficer('OFF001', 'Peter', 'Wari', 'officer@example.test', 'Campus Services'));
    manager.registerUser(new Technician('TECH001', 'Anna', 'Malo', 'ict@example.test', 'ICT Support'));
    manager.registerUser(new Technician('TECH002', 'John', 'Kora', 'maintenance@example.test', 'Facilities and Cleaning'));
    manager.registerUser(new SystemAdministrator('ADM001', 'Lucy', 'Tari', 'admin@example.test'));
  }
  const rows = [
    [{ requestId: 'REQ001', requester: student, title: 'Lab computer cannot access network', description: 'Network unavailable on lab workstation.', campusLocation: 'LAB 131', category: 'ICT Support', priority: 'High' }, { deviceType: 'Desktop', systemName: 'Windows workstation', faultType: 'No network connectivity', networkImpact: 'Multiple Users' }],
    [{ requestId: 'REQ002', requester: staff, title: 'Damaged classroom door handle', description: 'Door handle loose and difficult to operate.', campusLocation: 'Teaching Block Room 2', category: 'Facilities Maintenance', priority: 'Normal' }, { building: 'Teaching Block', roomNumber: '2', hazardLevel: 'Medium', equipmentAffected: 'Door handle' }],
    [{ requestId: 'REQ003', requester: student, title: 'Clean washroom spill', description: 'Washroom floor needs cleaning.', campusLocation: 'Student washroom', category: 'Cleaning and Sanitation', priority: 'High' }, { cleaningArea: 'Washroom floor', hygieneRisk: 'High', serviceType: 'Spill cleaning', preferredServiceTime: 'As soon as available' }],
    [{ requestId: 'REQ004', requester: student, title: 'Request event table setup', description: 'Set up tables for a student programme.', campusLocation: 'Student hall', category: 'General Campus Service', priority: 'Low' }, null]
  ];
  for (const [common, details] of rows) manager.submitRequest(createRequest(common, details, level));
  return manager;
}
function runDemo(level = 'distinction') {
  const manager = buildDemo(level);
  console.log(`\nCAMPUS SERVICE REQUEST SYSTEM — ${level.toUpperCase()} DEMONSTRATION`);
  console.table(manager.getAllRequests().map(r => ({ ID: r.requestId, Category: r.category, Priority: r.priority, Status: r.status, Score: r.calculatePriorityScore(), TargetHours: r.getTargetResolutionHours() })));
  manager.updateRequest('REQ004', '250692', { title: 'Request event table and chair setup' });
  manager.cancelRequest('REQ004', '250692', 'Event postponed.');
  if (level !== 'pass') {
    manager.reviewRequest('REQ001', 'OFF001', 'Network issue verified.');
    manager.setRequestPriority('REQ001', 'OFF001', 'Urgent');
    manager.assignTechnician('REQ001', 'OFF001', 'TECH001');
    manager.startWork('REQ001', 'TECH001');
    manager.addProgressNote('REQ001', 'TECH001', 'Switch connection checked.');
    manager.resolveRequest('REQ001', 'TECH001', 'Restored switch connection; workstation tested.');
    manager.closeRequest('REQ001', 'OFF001', 'Requester confirmed that network access works.');
    console.table(manager.findRequestById('REQ001').getHistory());
  }
  console.log('Status summary:', manager.getRequestSummaryByStatus()); return manager;
}
module.exports = { buildDemo, runDemo };
