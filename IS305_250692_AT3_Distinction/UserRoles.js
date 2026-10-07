const User = require('./User');
const V = require('./validation');
class StudentRequester extends User {
  #programme; #yearLevel;
  constructor(id, first, last, email, programme, yearLevel) {
    super(id, first, last, email, 'Student');
    this.#programme = V.text(programme, 'Programme', 150);
    if (!Number.isInteger(yearLevel) || yearLevel < 1 || yearLevel > 10) throw new Error('Year level must be a whole number from 1 to 10.');
    this.#yearLevel = yearLevel;
  }
  get programme() { return this.#programme; } get yearLevel() { return this.#yearLevel; }
  displayInfo() { return `${super.displayInfo()} | ${this.#programme}, Year ${this.#yearLevel}`; }
  toJSON() { return { ...super.toJSON(), className: 'StudentRequester', programme: this.#programme, yearLevel: this.#yearLevel }; }
}
class StaffRequester extends User {
  #department;
  constructor(id, first, last, email, department) { super(id, first, last, email, 'Staff'); this.#department = V.text(department, 'Department', 150); }
  get department() { return this.#department; }
  displayInfo() { return `${super.displayInfo()} | Department: ${this.#department}`; }
  toJSON() { return { ...super.toJSON(), className: 'StaffRequester', department: this.#department }; }
}
class ServiceOfficer extends User {
  #serviceSection;
  constructor(id, first, last, email, serviceSection) { super(id, first, last, email, 'Service Officer'); this.#serviceSection = V.text(serviceSection, 'Service section', 150); }
  get serviceSection() { return this.#serviceSection; }
  getPermissions() { return ['view all requests', 'review', 'set priority', 'assign technicians', 'verify and close resolved requests']; }
  displayInfo() { return `${super.displayInfo()} | Section: ${this.#serviceSection}`; }
  toJSON() { return { ...super.toJSON(), className: 'ServiceOfficer', serviceSection: this.#serviceSection }; }
}
class Technician extends User {
  #technicalSpeciality;
  constructor(id, first, last, email, technicalSpeciality) { super(id, first, last, email, 'Technician'); this.#technicalSpeciality = V.text(technicalSpeciality, 'Technical speciality', 150); }
  get technicalSpeciality() { return this.#technicalSpeciality; }
  getPermissions() { return ['view assigned requests', 'begin assigned work', 'record progress', 'resolve assigned work']; }
  displayInfo() { return `${super.displayInfo()} | Speciality: ${this.#technicalSpeciality}`; }
  toJSON() { return { ...super.toJSON(), className: 'Technician', technicalSpeciality: this.#technicalSpeciality }; }
}
class SystemAdministrator extends User {
  constructor(id, first, last, email) { super(id, first, last, email, 'System Administrator'); }
  getPermissions() { return ['view system records', 'view audit history', 'generate management reports', 'save and reload JSON']; }
  toJSON() { return { ...super.toJSON(), className: 'SystemAdministrator' }; }
}
function userFromJSON(data) {
  if (!data || typeof data !== 'object') throw new Error('Invalid saved user.');
  const args = [data.userId, data.firstName, data.lastName, data.email];
  let user;
  switch (data.className) {
    case 'User': user = new User(...args, data.userType); break;
    case 'StudentRequester': user = new StudentRequester(...args, data.programme, data.yearLevel); break;
    case 'StaffRequester': user = new StaffRequester(...args, data.department); break;
    case 'ServiceOfficer': user = new ServiceOfficer(...args, data.serviceSection); break;
    case 'Technician': user = new Technician(...args, data.technicalSpeciality); break;
    case 'SystemAdministrator': user = new SystemAdministrator(...args); break;
    default: throw new Error(`Unknown saved user class: ${data.className}.`);
  }
  if (user.userType !== data.userType) throw new Error('Saved user role does not match its class.');
  return user;
}
module.exports = { StudentRequester, StaffRequester, ServiceOfficer, Technician, SystemAdministrator, userFromJSON };
