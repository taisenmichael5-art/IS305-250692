# IS305 AT3 — Credit Extension
Taisen Marainump | 250692 | Divine Word University

This checkpoint extends the same working Pass application. Credit is the default operating mode. Users and requests are real JavaScript class instances managed in arrays. Data remains in memory and clears when you exit; no database or JSON persistence is used in Credit mode.

## Run in VS Code → Terminal → New Terminal (PowerShell)
```powershell
cd "C:\Users\ID250692\Downloads\IS305_250692_AT3_Credit"
npm test
npm run start:demo-data
```
Node.js 22+ required. No npm install is needed. `npm start` runs an empty session for registration practice. Option 10 exits. Option 11 switches registered simulated users; it is a classroom role simulation, not password authentication. `npm run start:pass` still runs the retained Pass foundation.

## Demo users
| ID | Role |
|---|---|
| 250692 | Student: Taisen Marainump |
| STF001 | Staff requester |
| OFF001 | Service Officer |
| TECH001 | ICT Technician |
| TECH002 | Facilities/Cleaning Technician |
| ADM001 | Administrator (used by later extensions) |

Other demo people and all example.test email addresses are synthetic.

## Demonstrate the complete workflow
Start with `npm run start:demo-data`. Enter each option and then answer its prompts:

| Active user | Option | Request/other inputs | Result |
|---|---|---|---|
| Switch using 11 | OFF001 | — | Officer selected |
| OFF001 | 12 | REQ001; Verified network issue | Reviewed |
| OFF001 | 13 | REQ001; 4 (Urgent); Campus impact assessed | Priority updated |
| OFF001 | 14 | REQ001; TECH001; Assigned to ICT technician | Assigned |
| Switch using 11 | TECH001 | — | Technician selected |
| TECH001 | 15 | REQ001; Starting inspection | In Progress |
| TECH001 | 16 | REQ001; Cable fault identified | Progress recorded |
| TECH001 | 17 | REQ001; Cable replaced and connection tested | Resolved |
| Switch using 11 | OFF001 | — | Officer selected |
| OFF001 | 18 | REQ001; Verified service restored | Closed |
| OFF001 | 3 | REQ001 | Specialised summary and complete history |

Before the technician begins, try switching to TECH002 and starting REQ001: the request is rejected because TECH002 is not assigned. Try closing a Submitted request or resolving before beginning work: invalid transitions are rejected. Requesters can edit/cancel only their own Submitted requests. Cancelled and Closed requests cannot restart.

## Inheritance and specialised behaviour
User.js is the base. UserRoles.js defines StudentRequester (programme/yearLevel), StaffRequester (department), ServiceOfficer (serviceSection), Technician (technicalSpeciality) and Administrator. Every constructor calls super(). User IDs and roles are fixed; names/email have controlled setters.

ServiceRequest.js is the base. SpecialisedRequests.js defines:
- ICTSupportRequest: deviceType, systemName, faultType, networkImpact.
- MaintenanceRequest: building, roomNumber, hazardLevel, equipmentAffected.
- CleaningRequest: cleaningArea, hygieneRisk, serviceType, preferredServiceTime.

Each calls super(commonRequestData), validates its specialised data and overrides getRequestSummary(), calculatePriorityScore(), getTargetResolutionHours() and validateSpecialisedFields(). Submission selects and instantiates the correct class in the working menu. General Campus Service uses ServiceRequest. Private fields and defensive copies protect state. Category and specialised details are fixed after submission; common fields may be updated while Submitted.

All four required categories and priorities remain supported. Status flow is Submitted → Reviewed → Assigned → In Progress → Resolved → Closed. Cancelled is final. Officers review, set priority, assign and close; only the assigned technician begins, adds progress and resolves. An administrator is not automatically permitted to perform an officer action.

## Search, filter, sort and history
Option 8 searches ID/title; option 19 filters category, status, priority and technician, then sorts date submitted or priority ascending/descending. Enter at optional prompts means any value. Requester visibility is own requests, technician visibility is assigned requests, officer/administrator visibility is all records. Option 4 remains own requester records.

Each accepted request action records previousStatus, newStatus, action, actorId, actorRole, comment and timestamp in a private history array. Dates use ISO UTC. Option 3 displays history. Invalid actions leave state/history unchanged. Priority sort uses enum rank first, subtype risk score as a tie breaker. Resolution targets and subtype risk adjustments are illustrative academic design choices, not official DWU promises.

## Verification and requirement mapping
`npm test` runs 26 tests: 14 Pass foundation and 12 Credit tests. TEST_RESULTS.txt contains actual output. Required Credit coverage includes subclass inheritance/constructor initialisation, specialised validation, officer-only assignment, assigned technician-only progress, rejected invalid transitions, subtype summaries, filter/sort and approved history. An additional real console workflow was executed successfully; examples/CREDIT_WORKFLOW_OUTPUT.txt records its actual output.

Core required files remain User.js, ServiceRequest.js, ServiceRequestManager.js and CampusServiceApp.js. Supporting factories, validation, constants and demo modules keep the same application organised. Reports.js and JsonStore.js are retained for later Distinction extension, but are not activated in Credit mode.

## Commit and push
Copy this folder into your existing IS305 repository alongside the earlier checkpoints. From the repository root:
```powershell
git add -- IS305_250692_AT3_Credit
git diff --cached --stat
git commit -m "Complete AT3 Credit specialised requests and role workflows"
git push
```
Press q if Git shows (END). Check GitHub for the uploaded folder and commit. Test again from the copied folder before committing. Keep this checkpoint separate from the previous Pass ZIP and the full major project ZIP.
