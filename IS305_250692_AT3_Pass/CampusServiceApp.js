/* IS305 AT3 — Taisen Marainump, 250692. Console workflow, no database. */
const readline = require('node:readline');
const path = require('node:path');
const User = require('./User');
const ServiceRequestManager = require('./ServiceRequestManager');
const { StudentRequester, StaffRequester, ServiceOfficer, Technician, SystemAdministrator } = require('./UserRoles');
const { createRequest } = require('./SpecialisedRequests');
const { JsonStore } = require('./JsonStore');
const { SummaryReport, ResolutionReport, PriorityReport } = require('./Reports');
const { CATEGORIES, PRIORITIES, STATUSES, LEVELS, ROLES } = require('./constants');
const { buildDemo, runDemo } = require('./demoData');
const V = require('./validation');
class CampusServiceApp {
  #manager; #store; #currentId = null; #rl; #answers;
  constructor(manager, store = null) { this.#manager = manager; this.#store = store; }
  get manager() { return this.#manager; }
  async #ask(prompt) {
    process.stdout.write(prompt); const answer = await this.#answers.next();
    if (answer.done) throw new Error('INPUT_CLOSED'); return answer.value.trim();
  }
  async #select(label, options, optional = false) {
    console.log(options.map((value, i) => `${i + 1}. ${value}`).join('\n'));
    const answer = await this.#ask(`${label}${optional ? ' (Enter for any)' : ''}: `);
    if (!answer && optional) return undefined;
    const match = /^\d+$/.test(answer) ? options[Number(answer) - 1] : options.find(value => value.toLowerCase() === answer.toLowerCase());
    if (!match) throw new Error(`Choose a valid ${label.toLowerCase()}.`); return match;
  }
  #actor() { if (!this.#currentId) throw new Error('Register a user or switch to a registered user first (option 11).'); return this.#manager.findUserById(this.#currentId); }
  #rows(requests) {
    if (!requests.length) { console.log('No matching requests.'); return; }
    console.table(requests.map(r => ({ ID: r.requestId, Title: r.title, Category: r.category, Priority: r.priority, Status: r.status, Technician: r.assignedTechnician?.userId || 'Unassigned' })));
  }
  async #persist() {
    if (this.#store) {
      try { await this.#store.save(this.#manager); console.log('Changes saved to JSON.'); }
      catch (error) { console.log(`SAVE FAILED: ${error.message}\nChanges remain in this session. Retry saving before exit.`); }
    }
  }
  #distinction() { if (this.#manager.level !== 'distinction') throw new Error('This feature requires Distinction mode.'); }
  #admin() { if (this.#actor().userType !== 'System Administrator') throw new Error('Only a System Administrator may perform this action.'); }
  async #register() {
    const roles = this.#manager.level === 'pass' ? ['Student', 'Staff'] : ROLES;
    const role = await this.#select('User type', roles);
    const id = await this.#ask('User ID: '), first = await this.#ask('First name: '), last = await this.#ask('Last name: '), email = await this.#ask('Email: ');
    let user;
    if (this.#manager.level === 'pass') user = new User(id, first, last, email, role);
    else if (role === 'Student') {
      const programme = await this.#ask('Programme: '); const yearText = await this.#ask('Year level (1-10): ');
      if (!/^\d+$/.test(yearText)) throw new Error('Year level must be a whole number.');
      user = new StudentRequester(id, first, last, email, programme, Number(yearText));
    } else if (role === 'Staff') user = new StaffRequester(id, first, last, email, await this.#ask('Department: '));
    else if (role === 'Service Officer') user = new ServiceOfficer(id, first, last, email, await this.#ask('Service section: '));
    else if (role === 'Technician') user = new Technician(id, first, last, email, await this.#ask('Technical speciality: '));
    else user = new SystemAdministrator(id, first, last, email);
    this.#manager.registerUser(user); this.#currentId = user.userId;
    console.log(`Registered: ${user.displayInfo()}`); await this.#persist();
  }
  async #submit() {
    const requester = this.#actor();
    if (!['Student', 'Staff'].includes(requester.userType)) throw new Error('Only Student/Staff requesters may submit a request.');
    const common = { requestId: await this.#ask('Request ID: '), requester, title: await this.#ask('Title: '), description: await this.#ask('Description: '), campusLocation: await this.#ask('Campus location: '),
      category: await this.#select('Category', CATEGORIES), priority: await this.#select('Priority', PRIORITIES) };
    let details = null;
    if (this.#manager.level !== 'pass') {
      if (common.category === CATEGORIES[0]) details = { deviceType: await this.#ask('Device type: '), systemName: await this.#ask('System name: '), faultType: await this.#ask('Fault type: '), networkImpact: await this.#select('Network impact', ['None', 'Single User', 'Multiple Users', 'Campus Wide']) };
      else if (common.category === CATEGORIES[1]) details = { building: await this.#ask('Building: '), roomNumber: await this.#ask('Room number: '), hazardLevel: await this.#select('Hazard level', ['Low', 'Medium', 'High']), equipmentAffected: await this.#ask('Equipment affected: ') };
      else if (common.category === CATEGORIES[2]) details = { cleaningArea: await this.#ask('Cleaning area: '), hygieneRisk: await this.#select('Hygiene risk', ['Low', 'Medium', 'High']), serviceType: await this.#ask('Service type: '), preferredServiceTime: await this.#ask('Preferred service time: ') };
    }
    const request = this.#manager.submitRequest(createRequest(common, details, this.#manager.level));
    console.log(`Request ${request.requestId} submitted. Status: ${request.status}`); await this.#persist();
  }
  async #workflow(option) {
    const actor = this.#actor(); const id = await this.#ask('Request ID: ');
    // Manager checks the stored actor and request; no unrestricted status setter is used.
    if (option === '12') this.#manager.reviewRequest(id, actor.userId, await this.#ask('Review comment: '));
    if (option === '13') this.#manager.setRequestPriority(id, actor.userId, await this.#select('Priority', PRIORITIES), await this.#ask('Priority comment: '));
    if (option === '14') {
      console.table(this.#manager.getUsers().filter(u => u.userType === 'Technician').map(u => ({ ID: u.userId, Name: u.getFullName(), Speciality: u.technicalSpeciality })));
      this.#manager.assignTechnician(id, actor.userId, await this.#ask('Technician ID: '), await this.#ask('Assignment comment: '));
    }
    if (option === '15') this.#manager.startWork(id, actor.userId, await this.#ask('Start-work comment: '));
    if (option === '16') this.#manager.addProgressNote(id, actor.userId, await this.#ask('Progress note: '));
    if (option === '17') this.#manager.resolveRequest(id, actor.userId, await this.#ask('Resolution comment: '));
    if (option === '18') this.#manager.closeRequest(id, actor.userId, await this.#ask('Verification comment: '));
    console.log(`Action accepted. Status: ${this.#manager.findRequestById(id).status}`); await this.#persist();
  }
  async #action(option) {
    if (option === '1') return this.#register();
    if (option === '2') return this.#submit();
    if (option === '11') {
      console.table(this.#manager.getUsers().map(u => ({ ID: u.userId, Name: u.getFullName(), Role: u.userType })));
      const id = await this.#ask('Switch to user ID: '); const user = this.#manager.findUserById(id);
      if (!user) throw new Error('User ID not found.'); this.#currentId = user.userId;
      console.log(`Active user: ${user.displayInfo()}`); return;
    }
    const actor = this.#actor();
    if (option === '3') {
      const request = this.#manager.viewRequest(await this.#ask('Request ID: '), actor.userId);
      console.log(JSON.stringify({ ...request.getRequestSummary(), description: request.description, dateUpdated: request.dateUpdated }, null, 2));
      console.table(request.getHistory());
    } else if (option === '4') this.#rows(this.#manager.getRequestsByUser(actor.userId));
    else if (option === '5') this.#rows(this.#manager.level === 'pass' ? this.#manager.getAllRequests() : this.#manager.getVisibleRequests(actor.userId));
    else if (option === '6') {
      const id = await this.#ask('Request ID: ');
      const field = await this.#select('Field', ['title', 'description', 'campusLocation', 'priority']);
      const value = field === 'priority' ? await this.#select('Priority', PRIORITIES) : await this.#ask('New value: ');
      this.#manager.updateRequest(id, actor.userId, { [field]: value }); console.log('Request updated.'); await this.#persist();
    } else if (option === '7') {
      this.#manager.cancelRequest(await this.#ask('Request ID: '), actor.userId, await this.#ask('Cancellation reason: '));
      console.log('Request cancelled.'); await this.#persist();
    } else if (option === '8') this.#rows(this.#manager.searchRequests(await this.#ask('Search ID or title: '), this.#manager.getVisibleRequests(actor.userId)));
    else if (option === '9') console.table(this.#manager.getRequestSummaryByStatus(this.#manager.level === 'pass' ? this.#manager.getAllRequests() : this.#manager.getVisibleRequests(actor.userId)));
    else if (['12', '13', '14', '15', '16', '17', '18'].includes(option)) return this.#workflow(option);
    else if (option === '19') {
      if (this.#manager.level === 'pass') throw new Error('Filtering and sorting require Credit or Distinction mode.');
      const category = await this.#select('Category', CATEGORIES, true), status = await this.#select('Status', STATUSES, true), priority = await this.#select('Priority', PRIORITIES, true);
      const technicianId = (await this.#ask('Technician ID (Enter for any): ')) || undefined;
      const by = await this.#select('Sort field', ['date', 'priority']), direction = await this.#select('Sort direction', ['asc', 'desc']);
      const requests = this.#manager.filterRequests({ category, status, priority, technicianId }, this.#manager.getVisibleRequests(actor.userId));
      this.#rows(this.#manager.sortRequests(by, direction, requests));
    } else if (option === '20') { this.#distinction(); this.#admin(); await this.#store.save(this.#manager); console.log('JSON saved.'); }
    else if (option === '21') {
      this.#distinction(); this.#admin();
      if ((await this.#ask('Type RELOAD to replace this session with saved JSON: ')) !== 'RELOAD') return;
      const restored = await this.#store.load(); if (!restored) throw new Error('No saved JSON file exists.');
      this.#manager = restored;
      if (!this.#manager.findUserById(this.#currentId)) this.#currentId = null;
      console.log('JSON reloaded; subclasses and shared user references restored.');
    } else if (option === '22') {
      this.#distinction(); const requests = this.#manager.getManagementData(actor.userId);
      for (const report of [new SummaryReport(), new ResolutionReport(), new PriorityReport()]) console.log(JSON.stringify(report.generate(requests), null, 2));
    } else if (option === '23') { this.#distinction(); console.table(this.#manager.getAuditHistory(actor.userId)); }
    else if (option === '24') {
      if (!['Service Officer', 'System Administrator'].includes(actor.userType)) throw new Error('User record review requires officer or administrator.');
      for (const user of this.#manager.getUsers()) console.log(user.displayInfo());
    } else throw new Error('Choose a valid menu option.');
  }
  async run() {
    this.#rl = readline.createInterface({ input: process.stdin, output: process.stdout }); this.#answers = this.#rl[Symbol.asyncIterator]();
    console.log('Campus Service Request System | Taisen Marainump 250692');
    console.log(`Mode: ${this.#manager.level}. Role selection is an academic simulation, not password authentication.`);
    try {
      while (true) {
        console.log(`\n=== CAMPUS SERVICE REQUEST SYSTEM ===\nActive: ${this.#currentId || 'No user selected'}`);
        console.log('1. Register User\n2. Submit Service Request\n3. View Request by ID\n4. View My Requests\n5. View All Requests\n6. Update My Request\n7. Cancel My Request\n8. Search Requests\n9. View Request Summary\n10. Exit\n11. Switch simulated user');
        if (this.#manager.level !== 'pass') console.log('12. Review request\n13. Set priority\n14. Assign Technician\n15. Begin work\n16. Add progress note\n17. Resolve request\n18. Verify and close\n19. Filter and sort\n24. Review user records');
        if (this.#store) console.log('20. Save JSON (administrator)\n21. Reload JSON (administrator)\n22. Management reports\n23. Audit history');
        const option = await this.#ask('Choose an option: ');
        if (option === '10') { console.log('Application closed.'); break; }
        try { await this.#action(option); }
        catch (error) { if (error.message === 'INPUT_CLOSED') throw error; console.log(`ERROR: ${error.message}`); }
      }
    } catch (error) { if (error.message !== 'INPUT_CLOSED') throw error; console.log('\nInput closed.'); }
    finally { this.#rl.close(); }
  }
}
async function main(args = process.argv.slice(2)) {
  const option = prefix => args.find(arg => arg.startsWith(prefix))?.slice(prefix.length);
  const level = V.choice(option('--level=') || 'pass', LEVELS, 'Achievement level');
  if (args.includes('--demo')) { runDemo(level); return; }
  const store = level === 'distinction' ? new JsonStore(option('--data=') || path.join(__dirname, 'data', 'campus-data.json')) : null;
  let manager = store ? await store.load() : null;
  if (!manager) {
    manager = args.includes('--seed-demo') ? buildDemo(level) : new ServiceRequestManager(level);
    if (store && args.includes('--seed-demo')) await store.save(manager);
  } else if (args.includes('--seed-demo')) console.log('Existing saved data found; seed was not applied or overwritten.');
  if (args.includes('--seed-demo')) console.log('Demo IDs: 250692, STF001, OFF001, TECH001, TECH002, ADM001. Select option 11 to switch.');
  await new CampusServiceApp(manager, store).run();
}
if (require.main === module) main().catch(error => { console.error(`STARTUP ERROR: ${error.message}`); process.exitCode = 1; });
module.exports = { CampusServiceApp, main };
