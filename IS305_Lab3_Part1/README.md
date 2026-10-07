# IS305 Lab 3 Part 1 — Dining Account and Rewards Account

**Name:** Taisen Marainump  
**Student ID:** 250692  
**Marks:** 12  
**Checkpoint:** End of class by **10:00 PM**, as specified in this Part 1 brief.

## Important correction to the earlier extension

Use these Part 1 classes for this exact brief. They replace the earlier example's incompatible
account constructors, method names and automatic deposit-bonus policy. Do not combine the two
sets of account classes. The previous Part 2 helper/credit class must also be adapted to this
API once the detailed Part 2 instructions are supplied.

The base signature is `constructor(accountNumber, openingBalance = 0)`.
Payment is `payForMeal(amount, description)`, not `payMeal`.
Rewards use `balance * rewardRate / 100`, where **2.5 means 2.5%**.
A deposit earns no automatic reward. Calculate and apply the reward explicitly.

## Completed source

- DiningAccount.js: required #accountNumber, #balance, #transactions; constructor validation;
  deposit default description; payment validation; safe transaction copies; summary.
- RewardsDiningAccount.js: inherits DiningAccount, calls super(), stores #rewardRate,
  calculates and applies a current-balance reward; overrides account summary/type.
- Part1Demonstration.js: both exact required examples and an optional rejected-payment example.
- Part1.test.js: automated behavioural and validation checks.
- EXPECTED_OUTPUT.txt: actual demonstration output.
- TEST_RESULTS.txt: actual test execution evidence.

The stored #balance uses integer toea; public balances are in kina. Transaction history records
opening balance, deposits and signed meal debits. A reward is recorded through the inherited
deposit method with a clear reward-credit description. History contains plain scalar values and
getTransactions() returns independent copies. Zero rewards return zero without a zero deposit.
Repeated explicit applyReward() calls compound on the new balance: this follows the supplied
formula; no reward-period restriction was specified.

## Run

From inside this directory:

```bash
npm test
npm run demo
npm run demo:rejection
```

No npm install, external dependency or database is required. Tested on Node.js 24.19.0;
package supports Node.js 22+.

## Required numerical results

Standard: K1000 + K500 − K200 = **K1300**.
Rewards: (K1500 + K500) × 2.5 / 100 = **K50** reward; final **K2050**.
Rejected-payment example: K100 balance, attempt K200; clear error and unchanged K100.

## Extend your original DiningApp — not a new application

Your existing Student.js, MealBooking.js and DiningApp.js were not supplied, so they have not
been recreated or overwritten. **The final integrated application and required DiningApp.js
checkpoint change are still pending.** Submit the working Lab 2 files to complete the exact edits.

Copy this IS305_Lab3_Part1 folder alongside your existing Lab 2 folder in IS305-250692.
For an ES-module DiningApp.js in that sibling Lab 2 folder, add this import near the top:

```javascript
import { demonstratePart1 } from '../IS305_Lab3_Part1/Part1Demonstration.js';
```

Call the demonstration once at the start of your existing application, before the existing menu:

```javascript
demonstratePart1();
```

Adjust the relative path if your folders differ. Retain the original DiningApp class, Student and
MealBooking imports, registration, booking array and menu. Part1Demonstration.js has no automatic
output when imported. It exports objects if your app needs to inspect their histories:

```javascript
const { standard, rewards } = demonstratePart1();
```

The demonstration hook shows both required account scenarios inside the existing application;
it does not yet charge real Student meal bookings. Full workflow integration depends on the
original source and the detailed Part 2 requirements.

If your original DiningApp uses CommonJS require(), do not change its package type blindly.
Inside its existing async startup function, use dynamic import instead:

```javascript
const { demonstratePart1 } = await import('../IS305_Lab3_Part1/Part1Demonstration.js');
demonstratePart1();
```

The new folder's own package.json lets these account files use ES modules while earlier folders
keep their current module settings. Supply the real source if you need a directly edited
DiningApp.js rather than an integration recipe.

## GitHub checkpoint — Git Bash

1. Extract the ZIP and copy IS305_Lab3_Part1 into the existing repository.
2. Add the demonstration hook to your original DiningApp.js; run that application's original
   startup command and confirm both examples display and its old menu still works.
3. From Git Bash:

```bash
cd /c/Users/ID250692/Downloads/IS305-250692
npm --prefix IS305_Lab3_Part1 test
npm --prefix IS305_Lab3_Part1 run demo

git status
git remote -v
git add IS305_Lab3_Part1
```

4. Stage the original DiningApp.js you actually changed. Replace YOUR_LAB2_FOLDER with its
   actual relative folder name before running:

```bash
git add YOUR_LAB2_FOLDER/DiningApp.js
git diff --cached --stat
git commit -m "Add Part 1 dining accounts, constructor chaining and rewards"
git push -u origin HEAD
```

5. Open your existing GitHub repository, select the current branch and verify that both new
   account files and the updated original DiningApp.js are visible. The existing remote must
   already be configured; check git remote -v rather than inventing a GitHub username.

Do not commit an unchanged DiningApp.js as evidence of integration. Keep the earlier labs and
their existing Git history. If the checkpoint is already closed, use the lecturer's late-submission
instructions; a successful push does not change the deadline.

GitHub documentation:
https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github
