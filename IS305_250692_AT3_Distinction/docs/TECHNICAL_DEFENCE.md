# Technical defence and demonstration
Taisen Marainump | 250692 | IS305 AT3

## Prepare
Run npm test from this project folder, then:
```powershell
node CampusServiceApp.js --seed-demo --data-dir=data/practice
```
Use one application process. This practice folder is separate from the four normal files. Select option 11 and an ID to switch simulated roles.

## Demonstrate in order
1. As 250692, inspect own requests with 4; submit a new request with 2, edit with 6 and cancel with 7. Attempt cancellation again and explain rejection.
2. As OFF001, review REQ001 with 12, set priority with 13 and assign TECH001 with 14.
3. As TECH002, try beginning REQ001 and explain the denied assignment check.
4. As TECH001, begin with 15, add a note with 16 and resolve with 17.
5. As OFF001, verify/close with 18, inspect specialised details/history with 3 and filter/sort with 19.
6. As ADM001, show four report implementations with 22, audit with 23 and all three polymorphic calls with 25.
7. Exit with 10. Restart with the same --data-dir argument; inspect the restored request and show it remains Closed. Open all four practice JSON files in VS Code and explain the plain records.
8. Explain invalid-file errors and interrupted-save recovery using the tests, without editing normal application records during the demonstration.

## Explain the code
| Concept | Where to show | Explanation |
|---|---|---|
| Encapsulation | User.js; ServiceRequest.js | # fields cannot be assigned from outside; controlled methods validate changes |
| Constructors / this | Domain constructors | this identifies the current instance; constructors initialise validated state |
| Constructor chaining | UserRoles.js; SpecialisedRequests.js | super() initialises inherited state before specialised fields |
| Composition | Request requester / assignedTechnician | A request holds shared real User objects rather than duplicated names |
| Abstraction | ServiceRequest required methods | Default required methods throw; concrete subclasses supply their behaviour |
| Overriding | ICT/Maintenance/Cleaning methods | Same method names compute different summaries, scores and target hours |
| Polymorphism | App option 25; report loop | Same calls dispatch to each concrete object's implementation |
| Workflow | Manager wrappers and request lifecycle methods | Registered actor, role, assignment, status and valid comment must all pass |
| Repository | FileRepositories.js | File I/O and plain-record validation are separated from domain/menu |
| Factory | ServiceRequestFactory.js | Saved requestType selects the correct class; user references and history are restored |
| Persistence | FourFileStore.js | Four files, validated snapshot, journal, per-file rename and recovery |
| Audit | Manager #auditRequest / validation | Approved actions receive unique IDs; registrations and request histories are persisted |
| Reports | Reports.js | filter/map/reduce/sort calculate counts, queues, assignments and durations |
| Tests | tests/*.test.js | node:test and assert check successful results, rejected changes and isolated I/O |

## Run selected tests
```powershell
npm run test:distinction
node --test --test-name-pattern="polymorphic|restores|four named" tests/distinction.test.js
```
Do not run a test command while the interactive menu is waiting for input; exit first or open another terminal. Tests use OS temporary directories and clean them up.

## Questions to practise
- Why does JSON.parse alone not restore class methods? It produces plain objects; factories construct real instances.
- Why are histories separate from audit? History belongs to each request; audit also records registration and approved system actions.
- Why do invalid actions not save? Domain validation throws before mutation; the menu saves only after successful actions.
- Why is average resolution time null for no completed records? There is no meaningful average; division by zero is avoided.
- Why can another technician not work on an assignment? The acting registered object must equal the request's assigned technician.
- What happens after a failed save? The prior files are restored; changed session objects remain available and an administrator can retry.
- What would you change for a new request category? Add a concrete subclass, validate its fields, update category/factory/repository handling and add behavioural tests.

Practise explaining and editing a small feature yourself, such as a report heading or the illustrative subtype score adjustment. Re-run the relevant tests after a change. Describe the final implementation in your own words.
