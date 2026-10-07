# IS305 AT3 — Complete Distinction Extension
**Divine Word University | Taisen Marainump | Student ID 250692**

A complete Node.js console system extending the same Pass and Credit foundation. This edition implements the detailed Distinction instructions: abstract-style ServiceRequest methods, polymorphic requests, four JSON files, repository/factory separation, complete audit records, reports and automated tests. No database or third-party runtime dependency is used.

## Start in VS Code's PowerShell terminal
Extract this project folder into Downloads, open it in VS Code, then choose Terminal → New Terminal:
```powershell
cd "C:\Users\ID250692\Downloads\IS305_250692_AT3_Distinction"
node --version
npm test
npm run start:demo-data
```
Node.js 22+ required. `npm install` is unnecessary. Commands must run from the folder containing package.json. Use the terminal rather than the Debug Console or Node REPL. `npm start` runs without seeding; an empty dataset requires registration using option 1. Option 10 exits.

## Select a simulated user
Option 11 switches to an existing user ID. All demo records are simulated; user selection is a classroom role simulation, not password authentication.

| ID | Role | Main tasks |
|---|---|---|
| 250692 | Student: Taisen Marainump | Submit, view own records, edit/cancel own Submitted requests |
| STF001 | Staff requester | Submit and monitor own requests |
| OFF001 | Service Officer | Review, prioritise, assign, verify/close and reports |
| TECH001 | ICT Technician | Begin, record progress and resolve assigned work |
| TECH002 | Facilities/Cleaning Technician | Begin, record progress and resolve assigned work |
| ADM001 | Administrator | Save/reload, global audit and management reports |

Demo seeding runs only when storage is empty. Existing data is loaded and retained. For separate practice data:
```powershell
node CampusServiceApp.js --seed-demo --data-dir=data/practice
```
The --data-dir argument names a folder, not one JSON file. Earlier single-file editions are separate checkpoints; their data is not automatically imported into this four-file edition.

## Progressive modes
- `npm run start:pass`: the same core workflow in memory, with only Submitted/Cancelled summary statuses.
- `npm run start:credit`: specialised classes and role workflows in memory.
- `npm start`: complete Distinction mode with automatic JSON persistence.
- `npm run demo:pass`, `npm run demo:credit`, `npm run demo:distinction`: noninteractive in-memory demonstrations without reading/writing application data.

The original menu options 1–10 remain. Advanced workflow options are 12–18. Option 19 filters/sorts; 24 reviews user records. Distinction adds 20 save, 21 reload (type RELOAD), 22 management reports, 23 audit and 25 polymorphic method demonstration. Save/reload/global audit require Administrator; reports and the polymorphism demonstration require Officer or Administrator. Pass View All shows all classroom requests. Credit/Distinction views follow role scope: requester own, technician assigned, officer/administrator all.

## Controlled workflow
Submitted → Reviewed → Assigned → In Progress → Resolved → Closed. Cancelled is final.

Requester edits/cancellations require ownership and Submitted status. Officers alone review, assign priority while Reviewed, assign technicians and close Resolved requests. Only the assigned technician may begin work, add progress notes or resolve. Invalid transitions, actors, values or duplicate IDs raise clear errors without changing state or history.

Use option 11 to select OFF001; use 12 to review REQ001, 13 to choose a priority, 14 to assign TECH001. Select TECH001; use 15 to begin, 16 for progress, 17 to resolve. Select OFF001; use 18 to verify/close. Enter a meaningful comment at each prompt. Use 3 to inspect the summary and history. Select ADM001; use 22 for reports, 23 for audit and 25 to show all three polymorphic request methods.

## OOP and storage
Private # fields encapsulate User and ServiceRequest state. StudentRequester, StaffRequester, ServiceOfficer and Technician extend User with super(), validation and specialised fields. ICTSupportRequest, MaintenanceRequest and CleaningRequest extend ServiceRequest and implement its required abstract-style methods. Unimplemented calculatePriorityScore(), getTargetResolutionHours() or getRequestSummary() throws a clear error. Shared protected-style helper methods provide reusable calculations without replacing the abstract contract. BasicServiceRequest implements the concrete Pass behaviour; GeneralServiceRequest implements the fourth category.

The manager stores real related objects in arrays. Requester/technician references are shared registered User objects. JSON stores plain data; ServiceRequestFactory.createFromData() recreates the correct subclass and restores validated lifecycle/history. Domain and console code do not perform JSON file reads/writes. FileRepositories.js contains UserFileRepository, ServiceRequestFileRepository, RequestHistoryFileRepository and AuditFileRepository. FourFileStore coordinates validated snapshots and recovery across those repositories.

Required files in data: users.json, serviceRequests.json, requestHistory.json, auditLog.json. Each initially contains []. Missing/empty files load empty arrays; inconsistent nonempty datasets are rejected. Approved registration/submission/updates/status changes are automatically saved. Reload validates all files before replacing the session. Invalid files are preserved and reported. Per-file writes use temporary files and rename; a plain-data recovery journal restores the prior complete dataset after an interrupted or failed four-file save. Run one application process at a time. If saving fails, changes remain in memory; retry with administrator option 20 before exit.

JSON data must remain simulated: no passwords, executable JavaScript or confidential information. Repository validation rejects credential/executable fields. The four normal data files are included and can be committed with simulated records; inspect them before committing. Practice data/recovery/temp files are ignored by Git.

## Audit and reports
Audit entries contain unique auditId, actorId/role, action, affected requestId (null for registration), description, ISO UTC timestamp and Approved outcome. Registration also identifies the affected user. Request creation/update/priority/assignment/status/progress/cancellation/resolution/closure are logged after approval. Request histories and audit entries are checked for consistency during loading. Returned arrays/history/audit records are copies.

Four report implementations use the same generate() interface. Together they provide all nine listed report views: status, category and priority groups; urgent; overdue; assignment by technician; completed by technician; average resolution time; volume by location. PriorityReport adds a polymorphic risk queue. Resolution time is submission to first resolution; completed means Resolved or Closed. Empty completion sets yield null, avoiding division by zero. Overdue excludes Resolved/Closed/Cancelled. Target hours (120/72/24/8 by priority, with subtype risk adjustments) are illustrative academic design values, not official DWU promises.

## Verification and documentation
53 automated tests passed: 14 Pass, 12 Credit and 27 Distinction/console tests. Tests use temporary directories and never overwrite normal data. Coverage includes invalid constructors, duplicates, roles/statuses, subclass behaviour, polymorphism, four-file save/load/restoration, empty/missing/corrupt files, real I/O errors, rollback/recovery and report calculations. Actual output is in TEST_RESULTS.txt; runnable demo and console evidence is in examples.

See docs/TECHNICAL_GUIDE.md for source/schema/requirements mapping, docs/TECHNICAL_DEFENCE.md for the demonstration checklist, docs/GITHUB_AND_MOODLE.md for Windows commit/push instructions and docs/PROJECT_REPORT.docx or .pdf for the implementation report. This edition follows the full Pass/Credit/Distinction instructions supplied in the conversation.
