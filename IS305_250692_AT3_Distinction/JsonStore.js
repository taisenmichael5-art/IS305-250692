// Abstract storage contract; FourFileStore supplies the required four-file implementation.
class StorageAdapter {
  constructor() { if (new.target === StorageAdapter) throw new Error('StorageAdapter is abstract.'); }
  async load() { throw new Error('Subclasses must implement load().'); }
  async save() { throw new Error('Subclasses must implement save().'); }
}
module.exports = { StorageAdapter };
