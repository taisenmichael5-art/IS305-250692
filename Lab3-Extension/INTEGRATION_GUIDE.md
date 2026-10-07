# Extend the existing application — integration guide

Taisen Marainump | 250692

## 1. Preserve the earlier labs

Copy this `Lab3-Extension` folder into your existing IS305-250692 repository.
Keep the original Lab 1 and Lab 2 files and commits. Do not initialise another repository inside
this folder, replace the original classes, or copy in invented Student/MealBooking classes.

The helper is intentionally separate from your existing UI. Exact edits depend on your current
source. The steps below define the integration contract; they are not a claim that unknown getter
names or menu methods already exist in your application.

## 2. Import account types and the helper into DiningApp

If your existing code uses ES modules and DiningApp.js is in a sibling Lab 2 directory,
the relative imports would start with `../Lab3-Extension/`:

```javascript
import { DiningAccount } from '../Lab3-Extension/DiningAccount.js';
import { RewardsDiningAccount } from '../Lab3-Extension/RewardsDiningAccount.js';
import { CreditDiningAccount } from '../Lab3-Extension/CreditDiningAccount.js';
import { DiningPaymentService } from '../Lab3-Extension/DiningPaymentService.js';
```

Adjust the relative paths to the actual layout. If Lab 2 uses CommonJS, use dynamic
`await import('../Lab3-Extension/DiningAccount.js')` inside an async setup function, or
convert the existing module files consistently after reviewing them. Do not change the root
package.json to `type: module` blindly, because that could break earlier labs.

## 3. Compose a payment helper inside your existing DiningApp

Add a private `#diningPayments` field to DiningApp. Initialise it with four selector functions:

| Selector | Must return |
|---|---|
| getStudentId(student) | Original Student object's ID as a string |
| getBookingStudentId(booking) | ID of the Student linked to the original MealBooking |
| getBookingId(booking) | Unique existing booking ID as a string |
| getBookingTotal(booking) | Existing booking's authoritative calculated total as a number in kina |

Use the actual existing getters. Do not accept a user-entered cost when the booking can calculate
its total. Do not read private fields from another class. An illustrative mapping **only if these
getters exist** is:

```javascript
this.#diningPayments = new DiningPaymentService({
  getStudentId: student => student.getStudentId(),
  getBookingStudentId: booking => booking.getStudent().getStudentId(),
  getBookingId: booking => booking.getBookingId(),
  getBookingTotal: booking => booking.calculateTotal()
});
```

The exact selectors must be adapted to your source. None of these getter names has been
verified against your files. If booking IDs do not exist, add unique IDs to the original
MealBooking class while preserving its existing constructor compatibility.

## 4. Extend the existing console menu

Retain all old options. Add:

1. Create dining account: find the registered Student, choose Standard/Rewards/Credit,
   obtain an account ID and validated opening balance, then attach the new account.
2. Deposit funds: find the Student's account and call deposit(amount, description).
3. View account: getBalance() / getSummary().
4. View transaction history: console.table(account.getTransactions()).
5. Include account summaries as a report option if appropriate.

Use one account per student in this implementation. A second account for that student is
rejected instead of replacing a live balance. The menu's account creation can choose a
subclass, but the booking payment method must use polymorphism rather than a repeated
switch on account type.

For the already-created Student object and chosen account:

```javascript
this.#diningPayments.attachAccount(student, account);
```

For a deposit:

```javascript
this.#diningPayments.getAccount(student).deposit(amount, description);
```

## 5. Extend the existing booking workflow

1. Locate the original registered Student object.
2. Validate existing meal choice, quantity, date and all previous booking restrictions.
3. Construct the existing MealBooking using its original signature and Student association.
4. Obtain any consent/input and validate booking ID uniqueness **before payment**.
5. Call the payment helper with the Student and newly validated MealBooking object.
6. After successful payment, add that same booking object to the existing bookings array.
7. Show booking details, receipt and remaining balance; return to the original menu.
8. On an exception, show error.message and retain the previous booking count and balance.

The new payment line at the correct point is:

```javascript
const receipt = this.#diningPayments.payForBooking(student, booking);
```

This is synchronous: do not insert fallible validation, further user prompts or network calls
between a successful debit and the original bookings-array insertion. The helper protects
account payment state; it cannot roll back unrelated existing DiningApp operations. Inspect
the real booking methods to ensure a failure cannot leave a debit without a stored booking.
If your app stores bookings before payment, reorder that section carefully.

## 6. Demonstrate integrated scenarios

Use your existing Student registration and booking menu, not the example scripts, for final evidence:

- Taisen Marainump, ID 250692, Standard account, deposit K100, Lunch quantity 2 at the
  existing meal price; verify booking total and debit match. If existing Lunch is K15,
  expected total K30 and remaining balance K70.
- Same workflow with Rewards account on a fresh session: K100 deposit earns K2;
  a K30 booking leaves K72.
- Credit account with zero opening balance and K100 limit: K30 booking leaves −K30.
- A Standard booking without funds must be rejected and not added to bookings.
- A Credit payment taking the balance below −K100 must be rejected unchanged.
- Another student's account must not pay the selected student's booking.
- Repeat payment on the same booking ID: reject the second attempt unchanged.

A fresh application session resets all in-memory data. Sample tests use selector fixtures,
not your real Student/MealBooking classes; final end-to-end tests must use your source.

## 7. Submission checks

- Original Student, MealBooking and DiningApp retained and working.
- Registration → account creation → deposit → booking → payment → history works in one app.
- Old menu options and booking operations still function.
- Explain private fields, super(), overrides, polymorphism and simulated overloading.
- Capture actual terminal output and commit the integrated source to the existing repository.
