# IS305 Lab 3 — Complete Dining Account Distinction Extension

**Student:** Taisen Marainump  
**Student ID:** 250692  
**Part 1:** 12 marks; end-of-class checkpoint 10:00 PM, per detailed Part 1 brief.  
**Part 2:** 18 marks; 11:59 PM on the date shown in Moodle. Check Moodle for the actual date.  
**Technology:** JavaScript, Node.js, CommonJS modules; in-memory objects and arrays.

## Correct Lab 2 starting point

This solution extends **Lab-2-Part-2-Student-Meal-Integration**, supplied by the student.
That version already connects MealBooking to the real Student object, prevents duplicate
bookings, and displays booking history. Lab-2-Part-1-Student-Class is the earlier checkpoint:
its MealBooking still copies student ID/name rather than storing the Student reference.

The supplied Part 2 source is extended rather than substituted with unrelated classes:
Student constructor, getters, setters, getFullName and displayInfo remain; MealBooking keeps
its object constructor, Student reference, meal prices, validation and summaries. The original
DiningApp helpers addBooking, isDuplicateBooking and displayBookingHistory remain. The
application now adds a DiningApp coordinator class and a continuing account/payment menu.
CommonJS require/module.exports remains consistent with the supplied source.

The author ID in the supplied file headers was 20260001. It is corrected to **250692**.
Maria Kila / DWU2026001 remains an intentional demonstration student from the brief.

## Run

Open this directory in VS Code. In the terminal:

```powershell
node --version
npm test
npm start
```

No npm install is needed: there are no external dependencies. Tested with Node.js 24.19.0;
Node.js 22+ is supported.

Other commands:

```powershell
npm run demo:part1
npm run demo:part2
npm run test:lab2
```

The demos use separate example objects. Interactive records stay in memory while the menu runs
and reset on exit. The app does not read/write record files, use a database, or use local storage.

## Files

| File | Purpose |
|---|---|
| Student.js | Original Student identity API plus one validated dining-account assignment |
| MealBooking.js | Original meal booking plus payment, confirmation and duplicate-payment protection |
| DiningApp.js | Original history/duplicate helpers, integrated application coordinator and console menu |
| DiningAccount.js | Required #accountNumber, #balance and #transactions; standard account behaviour |
| RewardsDiningAccount.js | #rewardRate, super(), current-balance rewards and summary override |
| CreditDiningAccount.js | #creditLimit, super(), overridden payment and credit-limit policy |
| Lab3Demonstrations.js | Part 1, credit, polymorphism, overloading and integrated booking examples |
| tests/part1.test.js | Part 1 regression tests |
| tests/integration.test.js | Part 2, retained Lab 2 and real console-flow tests |
| TEST_RESULTS.txt | Actual automated test results: 35 passed, 0 failed |
| PART1_OUTPUT.txt / PART2_OUTPUT.txt | Actual demonstration output |
| LAB2_REGRESSION_OUTPUT.txt | Original Lab 2 test scenarios with paid confirmation |
| SOURCE_CHANGES.diff | Reviewable source changes against the supplied completed Lab 2 |
| GITHUB_AND_MOODLE.md | Steps for existing repository push and Moodle ZIP submission |

## Part 1 requirements

DiningAccount constructor: `new DiningAccount(accountNumber, openingBalance = 0)`.
It rejects empty numbers, negative opening balances, invalid amounts and overdrafts.

Required methods:

- deposit(amount, description = "Dining account deposit")
- payForMeal(amount, description = "Meal payment")
- getBalance()
- getTransactions() — independent copies of every transaction
- displayAccountSummary()

Money is stored as integer toea in the private #balance and returned in kina. This avoids
accumulated binary-decimal errors. Transaction fields are type, signed amount, description,
ISO date/time timestamp, balanceAfter and transactionNumber.

RewardsDiningAccount calls super(accountNumber, openingBalance), keeps #rewardRate and
uses **reward = current balance × rewardRate / 100**. Pass **2.5**, not 0.025, for 2.5%.
calculateReward() does not change the balance; applyReward() credits the rounded reward and
records it through the inherited deposit method with a reward description. Deposits do not
trigger automatic rewards. A zero reward does not create a zero deposit. Each explicit reward
application uses the new current balance; no reward-period restriction was specified.

Required outputs: Standard **K1300.00**; Rewards **K50.00 reward, K2050.00 final balance**.

## Part 2 requirements

CreditDiningAccount uses the required constructor signature and private #creditLimit.
Its payForMeal() overrides the inherited method and calls the base's validated debit algorithm.
The base algorithm obtains a polymorphic minimum-balance policy: zero for Standard/Rewards,
negative approved limit for Credit. Actual balance and history mutations remain private in the
base class. No negative opening balance is permitted; negative balances arise from credit payments.

Required example: opening K1000, limit K500, payment K1500 → **K-500.00**. Another payment
is rejected without changing balance/history. Deposit repays an existing negative balance.

Student.assignDiningAccount(account) accepts only instances of DiningAccount or its subclasses.
getDiningAccount() and diningAccount return the assigned object. One student's existing
account cannot be replaced by a different account. DiningApp also checks account-number
uniqueness across its registered students.

MealBooking.processPayment(account) calculates its own total and calls **the same
payForMeal() method**, without a separate payment branch for each subtype. It uses only
the Student's assigned account. Success marks the booking paid and Confirmed; failure keeps
an active booking Pending. The method returns a clear result object and stores a safe receipt
copy. A duplicate payment is rejected before a debit. A cancelled booking stays Cancelled and
cannot pay. The retained confirmBooking() method delegates to payment, so it cannot bypass
the payment requirement.

DiningApp checks duplicate bookings before payment. A failed payment remains as a Pending
booking in the array and can be retried after adding money. Paid meal date/type/quantity are
locked to avoid changing an already-charged total. Invalid edits to Pending bookings restore
the original values. The menu checks duplicate conflicts before committing Pending edits.

Cancellation is retained from Lab 2. Cancelling a paid booking records its Cancelled state but
does not automatically refund it; the successful payment remains in history and cannot be
charged again. A refund policy was not supplied and has not been invented.

## Polymorphism and simulated overloading

One account array contains Standard, Rewards and Credit objects:

```javascript
for (const account of diningAccounts) {
    account.displayAccountSummary();
}
```

Each subtype's overridden summary/type/policy supplies its own behaviour. MealBooking also
dispatches account.payForMeal(total, description) without knowing the account subtype.

Constructor variations:

```javascript
new DiningAccount("DA001");
new DiningAccount("DA002", 500);
```

Method variations:

```javascript
account.deposit(100);
account.deposit(100, "Additional meal funds");
```

JavaScript does not support traditional overloads by declaring several same-named methods.
The single constructor's default openingBalance and single deposit method's default description
allow either argument form. Both calls reuse one validation path.

## Interactive menu

1. Register Student, create account and make meal bookings (retained Lab 2 interaction).
2. Retained Lab 2 tests, updated so confirmation also pays.
3. Exit.
4. Exact Part 1 demonstrations.
5. Exact Part 2 demonstrations.
6. Deposit funds for an existing Student.
7. Pay or retry a Pending booking.
8. Calculate and explicitly apply a reward.
9. View Student bookings, account summary and transaction history.
10. Cancel booking.
11. Edit a Pending booking.

Names are still shared object references: changing Student.firstName/lastName updates old
booking summaries, as in Lab 2. Original prices remain Breakfast K10, Lunch K15, Dinner K20.
The original flexible non-empty date validation is retained; use YYYY-MM-DD for consistent
manual duplicate checking. Dates are not calendar-normalised. Quantity must be a safe whole
number; numeric strings from console input are accepted.

## Try your own successful booking

Run npm start and choose option 1:

| Prompt | Enter |
|---|---|
| Student ID | 250692 |
| First name | Taisen |
| Last name | Marainump |
| Account type | 2 (Rewards) |
| Account number | RA250692 |
| Opening balance | 100 |
| Reward rate | 2.5 |
| Meal date | 2026-10-07 |
| Meal type | Dinner |
| Quantity | 2 |
| Dietary note | Press Enter |
| Pay and confirm? | y |
| Add another booking? | n |
| Update name? | n |

Expected: cost K40, Successful payment, Confirmed booking, balance K60. Rewards are only
added when explicitly applied via option 8, matching the assessment's example balance.

For a rejected booking, use Standard with zero opening balance. It remains Pending. Choose
option 6 to deposit K100, then option 7 to select and pay the existing booking. No duplicate
booking is created. Choose option 9 to inspect the debit and final balance.

## Required-test evidence

| Required test | Evidence |
|---|---|
| Standard sufficient funds | Part 1 standard K1300 test; subtype booking test |
| Standard insufficient funds | Balance/history unchanged; Pending booking; actual console retry test |
| Rewards calculation | K2000 × 2.5% = K50; K2050 after applying |
| Credit within limit | Exact K1500 payment takes K1000 to K-500 |
| Credit exceeded | Following payment and initial over-limit payment rejected unchanged |
| Polymorphic processing | One summary loop and same booking payment call across all types |
| Booking payment | Confirmed/isPaid state and successful result checked |
| Duplicate payment | Second attempt and repeated confirmBooking rejected unchanged |

The 35-test suite also checks invalid fields, safe history copies, repeated reward calculation,
account ownership, collection copies, cancellation, paid-edit protection, original meal prices,
Student name reference behaviour and retained Lab 2 output. Two tests run the actual console
process with scripted input rather than substituting unrelated Student/MealBooking fixtures.
