const { CATEGORIES, PRIORITIES, STATUSES } = require('./constants');
class RequestReport {
  constructor() { if (new.target === RequestReport) throw new Error('RequestReport is abstract.'); }
  generate() { throw new Error('Subclasses must implement generate().'); }
}
class SummaryReport extends RequestReport {
  generate(requests) {
    const count = (key, values) => Object.fromEntries(values.map(value => [value, requests.filter(r => r[key] === value).length]));
    return { report: 'Management Summary', total: requests.length, byStatus: count('status', STATUSES), byCategory: count('category', CATEGORIES), byPriority: count('priority', PRIORITIES),
      open: requests.filter(r => !['Closed', 'Cancelled'].includes(r.status)).length,
      technicianWorkload: requests.filter(r => r.assignedTechnician && !['Closed', 'Cancelled'].includes(r.status)).reduce((result, r) => { const id = r.assignedTechnician.userId; result[id] = (result[id] || 0) + 1; return result; }, {}) };
  }
}
class ResolutionReport extends RequestReport {
  generate(requests, now = new Date()) {
    if (Number.isNaN(now.getTime())) throw new Error('Invalid reporting time.');
    const rows = requests.map(r => {
      const resolved = r.getHistory().find(h => h.newStatus === 'Resolved' && h.previousStatus !== 'Resolved');
      const end = resolved ? new Date(resolved.timestamp) : now;
      const hours = Math.max(0, (end - new Date(r.dateSubmitted)) / 3600000);
      const target = r.getTargetResolutionHours(); // Polymorphic class-specific target.
      return { requestId: r.requestId, status: r.status, targetHours: target, elapsedHours: Number(hours.toFixed(2)),
        outcome: r.status === 'Cancelled' ? 'Excluded: Cancelled' : resolved ? (hours <= target ? 'Resolved within target' : 'Resolved beyond target') : (hours > target ? 'Open beyond target' : 'Open within target') };
    });
    return { report: 'Resolution Targets', note: 'Targets are illustrative academic assumptions, not DWU service commitments.', rows };
  }
}
class PriorityReport extends RequestReport {
  generate(requests) { return { report: 'Polymorphic Priority Queue', rows: [...requests].filter(r => !['Closed', 'Cancelled'].includes(r.status)).sort((a, b) => b.calculatePriorityScore() - a.calculatePriorityScore()).map(r => r.getRequestSummary()) }; }
}
module.exports = { RequestReport, SummaryReport, ResolutionReport, PriorityReport };
