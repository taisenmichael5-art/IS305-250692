const test = require('node:test'); const assert = require('node:assert/strict');
const fs = require('node:fs/promises'); const os = require('node:os'); const path = require('node:path');
const { spawnSync } = require('node:child_process');
const Manager = require('../ServiceRequestManager'); const { JsonStore, StorageAdapter } = require('../JsonStore');
const { RequestReport, SummaryReport, ResolutionReport, PriorityReport } = require('../Reports');
const { fixture, finish, assign } = require('./helpers');
const { StudentRequester } = require('../UserRoles'); const { ICTSupportRequest } = require('../SpecialisedRequests');
async function temporary(t) { const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'is305-at3-')); t.after(() => fs.rm(dir, { recursive: true, force: true })); return dir; }
test('Distinction: abstract report and storage types cannot be instantiated', () => {
  assert.throws(() => new RequestReport(), /abstract/); assert.throws(() => new StorageAdapter(), /abstract/);
});
test('Distinction: report polymorphism uses one generate call over report array', () => {
  const requests = fixture().getAllRequests(); const reports = [new SummaryReport(), new ResolutionReport(), new PriorityReport()];
  const outputs = reports.map(report => report.generate(requests)); assert.equal(outputs[0].total, 4); assert.equal(outputs[1].rows.length, 4); assert.equal(outputs[2].rows.length, 4);
});
test('Distinction: status/category/priority reports reconcile and exclude final queue items', () => {
  const m = fixture(); finish(m); m.cancelRequest('REQ004', '250692');
  const report = new SummaryReport().generate(m.getAllRequests()); assert.equal(report.open, 2); assert.equal(report.byStatus.Closed, 1);
  assert.equal(Object.values(report.byCategory).reduce((a, b) => a + b, 0), 4); assert.equal(new PriorityReport().generate(m.getAllRequests()).rows.length, 2);
});
test('Distinction: historical resolution metric remains stable after later report time', () => {
  const m = fixture(); finish(m); const r = m.findRequestById('REQ001');
  const report = new ResolutionReport(); const a = report.generate([r], new Date('2030-01-01')); const b = report.generate([r], new Date('2040-01-01'));
  assert.equal(a.rows[0].elapsedHours, b.rows[0].elapsedHours); assert.match(a.rows[0].outcome, /Resolved/);
});
test('Distinction: management/audit role access enforced', () => {
  const m = fixture(); assert.throws(() => m.getManagementData('250692')); assert.throws(() => m.getAuditHistory('OFF001'));
  assert.equal(m.getManagementData('OFF001').length, 4); assert.equal(m.getAuditHistory('ADM001').length, 4);
});
test('Distinction: JSON round trip restores classes, workflow and shared references', async t => {
  const dir = await temporary(t); const store = new JsonStore(path.join(dir, 'nested', 'data.json')); const m = fixture(); finish(m); await store.save(m);
  const loaded = await store.load(); const r = loaded.findRequestById('REQ001');
  assert.ok(r instanceof ICTSupportRequest); assert.ok(loaded.findUserById('250692') instanceof StudentRequester);
  assert.equal(r.status, 'Closed'); assert.equal(r.requester, loaded.findUserById('250692')); assert.equal(r.assignedTechnician, loaded.findUserById('TECH001'));
  assert.deepEqual(r.getHistory(), m.findRequestById('REQ001').getHistory()); assert.equal(r.calculatePriorityScore(), 75);
  loaded.findUserById('250692').firstName = 'Updated'; assert.equal(r.getRequestSummary().requester, 'Updated Marainump');
});
test('Distinction: loaded Assigned request remains usable by its restored Technician', async t => {
  const dir = await temporary(t); const store = new JsonStore(path.join(dir, 'data.json')); const m = fixture(); assign(m); await store.save(m);
  const loaded = await store.load(); loaded.startWork('REQ001', 'TECH001'); assert.equal(loaded.findRequestById('REQ001').status, 'In Progress');
});
test('Distinction: missing file returns null; malformed JSON is not overwritten', async t => {
  const dir = await temporary(t); const file = path.join(dir, 'data.json'); const store = new JsonStore(file); assert.equal(await store.load(), null);
  await fs.writeFile(file, '{broken'); await assert.rejects(store.load(), /invalid/); assert.equal(await fs.readFile(file, 'utf8'), '{broken');
});
test('Distinction: unsupported version, duplicate IDs and unknown references rejected', () => {
  const data = fixture().toJSON(); assert.throws(() => Manager.fromJSON({ ...data, schemaVersion: 99 }));
  const duplicate = structuredClone(data); duplicate.users.push(duplicate.users[0]); assert.throws(() => Manager.fromJSON(duplicate), /Duplicate/);
  const missing = structuredClone(data); missing.requests[0].requesterId = 'missing'; assert.throws(() => Manager.fromJSON(missing), /unknown/);
  const duplicateRequest = structuredClone(data); duplicateRequest.requests.push(duplicateRequest.requests[0]); assert.throws(() => Manager.fromJSON(duplicateRequest), /Duplicate/);
});
test('Distinction: malformed audit and unsupported saved status rejected', () => {
  const data = fixture().toJSON(); data.requests[0].status = 'Closed'; assert.throws(() => Manager.fromJSON(data));
  const missingHistory = fixture().toJSON(); missingHistory.requests[0].history = []; assert.throws(() => Manager.fromJSON(missingHistory));
});
test('Distinction: forged audit role or workflow actor rejected', () => {
  const m = fixture(); finish(m); const data = m.toJSON(); const close = data.requests[0].history.at(-1);
  close.actorId = '250692'; close.actorRole = 'Student'; assert.throws(() => Manager.fromJSON(data), /Service Officer/);
});
test('Distinction: successful save is complete and leaves no temporary files', async t => {
  const dir = await temporary(t); const store = new JsonStore(path.join(dir, 'data.json')); await store.save(fixture());
  assert.deepEqual(await fs.readdir(dir), ['data.json']); assert.equal(JSON.parse(await fs.readFile(store.filePath, 'utf8')).schemaVersion, 1);
});
test('Distinction: failed save to directory target preserves existing target and cleans temp file', async t => {
  const dir = await temporary(t); const target = path.join(dir, 'target'); await fs.mkdir(target); await fs.writeFile(path.join(target, 'keep.txt'), 'keep');
  await assert.rejects(new JsonStore(target).save(fixture()), /Could not save/);
  assert.equal(await fs.readFile(path.join(target, 'keep.txt'), 'utf8'), 'keep'); assert.deepEqual(await fs.readdir(dir), ['target']);
});
test('Distinction: JSON saving rejects Pass/Credit managers', async t => {
  const dir = await temporary(t); const store = new JsonStore(path.join(dir, 'data.json'));
  await assert.rejects(store.save(fixture('pass')), /only in Distinction/); await assert.rejects(store.save(fixture('credit')));
  assert.equal(await store.load(), null);
});
function cli(args, lines) {
  const r = spawnSync(process.execPath, [path.join(__dirname, '../CampusServiceApp.js'), ...args], { input: lines.join('\n') + '\n', encoding: 'utf8', timeout: 10000 });
  assert.equal(r.status, 0, r.stderr); assert.equal(r.error, undefined); return r.stdout;
}
test('Actual Pass console: register, submit, update, search, cancel and summary', async t => {
  const dir = await temporary(t); const file = path.join(dir, 'must-not-exist.json');
  const output = cli(['--level=pass', `--data=${file}`], ['1', '1', '250692', 'Taisen', 'Marainump', 'taisen@example.test', '2', 'REQ100', 'Chair setup', 'Need chairs for event', 'Hall', '4', '2', '6', 'REQ100', '1', 'Updated chair setup', '8', 'Updated', '7', 'REQ100', 'Event postponed', '9', '10']);
  assert.match(output, /submitted. Status: Submitted/); assert.match(output, /Request updated/); assert.match(output, /Request cancelled/); assert.doesNotMatch(output, /ERROR:/);
  await assert.rejects(fs.access(file));
});
test('Actual Credit console: role switching completes the full lifecycle', () => {
  const output = cli(['--level=credit', '--seed-demo'], ['11', 'OFF001', '12', 'REQ001', 'Verified issue', '13', 'REQ001', '4', 'Urgent verified', '14', 'REQ001', 'TECH001', 'Assigned', '11', 'TECH001', '15', 'REQ001', 'Starting repair', '16', 'REQ001', 'Inspected cable', '17', 'REQ001', 'Replaced cable', '11', 'OFF001', '18', 'REQ001', 'Verified with requester', '3', 'REQ001', '10']);
  assert.match(output, /Status: Closed/); assert.match(output, /Verified and Closed/); assert.doesNotMatch(output, /ERROR:/);
});
test('Actual Distinction console: seeded data save, reload and reporting', async t => {
  const dir = await temporary(t); const file = path.join(dir, 'data.json');
  const output = cli(['--seed-demo', `--data=${file}`], ['11', 'ADM001', '20', '21', 'RELOAD', '22', '23', '10']);
  assert.match(output, /JSON saved/); assert.match(output, /JSON reloaded/); assert.match(output, /Management Summary/); assert.doesNotMatch(output, /ERROR:/);
  const loaded = await new JsonStore(file).load(); assert.equal(loaded.getUsers().length, 6);
});
test('Actual Distinction startup: corrupt data exits without changing original', async t => {
  const dir = await temporary(t); const file = path.join(dir, 'data.json'); await fs.writeFile(file, 'broken');
  const r = spawnSync(process.execPath, [path.join(__dirname, '../CampusServiceApp.js'), `--data=${file}`, '--seed-demo'], { input: '10\n', encoding: 'utf8', timeout: 10000 });
  assert.equal(r.status, 1); assert.match(r.stderr, /STARTUP ERROR/); assert.equal(await fs.readFile(file, 'utf8'), 'broken');
});
