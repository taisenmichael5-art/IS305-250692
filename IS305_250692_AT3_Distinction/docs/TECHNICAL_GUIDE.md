# Technical guide — complete AT3
Taisen Marainump | 250692

## Source responsibilities
| File | Responsibility |
|---|---|
| User.js | Private user fields, controlled setters, validation and display |
| UserRoles.js | Required User subclasses, super() chaining and user hydration |
| ServiceRequest.js | Abstract-style request contract, private common state, controlled lifecycle/history |
| SpecialisedRequests.js | Three required concrete specialised classes, concrete Pass/general types, construction helpers |
| ServiceRequestManager.js | Related-object arrays, validation, role orchestration, queries and approved audit entries |
| CampusServiceApp.js | Console input, menus, actor selection and storage coordination; no fs calls |
| FileRepositories.js | Four file repository classes, validation, load/save/create/find/update |
| FourFileStore.js | Consistent four-file snapshots, factory restoration and interrupted-save recovery |
| ServiceRequestFactory.js | createFromData(savedData, users, history), specialised object recreation |
| JsonStore.js | Abstract StorageAdapter contract only; no single-file persistence implementation |
| Reports.js | Abstract RequestReport and Summary/Resolution/Priority/Operations implementations |
| constants.js / validation.js | Supported values and reusable validation |
| demoData.js | Synthetic classroom examples using actual domain classes |
| tests | 53 behavioural and console tests with temporary files |

## Detailed Distinction requirement mapping
| Requirement | Implemented behaviour / evidence |
|---|---|
| 1 Polymorphism | One manager collection; option 25 calls all three required methods for each instance; polymorphic-method test |
| 2 Abstract ServiceRequest | Required methods throw unless implemented; incomplete-subclass test; concrete Basic/General types preserve foundation |
| 3 JSON persistence | Four named data files; startup loading; empty/missing handling; approved autosave; validation and readable errors |
| 4 Repositories | User/ServiceRequest/RequestHistory/Audit repositories; loadAll/saveAll/create/findById/update; requester/technician query methods |
| 5 Factory | ServiceRequestFactory.createFromData restores correct subclass, private state and shared references |
| 6 Audit | Unique ID, actor, action, request or user reference, description, ISO timestamp, outcome; all required approved actions |
| 7 Reports | All nine suggested report views, using filter/map/reduce/sort; at least four concrete report implementations |
| 8 Tests | 53 total, including all specified coverage and temporary isolated file operations |
| 9 Defence | TECHNICAL_DEFENCE.md and menu 25 support demonstration and explanations |

## Four-file data contract
All files contain arrays. users.json stores explicit className and constructor fields. serviceRequests.json stores requestType, requestId/requesterId, common validated fields, specialisedData, assignedTechnicianId, status and ISO dates. requestHistory.json stores one record per request: {requestId, history:[...]}. auditLog.json stores a flat array of approved audit entries. IDs/references and histories are checked together, not just parsed independently.

Storage loads user records first, creates User subclasses, associates each request with its separate history, and calls the request factory. Manager validation restores shared relationships, validates class/category matching, complete lifecycle transitions and audit agreement. Loading returns a new manager only after every check succeeds. Missing files return empty arrays; missing parts of a nonempty dataset fail cross-file validation. Whitespace/zero-byte files are treated as empty. Malformed JSON remains unchanged.

## Save transaction and limits
Manager snapshots use explicit serializers because private fields are not automatically exposed by JSON.stringify. Validate the snapshot and each repository array before writing. Save old file contents in a recovery journal, write each file using temporary-file/rename, then remove the journal. On a write failure, restore every previous file. On interrupted save, the next load/save restores the previous complete dataset before proceeding. Failure to recover is clearly reported; never manually delete a pending journal merely to silence the error. Concurrent writers and distributed storage are outside this single-process application scope.

Repository CRUD methods are low-level plain-data operations. The console uses Manager + FourFileStore so cross-file validation and domain permissions apply. Use manager methods for domain changes; direct request mutations outside the manager will lack matching audit entries and are rejected by snapshot validation before saving. Invalid actions do not log an Approved audit record.

## Reports
Summary groups all records by status/category/priority. Operations lists open Urgent and overdue requests, historical assignments by technician, completed counts by technician and volume by location. Completed means Resolved/Closed. Average duration uses submission-to-first-resolution timestamps; no completions gives null. ResolutionReport preserves historical elapsed time after closure. PriorityReport uses subtype score. Priority sort in the manager sorts enum rank first and subtype score as a tie breaker. Date sort compares valid ISO timestamps. Targets are illustrative academic assumptions.

## Compatibility
Pass/Credit run in memory within this same source tree. ServiceRequest is now an abstract-style contract; BasicServiceRequest is its concrete Pass implementation, and GeneralServiceRequest covers General Campus Service. Advanced specialised classes retain super() constructor chaining. Earlier single-file snapshots are not automatically migrated: use this edition's four-file data folder. No passwords or real authentication are implemented; users switch simulated classroom roles.
