const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const V = require('./validation');
function dataOnly(value) {
  if (Array.isArray(value)) return value.forEach(dataOnly);
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (/password|secret|token|executable|javascript/i.test(key)) throw new Error('Data files must not contain credentials or executable code.');
      dataOnly(child);
    }
  } else if (!['string', 'number', 'boolean'].includes(typeof value) && value !== null) throw new Error('Only plain JSON data is allowed.');
}
class FileRepository {
  constructor(file, idField) { this.file = path.resolve(file); this.idField = idField; }
  validateRecords(records) {
    if (!Array.isArray(records)) throw new Error('Records must be a JSON array.'); dataOnly(records);
    const ids = new Set();
    for (const r of records) {
      if (!r || typeof r !== 'object' || Array.isArray(r)) throw new Error('Each record must be an object.');
      V.text(r[this.idField], this.idField); const id = r[this.idField].toLowerCase();
      if (ids.has(id)) throw new Error(`Duplicate ${this.idField}.`); ids.add(id); this.validateRecord(r);
    }
    return records;
  }
  validateRecord() { throw new Error('Repository subclasses must implement validateRecord().'); }
  async loadAll() {
    let raw;
    try { raw = await fs.readFile(this.file, 'utf8'); }
    catch (error) { if (error.code === 'ENOENT') return []; throw new Error(`Could not read ${path.basename(this.file)}: ${error.message}`); }
    try { return this.validateRecords(raw.trim() ? JSON.parse(raw) : []); }
    catch (error) { throw new Error(`Invalid ${path.basename(this.file)}: ${error.message}`); }
  }
  async saveAll(records) {
    this.validateRecords(records); const temp = this.file + '.' + randomUUID() + '.tmp';
    try { await fs.mkdir(path.dirname(this.file), { recursive: true }); await fs.writeFile(temp, JSON.stringify(records, null, 2) + '\n', { flag: 'wx' }); await fs.rename(temp, this.file); }
    catch (error) { await fs.rm(temp, { force: true }).catch(() => {}); throw new Error(`Could not write ${path.basename(this.file)}: ${error.message}`); }
  }
  async findById(id) { return (await this.loadAll()).find(r => r[this.idField].toLowerCase() === String(id).toLowerCase()) || null; }
  async create(record) { const records = await this.loadAll(); records.push(record); await this.saveAll(records); return record; }
  async update(id, changes) {
    if (!changes || typeof changes !== 'object' || Array.isArray(changes) || Object.hasOwn(changes, this.idField)) throw new Error('Invalid update or immutable identifier.');
    const records = await this.loadAll(); const index = records.findIndex(r => r[this.idField].toLowerCase() === String(id).toLowerCase());
    if (index < 0) throw new Error('Record not found.'); records[index] = { ...records[index], ...changes }; await this.saveAll(records); return records[index];
  }
}
class UserFileRepository extends FileRepository {
  constructor(folder) { super(path.join(folder, 'users.json'), 'userId'); }
  validateRecord(record) { require('./UserRoles').userFromJSON(record); }
}
class ServiceRequestFileRepository extends FileRepository {
  constructor(folder) { super(path.join(folder, 'serviceRequests.json'), 'requestId'); }
  validateRecord(r) {
    V.id(r.requestId); V.id(r.requesterId); V.text(r.title, 'Title'); V.text(r.description, 'Description'); V.text(r.campusLocation, 'Location');
    const { CATEGORIES, PRIORITIES, STATUSES } = require('./constants'); V.choice(r.category, CATEGORIES); V.choice(r.priority, PRIORITIES); V.choice(r.status, STATUSES);
    V.choice(r.requestType, ['ICTSupportRequest', 'MaintenanceRequest', 'CleaningRequest', 'GeneralServiceRequest', 'BasicServiceRequest']);
    V.iso(r.dateSubmitted); V.iso(r.dateUpdated); if (r.assignedTechnicianId !== null) V.id(r.assignedTechnicianId);
  }
  async findByRequester(id) { return (await this.loadAll()).filter(r => r.requesterId === id); }
  async findByTechnician(id) { return (await this.loadAll()).filter(r => r.assignedTechnicianId === id); }
}
class RequestHistoryFileRepository extends FileRepository {
  constructor(folder) { super(path.join(folder, 'requestHistory.json'), 'requestId'); }
  validateRecord(r) {
    V.id(r.requestId); if (!Array.isArray(r.history) || !r.history.length) throw new Error('Request history must be nonempty.');
    for (const h of r.history) { V.id(h.actorId); V.text(h.action); V.text(h.comment); V.iso(h.timestamp); }
  }
}
class AuditFileRepository extends FileRepository {
  constructor(folder) { super(path.join(folder, 'auditLog.json'), 'auditId'); }
  validateRecord(r) { V.text(r.auditId); V.id(r.actorId); V.text(r.actorRole); V.text(r.action); V.text(r.description); V.iso(r.timestamp); if (r.outcome !== 'Approved') throw new Error('Invalid audit outcome.'); if (r.requestId !== null) V.id(r.requestId); }
}
module.exports = { FileRepository, UserFileRepository, ServiceRequestFileRepository, RequestHistoryFileRepository, AuditFileRepository };
