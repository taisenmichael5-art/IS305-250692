# IS305 Programming Lab Activity 3 — Dining Account Distinction Extension

**Student:** Taisen Marainump  
**Student ID:** 250692  
**Technology:** JavaScript / Node.js; no database  
**Assessment:** 10% weighting, 30 marks, individual

## Status and the compulsory integration requirement

This package contains tested **additive account modules**, not a replacement Dining application.
Your original `Student`, `MealBooking` and `DiningApp` source was not available. Those classes
are deliberately not recreated here. **The exact integration into your existing menu and booking
workflow remains pending until those files are supplied. Do not submit this kit alone as the complete
Lab 3 application.** Keep Lab 1 and Lab 2 and extend their working source.

The supplied prompt contains the overview, scenario and concept list. It does not include detailed
Part 1/Part 2 method signatures or a full marking rubric. If additional pages exist, compare them
before submission. Names and configurable example policies below are implementation choices.

## What the brief means

A Student already makes a MealBooking through DiningApp. Lab 3 introduces the account used to
pay for that booking:

- Standard: deposits add money; payment requires sufficient balance.
- Rewards: standard behaviour plus a deposit bonus.
- Credit: permits debt up to a configured limit; deposits repay the debt.

The same `payMeal()` call invokes the correct policy for the actual account object. Do not create
three independent applications or duplicate the existing Student or MealBooking classes.

## Files and the two components

| Component | Files | Role |
|---|---|---|
| Part 1 foundation | DiningAccount.js, RewardsDiningAccount.js, money.js | Base account, inheritance, constructor chaining, deposit bonus |
| Part 1 demonstration | examples/part1.js | Standard and rewards deposit/payment examples |
| Part 2 extension | CreditDiningAccount.js | Credit-limit policy and overrides |
| Part 2 integration helper | DiningPaymentService.js | Connects existing Student/MealBooking objects to accounts and receipts |
| Part 2 demonstration | examples/part2.js | Same payment call over an array of account subtypes |
| Verification | tests/accounts.test.js, TEST_RESULTS.txt | Boundary, error, ownership, duplicate and payment tests |
| Integration instructions | INTEGRATION_GUIDE.md | Where the existing DiningApp must be extended |
| Git instructions | GITHUB_STEPS.md | Run, stage, commit, push and check the existing repository |

Part 1 is due at the end of class in Week 10 by 11:59 PM; Part 2 is due Week 10 Friday by
11:59 PM, according to the supplied brief. No calendar date was supplied.

## Run the tests and account demonstrations

From inside the `Lab3-Extension` folder:

```bash
node --version
npm test
npm run demo:part1
npm run demo:part2
```

No `npm install` is needed: only built-in Node modules are used. The folder's own `package.json`
sets ES modules without changing the module type of your existing Lab 1/2 folders.
These are account demonstrations; your original DiningApp remains the application entry point.

## Example policies (not lecturer-specified rates)

- Rewards credit 2% of each successful deposit, rounded to the nearest toea, halves rounded up.
- No reward on opening balances or meal payments.
- `bonusRate` accepts 0–1, with 0.02 as the default.
- Credit limit defaults to K100, accepts zero or a non-negative amount.
- Opening balances are non-negative for all types; negative credit balances arise from payments.
- Money accepts finite numbers in kina with at most two decimal places. IDs are non-empty strings.
- Individual amounts and final positive balances are capped at K1 billion to reject unrealistic inputs.
- Money is held as integer toea; all account balance changes happen inside the base class.
- All data is in memory. Restarting clears accounts, payments and duplicate-booking checks.

## Public account API

```javascript
new DiningAccount('A001', '250692');
new DiningAccount('A001', '250692', 50);
new DiningAccount({ accountId: 'A001', studentId: '250692', openingBalance: 50 });
new RewardsDiningAccount('R001', '250692', 0, 0.02);
new CreditDiningAccount('C001', '250692', 0, 100);

account.deposit(100);
account.deposit(100, 'Cash top-up');
account.deposit({ amount: 100, description: 'Cash top-up' });
account.payMeal(30, 'BOOK001');
account.payMeal({ amount: 30, bookingId: 'BOOK001' });
account.getBalance();
account.getTransactions();
account.getSummary();
```

These overload examples use one declaration per method with optional/default parameters and
controlled argument checking. JavaScript does not implement traditional multiple-signature overloading.

## OOP concepts to explain in your demonstration

| Concept | Evidence |
|---|---|
| Encapsulation | Private account ID, student ID, balance and transaction fields; defensive history copies |
| Inheritance | RewardsDiningAccount and CreditDiningAccount extend DiningAccount |
| Constructor chaining | Both subclasses call `super(accountId, studentId, openingBalance)` |
| Overriding | Account type, deposit behaviour, credit policy, payment and summary methods |
| Polymorphism | Account array in part2.js; `account.payMeal()` in the payment helper |
| Simulated constructor overloading | Positional arguments or an options object; optional opening balance |
| Simulated method overloading | Deposit/payment accept positional or structured arguments |
| Composition | Existing DiningApp owns a payment service; it associates accounts with Student objects |
| Arrays of related objects | Account collection and private transaction array |
| Transaction processing | Opening, deposit, bonus and meal-payment records with signed amounts and resulting balance |
| Validation/exceptions | Invalid money, insufficient funds, credit boundary, wrong owner, duplicate payments |
| Integration | Adapter selects IDs/total from actual Student/MealBooking APIs; final DiningApp wiring is pending |

## Expected results

Part 1: Standard deposit K100, pay K30 → K70.
Rewards deposit K100, bonus K2, pay K30 → K72.

Part 2: With K20 available, paying K30 is rejected by Standard and Rewards (K20.40 after top-up),
while Credit with K100 limit accepts it and finishes at −K10, with K90 available credit.

The test suite also covers exact-balance payments, exact credit limit, attempted overdrafts,
invalid inputs, penny arithmetic, rejected-payment retries, ownership and duplicate booking IDs.

## Next required integration work

Supply your current Student.js, MealBooking.js, DiningApp.js and package.json (or a ZIP of the
working Lab 2 folder). The source will determine correct getter names, constructor signatures,
menu options, booking array updates and the application entry point. The supplied requirement
specifically makes retaining those original classes compulsory.
