const test = require('node:test'); const assert = require('node:assert/strict');
const fs = require('node:fs/promises'); const os = require('node:os'); const path = require('node:path'); const { spawnSync } = require('node:child_process');
const Manager = require('../ServiceRequestManager'); const Store = require('../FourFileStore'); const Base = require('../ServiceRequest'); const Factory = require('../ServiceRequestFactory');
const { UserFileRepository, ServiceRequestFileRepository } = require('../FileRepositories');
const { RequestReport, SummaryReport, ResolutionReport, PriorityReport, OperationsReport } = require('../Reports');
const { fixture, finish, assign } = require('./helpers'); const { StudentRequester } = require('../UserRoles');
const { ICTSupportRequest, MaintenanceRequest, CleaningRequest } = require('../SpecialisedRequests');
const FILES = ['auditLog.json', 'requestHistory.json', 'serviceRequests.json', 'users.json'];
async function temporary(t) { const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'is305-at3-distinction-')); t.after(() => fs.rm(dir, { recursive: true, force: true })); return dir; }
async function read(dir, file) { return JSON.parse(await fs.readFile(path.join(dir, file), 'utf8')); }
function cli(args, lines, expected = 0) { const r = spawnSync(process.execPath, [path.join(__dirname, '../CampusServiceApp.js'), ...args], { input: lines.join('\n') + '\n', encoding: 'utf8', timeout: 10000 }); assert.equal(r.status, expected, r.stderr); assert.equal(r.error, undefined); return r; }
test('Distinction: ServiceRequest abstract methods reject incomplete subclass', () => {
  class Incomplete extends Base {}
  const r = new Incomplete({ requestId: 'R', requester: fixture().findUserById('250692'), title: 'Issue', description: 'Issue details', campusLocation: 'Lab', category: 'ICT Support' });
  for (const name of ['calculatePriorityScore', 'getTargetResolutionHours', 'getRequestSummary']) assert.throws(() => r[name](), new RegExp(name));
  assert.throws(() => new RequestReport(), /abstract/);
});
test('Distinction: one collection dispatches all required polymorphic methods', () => {
  const rows = fixture().getAllRequests().slice(0, 3).map(r => [r.getRequestSummary(), r.calculatePriorityScore(), r.getTargetResolutionHours()]);
  assert.deepEqual(rows.map(r => r[0].requestType), ['ICTSupportRequest', 'MaintenanceRequest', 'CleaningRequest']);
  assert.deepEqual(rows.map(r => r[1]), [75, 45, 85]); assert.deepEqual(rows.map(r => r[2]), [24, 72, 12]);
});
test('Distinction: four report implementations work in the same loop', () => {
  const m = fixture(); const results = [new SummaryReport(), new ResolutionReport(), new PriorityReport(), new OperationsReport()].map(r => r.generate(m.getAllRequests()));
  assert.equal(results.length, 4); assert.equal(results[0].total, 4); assert.equal(results[2].rows.length, 4);
});
test('Distinction: status/category/priority/location counts reconcile', () => {
  const m = fixture(); finish(m); m.cancelRequest('REQ004', '250692'); const rows = m.getAllRequests();
  const r = new SummaryReport().generate(rows); assert.equal(r.byStatus.Closed, 1); assert.equal(r.byStatus.Cancelled, 1);
  for (const counts of [r.byStatus, r.byCategory, r.byPriority, new OperationsReport().generate(rows).volumeByLocation]) assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), 4);
});
test('Distinction: urgent, overdue, assigned and completed reports calculate correctly', () => {
  const m = fixture(); m.reviewRequest('REQ002', 'OFF001', 'Reviewed'); m.setRequestPriority('REQ002', 'OFF001', 'Urgent'); m.assignTechnician('REQ002', 'OFF001', 'TECH002'); finish(m);
  const rows = m.getAllRequests(); const now = new Date(Date.now() + 200 * 3600000); const r = new OperationsReport().generate(rows, now);
  assert.deepEqual(r.urgentRequests.map(r => r.requestId), ['REQ002']); assert.equal(r.overdueRequests.length, 3); assert.equal(r.assignedByTechnician.TECH001, 1); assert.equal(r.completedByTechnician.TECH001, 1);
  const request = m.findRequestById('REQ001'); const timestamp = request.getHistory().find(h => h.newStatus === 'Resolved').timestamp;
  assert.equal(r.averageResolutionHours, Number(((new Date(timestamp) - new Date(request.dateSubmitted)) / 3600000).toFixed(4)));
  assert.equal(new OperationsReport().generate([]).averageResolutionHours, null);
});
test('Distinction: resolved duration is stable at later reporting times', () => {
  const m = fixture(); finish(m); const rows = [m.findRequestById('REQ001')]; const r = new ResolutionReport();
  assert.equal(r.generate(rows, new Date('2030-01-01')).rows[0].elapsedHours, r.generate(rows, new Date('2040-01-01')).rows[0].elapsedHours);
});
test('Distinction: audit includes registrations and all approved lifecycle actions', () => {
  const m = fixture(); finish(m); m.updateRequest('REQ004', '250692', { title: 'Updated event' }); m.cancelRequest('REQ004', '250692');
  const logs = m.getAuditHistory('ADM001'); const actions = new Set(logs.map(a => a.action));
  for (const action of ['User Registered', 'Request Created', 'Request Updated', 'Priority Changed', 'Technician Assigned', 'Work Started', 'Progress Note', 'Request Resolved', 'Request Closed', 'Request Cancelled']) assert.ok(actions.has(action));
  for (const log of logs) for (const key of ['auditId','actorId','actorRole','action','requestId','description','timestamp','outcome']) assert.ok(Object.hasOwn(log, key));
  assert.equal(new Set(logs.map(a => a.auditId)).size, logs.length);
});
test('Distinction: denied actions do not append audit and defensive copies protect it', () => {
  const m = fixture(); const logs = m.getAuditRecords(); assert.throws(() => m.reviewRequest('REQ001', '250692', 'Denied'));
  assert.deepEqual(m.getAuditRecords(), logs); logs[0].description = 'tampered'; assert.notEqual(m.getAuditRecords()[0].description, 'tampered');
  assert.throws(() => m.getAuditHistory('OFF001')); assert.throws(() => m.getManagementData('TECH001'));
});
test('Distinction: four named files save plain arrays with separate histories', async t => {
  const dir = await temporary(t); const store = new Store(dir); await store.save(fixture()); assert.deepEqual((await fs.readdir(dir)).sort(), FILES);
  for (const file of FILES) assert.ok(Array.isArray(await read(dir, file)));
  assert.equal((await read(dir, 'users.json')).length, 6); assert.equal((await read(dir, 'auditLog.json')).length, 10);
  const request = (await read(dir, 'serviceRequests.json'))[0]; assert.equal(request.requestType, 'ICTSupportRequest'); assert.equal(request.assignedTechnicianId, null); assert.equal(request.history, undefined);
});
test('Distinction: loading restores all three subclasses, users and shared references', async t => {
  const dir = await temporary(t); const store = new Store(dir); const m = fixture(); finish(m); await store.save(m); const loaded = await store.load();
  for (const [id, Type] of [['REQ001',ICTSupportRequest], ['REQ002',MaintenanceRequest], ['REQ003',CleaningRequest]]) assert.ok(loaded.findRequestById(id) instanceof Type);
  const r = loaded.findRequestById('REQ001'); assert.ok(loaded.findUserById('250692') instanceof StudentRequester); assert.equal(r.requester, loaded.findUserById('250692')); assert.equal(r.assignedTechnician, loaded.findUserById('TECH001')); assert.equal(r.status, 'Closed');
  assert.deepEqual(loaded.toJSON().audit, m.toJSON().audit); assert.deepEqual(r.getHistory(), m.findRequestById('REQ001').getHistory()); assert.equal(r.calculatePriorityScore(), 75);
});
test('Distinction: restored Assigned object supports continued approved workflow', async t => {
  const dir = await temporary(t); const m = fixture(); assign(m); const store = new Store(dir); await store.save(m); const loaded = await store.load(); loaded.startWork('REQ001', 'TECH001'); await store.save(loaded); assert.equal((await store.load()).findRequestById('REQ001').status, 'In Progress');
});
test('Distinction: explicit factory rehydrates polymorphic request behaviour', () => {
  const m = fixture(); const r = m.findRequestById('REQ003'); const restored = Factory.createFromData(r.toJSON(), m.getUsers());
  assert.ok(restored instanceof CleaningRequest); assert.equal(restored.getTargetResolutionHours(), 12); assert.equal(restored.getRequestSummary().cleaningArea, 'Washroom floor');
});
test('Distinction: missing, zero-byte, whitespace and empty arrays yield empty collections', async t => {
  const dir = await temporary(t); const store = new Store(dir); assert.equal(await store.load(), null);
  for (const [i, file] of FILES.entries()) await fs.writeFile(path.join(dir, file), ['', ' \n ', '[]', '[]'][i]);
  assert.equal(await store.load(), null); assert.deepEqual(await new UserFileRepository(dir).loadAll(), []);
});
test('Distinction: repositories create/find/update and reject duplicate identifiers', async t => {
  const dir = await temporary(t); const repo = new UserFileRepository(dir); const u = fixture().findUserById('250692').toJSON(); await repo.create(u);
  assert.equal((await repo.findById('250692')).lastName, 'Marainump'); await repo.update('250692', { firstName: 'Updated' }); assert.equal((await repo.findById('250692')).firstName, 'Updated');
  await assert.rejects(repo.create(u), /Duplicate/); await assert.rejects(repo.update('250692', { email: 'bad' })); await assert.rejects(repo.update('250692', { userId: 'Changed' }));
  assert.equal((await repo.loadAll()).length, 1);
});
test('Distinction: request repository supports requester and technician queries', async t => {
  const dir = await temporary(t); const m = fixture(); assign(m); await new Store(dir).save(m); const repo = new ServiceRequestFileRepository(dir);
  assert.equal((await repo.findByRequester('250692')).length, 3); assert.equal((await repo.findByTechnician('TECH001')).length, 1);
});
test('Distinction: invalid records and credentials are rejected before disk changes', async t => {
  const dir = await temporary(t); const repo = new UserFileRepository(dir); const user = fixture().findUserById('250692').toJSON();
  await assert.rejects(repo.saveAll([{ ...user, password: 'not permitted' }]), /credentials/); await assert.rejects(repo.saveAll([{ ...user, email: 'bad' }])); assert.deepEqual(await fs.readdir(dir), []);
});
test('Distinction: corrupt JSON yields clear read error and preserves file', async t => {
  const dir = await temporary(t); await fs.writeFile(path.join(dir, 'users.json'), '{broken'); await assert.rejects(new Store(dir).load(), /Invalid users.json/); assert.equal(await fs.readFile(path.join(dir, 'users.json'), 'utf8'), '{broken');
});
test('Distinction: file-reading errors report the affected filename', async t => {
  const dir = await temporary(t); await fs.mkdir(path.join(dir, 'users.json')); await assert.rejects(new Store(dir).load(), /Could not read users.json/);
});
test('Distinction: four-file save rollback preserves every original file', async t => {
  const dir = await temporary(t); const store = new Store(dir); const m = fixture(); await store.save(m); const original = await Promise.all(FILES.map(f => fs.readFile(path.join(dir, f), 'utf8')));
  m.updateRequest('REQ001', '250692', { title: 'Changed' }); store.repositories[2].saveAll = async () => { throw new Error('Simulated disk write error'); };
  await assert.rejects(store.save(m), /previous files restored/); assert.deepEqual(await Promise.all(FILES.map(f => fs.readFile(path.join(dir, f), 'utf8'))), original); assert.deepEqual((await fs.readdir(dir)).sort(), FILES);
});
test('Distinction: interrupted save journal restores the prior complete dataset', async t => {
  const dir = await temporary(t); const store = new Store(dir); await store.save(fixture()); const prior = await Promise.all(store.repositories.map(r => fs.readFile(r.file, 'utf8')));
  await fs.writeFile(store.journal, JSON.stringify(prior)); await fs.writeFile(path.join(dir, 'users.json'), '[]'); assert.equal((await store.load()).getUsers().length, 6); assert.deepEqual((await fs.readdir(dir)).sort(), FILES);
});
test('Distinction: invalid references, duplicate IDs and inconsistent audits reject loading', async t => {
  const dir = await temporary(t); const store = new Store(dir); await store.save(fixture()); const requests = await read(dir, 'serviceRequests.json'); requests[0].requesterId = 'MISSING'; await fs.writeFile(path.join(dir, 'serviceRequests.json'), JSON.stringify(requests)); await assert.rejects(store.load(), /unknown requester/);
  await store.save(fixture()); const audits = await read(dir, 'auditLog.json'); audits.pop(); await fs.writeFile(path.join(dir, 'auditLog.json'), JSON.stringify(audits)); await assert.rejects(store.load(), /counts disagree/);
  await store.save(fixture()); const users = await read(dir, 'users.json'); users.push(users[0]); await fs.writeFile(path.join(dir, 'users.json'), JSON.stringify(users)); await assert.rejects(store.load(), /Duplicate/);
});
test('Distinction: forged workflow history or audit actor is rejected', () => {
  const m = fixture(); finish(m); const data = m.toJSON(); data.requests[0].history.at(-1).actorId = '250692'; data.requests[0].history.at(-1).actorRole = 'Student'; assert.throws(() => Manager.fromJSON(data), /Service Officer/);
  const forged = m.toJSON(); forged.audit[0].actorRole = 'Technician'; assert.throws(() => Manager.fromJSON(forged), /audit actor/);
});
test('Distinction: Pass/Credit managers cannot save and normal application data stays untouched', async t => {
  const dir = await temporary(t); const store = new Store(dir); await assert.rejects(store.save(fixture('pass')), /Distinction/); await assert.rejects(store.save(fixture('credit')), /Distinction/); assert.deepEqual(await fs.readdir(dir), []);
});
test('Console: Pass full core workflow and Credit lifecycle remain functional', async t => {
  const dir = await temporary(t);
  const r = cli(['--level=pass', `--data-dir=${dir}`], ['1','1','250692','Taisen','Marainump','taisen@example.test','2','REQ100','Chair setup','Need chairs','Hall','4','2','6','REQ100','1','Updated setup','8','Updated','7','REQ100','Event postponed','9','10']); assert.doesNotMatch(r.stdout, /ERROR:/); assert.match(r.stdout, /Request cancelled/); assert.deepEqual(await fs.readdir(dir), []);
  const c = cli(['--level=credit','--seed-demo'], ['11','OFF001','12','REQ001','Reviewed','14','REQ001','TECH001','Assigned','11','TECH001','15','REQ001','Started','16','REQ001','Checked','17','REQ001','Fixed','11','OFF001','18','REQ001','Verified','10']); assert.doesNotMatch(c.stdout, /ERROR:/); assert.match(c.stdout, /Status: Closed/);
});
test('Console: Distinction saves, restarts, reloads, reports and shows full audit', async t => {
  const dir = await temporary(t); const r = cli(['--seed-demo',`--data-dir=${dir}`], ['11','ADM001','20','21','RELOAD','22','23','25','10']); assert.doesNotMatch(r.stdout, /ERROR:/); assert.match(r.stdout, /JSON reloaded/); assert.match(r.stdout, /Operations and Performance/); assert.match(r.stdout, /User Registered/); assert.match(r.stdout, /Priority score: 85/);
  const restarted = cli([`--data-dir=${dir}`], ['11','250692','4','10']); assert.match(restarted.stdout, /REQ001/); assert.equal((await new Store(dir).load()).getUsers().length, 6);
});
test('Console: invalid startup data exits clearly without overwriting it', async t => {
  const dir = await temporary(t); await fs.writeFile(path.join(dir, 'users.json'), 'broken'); const r = cli([`--data-dir=${dir}`,'--seed-demo'], ['10'], 1); assert.match(r.stderr, /STARTUP ERROR/); assert.equal(await fs.readFile(path.join(dir, 'users.json'), 'utf8'), 'broken');
});

test('Distinction: actual repository write error leaves target intact and removes temp files', async t => {
  const dir = await temporary(t); const target = path.join(dir, 'users.json'); await fs.mkdir(target); await fs.writeFile(path.join(target, 'keep.txt'), 'preserved');
  const repository = new UserFileRepository(dir); await assert.rejects(repository.saveAll([fixture().findUserById('250692').toJSON()]), /Could not write users.json/);
  assert.equal(await fs.readFile(path.join(target, 'keep.txt'), 'utf8'), 'preserved'); assert.deepEqual(await fs.readdir(dir), ['users.json']);
});
