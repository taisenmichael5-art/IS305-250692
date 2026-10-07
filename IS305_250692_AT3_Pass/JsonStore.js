const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const ServiceRequestManager = require('./ServiceRequestManager');
class StorageAdapter {
  constructor() { if (new.target === StorageAdapter) throw new Error('StorageAdapter is abstract.'); }
  async load() { throw new Error('Subclasses must implement load().'); }
  async save() { throw new Error('Subclasses must implement save().'); }
}
class JsonStore extends StorageAdapter {
  #file;
  constructor(file) { super(); this.#file = path.resolve(file); }
  get filePath() { return this.#file; }
  async load() {
    let raw;
    try { raw = await fs.readFile(this.#file, 'utf8'); }
    catch (error) { if (error.code === 'ENOENT') return null; throw new Error(`Could not read JSON store: ${error.message}`); }
    try { return ServiceRequestManager.fromJSON(JSON.parse(raw)); }
    catch (error) { throw new Error(`JSON data is invalid; original file was not changed. ${error.message}`); }
  }
  async save(manager) {
    if (!(manager instanceof ServiceRequestManager) || manager.level !== 'distinction') throw new Error('JSON saving is available only in Distinction mode.');
    // Validate the entire snapshot before writing; rehydrate a fresh copy for consistency.
    const data = manager.toJSON(); ServiceRequestManager.fromJSON(data);
    const temporary = `${this.#file}.${randomUUID()}.tmp`;
    try {
      await fs.mkdir(path.dirname(this.#file), { recursive: true });
      await fs.writeFile(temporary, JSON.stringify(data, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
      await fs.rename(temporary, this.#file);
    } catch (error) {
      await fs.rm(temporary, { force: true }).catch(() => {});
      throw new Error(`Could not save JSON data: ${error.message}`);
    }
  }
}
module.exports = { StorageAdapter, JsonStore };
