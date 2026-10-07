# IS305 AT3 — Pass Component
Taisen Marainump | 250692 | Divine Word University

This is a Pass checkpoint of the same Campus Service Request application. The existing supporting modules remain included so later Credit and Distinction features extend this foundation. The default application runs Pass mode and uses only objects and arrays in memory. No data is saved after exit.

## Run in the VS Code PowerShell terminal
```powershell
cd "C:\Users\ID250692\Downloads\IS305_250692_AT3_Pass"
npm test
npm start
```
Node.js 22+ required. No npm install is needed. Register a user using option 1, then submit a request using option 2. Option 10 exits. Optional option 11 selects a registered user for ownership checks. `npm run start:demo-data` starts with synthetic in-memory examples; it does not save JSON in Pass mode.

## Required menu
1. Register User
2. Submit Service Request
3. View Request by ID
4. View My Requests
5. View All Requests
6. Update My Request
7. Cancel My Request
8. Search Requests
9. View Request Summary
10. Exit

My Requests and search show the selected user's requests. View All Requests shows every request in the Pass classroom dataset. Summary counts Submitted and Cancelled. Editing/cancelling requires the owner and Submitted status; cancellation is final. IDs and user type cannot be altered after creation. Names/email use validated setters, and request details use updateDetails(). The requester is a real registered User object.

## Requirement checklist
All five required files are included: User.js, ServiceRequest.js, ServiceRequestManager.js, CampusServiceApp.js and README.md. Private fields, constructors, getters, controlled setters, getFullName(), validate(), displayInfo(), updateDetails(), cancelRequest() and getRequestSummary() are implemented. Manager provides all ten required methods using arrays. Four required categories and priorities are supported. Default request status is Submitted.

Validation rejects missing IDs/names/title/description/location, invalid email/category/priority, duplicate IDs, another user's update/cancellation and repeated cancellation. Failed changes preserve existing state. The 14 Pass tests cover all six listed assessment cases plus additional negative cases. TEST_RESULTS.txt contains actual results.

## Manual workflow
Register Student ID 250692, first name Taisen, last name Marainump, email taisen@example.test. Submit REQ100 with title Network unavailable, description Cannot connect to the campus network, location LAB 131, category ICT Support, priority High. Use 3 to view REQ100, 4 to view own records, 5 to view all, 8 to search network, 6 to change its title, 7 to cancel and 9 to view counts. Try cancelling it again: the application must reject the action. Register another user and attempt to modify the first user's request: that action is rejected too.

## GitHub
Keep this checkpoint in its own folder within your existing IS305 repository. After testing, from the repository root:
```powershell
git add -- IS305_250692_AT3_Pass
git diff --cached --stat
git commit -m "Complete AT3 Pass core service request workflow"
git push
```
Press q if Git displays (END). Supporting source modules for later extensions are included; Pass is the default in this checkpoint. The full major project ZIP remains a separate deliverable.
