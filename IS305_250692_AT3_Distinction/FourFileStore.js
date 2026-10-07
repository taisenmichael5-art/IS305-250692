const fs = require('node:fs/promises');
const path = require('node:path');
const { StorageAdapter } = require('./JsonStore');
const Manager = require('./ServiceRequestManager');
const Factory = require('./ServiceRequestFactory');
const { userFromJSON } = require('./UserRoles');
const { UserFileRepository, ServiceRequestFileRepository, RequestHistoryFileRepository, AuditFileRepository } = require('./FileRepositories');
class FourFileStore extends StorageAdapter {
  constructor(folder) {
    super(); this.folder = path.resolve(folder);
    this.repositories = [new UserFileRepository(this.folder), new ServiceRequestFileRepository(this.folder), new RequestHistoryFileRepository(this.folder), new AuditFileRepository(this.folder)];
    this.journal = path.join(this.folder, '.pending-save.json');
  }
  async #recover() {
    let raw; try { raw = await fs.readFile(this.journal, 'utf8'); } catch (e) { if (e.code === 'ENOENT') return; throw new Error(`Could not read recovery journal: ${e.message}`); }
    try {
      const previous = JSON.parse(raw);
      if (!Array.isArray(previous) || previous.length !== 4 || previous.some(v => v !== null && typeof v !== 'string')) throw new Error('Invalid recovery journal.');
      for (let i = 0; i < 4; i++) { const file = this.repositories[i].file; if (previous[i] === null) await fs.rm(file, { force: true }); else await fs.writeFile(file, previous[i], 'utf8'); }
      await fs.rm(this.journal);
    } catch (e) { throw new Error(`Could not recover interrupted save: ${e.message}`); }
  }
  async load() {
    await this.#recover();
    const [users, requests, histories, audit] = await Promise.all(this.repositories.map(r => r.loadAll()));
    if (!users.length && !requests.length && !histories.length && !audit.length) return null;
    try {
      const objects = users.map(userFromJSON);
      if (histories.length !== requests.length) throw new Error('Request and history records disagree.');
      const restored = requests.map(r => {
        const h = histories.find(h => h.requestId === r.requestId); if (!h) throw new Error('Missing request history.');
        return Factory.createFromData(r, objects, h.history);
      });
      return Manager.fromJSON({ schemaVersion: 1, savedAt: new Date().toISOString(), users, requests: restored.map(r => r.toJSON()), audit });
    } catch (e) { throw new Error(`Saved records are invalid; files were not changed. ${e.message}`); }
  }
  async save(manager) {
    if (!(manager instanceof Manager) || manager.level !== 'distinction') throw new Error('JSON saving requires Distinction mode.');
    const snapshot = manager.toJSON(); Manager.fromJSON(snapshot);
    const arrays = [snapshot.users, snapshot.requests.map(r => {
      const { history, className, technicianId, ...rest } = r;
      return { ...rest, requestType: className, assignedTechnicianId: technicianId };
    }), snapshot.requests.map(r => ({ requestId: r.requestId, history: r.history })), snapshot.audit];
    arrays.forEach((records, i) => this.repositories[i].validateRecords(records));
    await fs.mkdir(this.folder, { recursive: true }); await this.#recover();
    const previous = await Promise.all(this.repositories.map(async r => { try { return await fs.readFile(r.file, 'utf8'); } catch (e) { if (e.code === 'ENOENT') return null; throw new Error(`Could not read before save: ${e.message}`); } }));
    // Journal guarantees rollback/recovery of a four-file commit for this single-process console.
    try { await fs.writeFile(this.journal, JSON.stringify(previous), { flag: 'wx' }); }
    catch (e) { throw new Error(`Could not create save recovery journal: ${e.message}`); }
    try { for (let i = 0; i < 4; i++) await this.repositories[i].saveAll(arrays[i]); await fs.rm(this.journal); }
    catch (e) { try { await this.#recover(); } catch (recovery) { throw new Error(`Save failed: ${e.message}. ${recovery.message}`); } throw new Error(`Save failed; previous files restored: ${e.message}`); }
  }
}
module.exports = FourFileStore;
