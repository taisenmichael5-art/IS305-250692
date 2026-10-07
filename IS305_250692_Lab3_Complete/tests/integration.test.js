const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const Student = require('../Student');
const MealBooking = require('../MealBooking');
const DiningAccount = require('../DiningAccount');
const RewardsDiningAccount = require('../RewardsDiningAccount');
const CreditDiningAccount = require('../CreditDiningAccount');
const { DiningApp, addBooking, isDuplicateBooking, displayBookingHistory } = require('../DiningApp');
function fixture(account = new DiningAccount('A', 100)) {
    const student = new Student('250692', 'Taisen', 'Marainump');
    student.assignDiningAccount(account);
    const booking = new MealBooking({ student, mealDate: '2026-10-07', mealType: 'Dinner', quantity: 2 });
    return { student, booking, account };
}
test('required credit boundary K1500 accepted; next payment rejected unchanged', () => {
    const account = new CreditDiningAccount('CA001', 1000, 500);
    assert.equal(account.payForMeal(1500, 'Catering'), true); assert.equal(account.getBalance(), -500);
    const before = account.getTransactions(); assert.throws(() => account.payForMeal(.01), /credit limit/);
    assert.deepEqual(account.getTransactions(), before); assert.equal(account.getBalance(), -500);
});
test('credit amount exceeding available funds is rejected; deposits repay debt', () => {
    const a = new CreditDiningAccount('C', 1000, 500); assert.throws(() => a.payForMeal(1500.01));
    a.payForMeal(1200); a.deposit(100); assert.equal(a.getBalance(), -100);
});
test('credit limit validation and zero-limit policy', () => {
    for (const value of [-1, NaN, Infinity, '500', 1.001]) assert.throws(() => new CreditDiningAccount('C', 0, value));
    assert.throws(() => new CreditDiningAccount('C', 0, 0).payForMeal(.01));
});
test('Student assignment validates types and permits all account subclasses', () => {
    for (const account of [new DiningAccount('D'), new RewardsDiningAccount('R', 0, 2.5), new CreditDiningAccount('C', 0, 500)]) {
        const student = new Student('250692', 'Taisen', 'Marainump'); student.assignDiningAccount(account);
        assert.equal(student.getDiningAccount(), account); assert.equal(student.diningAccount, account);
    }
    const s = new Student('250692', 'Taisen', 'Marainump'); assert.throws(() => s.assignDiningAccount({ payForMeal() {} }));
    s.assignDiningAccount(new DiningAccount('A')); assert.throws(() => s.assignDiningAccount(new DiningAccount('B')), /already/);
});
test('same polymorphic payment call confirms booking for each account subtype', () => {
    for (const account of [new DiningAccount('D', 100), new RewardsDiningAccount('R', 100, 2.5), new CreditDiningAccount('C', 0, 500)]) {
        const { booking } = fixture(account); const result = booking.processPayment(account);
        assert.equal(result.success, true); assert.equal(booking.bookingStatus, 'Confirmed');
        assert.equal(booking.isPaid, true); assert.equal(account.getBalance(), account instanceof CreditDiningAccount ? -40 : 60);
    }
});
test('insufficient standard balance keeps booking Pending and history unchanged', () => {
    const { account, booking } = fixture(new DiningAccount('A', 10)); const before = account.getTransactions();
    const result = booking.processPayment(account); assert.equal(result.success, false); assert.match(result.message, /Insufficient funds/);
    assert.equal(booking.bookingStatus, 'Pending'); assert.equal(account.getBalance(), 10);
    assert.deepEqual(account.getTransactions(), before);
});
test('failed booking can be paid after depositing; duplicate attempts never charge again', () => {
    const { account, booking } = fixture(new DiningAccount('A')); booking.processPayment(account);
    account.deposit(100); assert.equal(booking.processPayment(account).success, true);
    const before = account.getTransactions(); const receipt = booking.getPaymentResult();
    assert.equal(booking.processPayment(account).success, false); assert.equal(account.getBalance(), 60);
    assert.deepEqual(account.getTransactions(), before); assert.deepEqual(booking.getPaymentResult(), receipt);
    assert.throws(() => booking.confirmBooking(), /already/);
});
test('booking payment rejects invalid account and another student account', () => {
    const { booking, account } = fixture();
    assert.equal(booking.processPayment(null).success, false);
    const other = new DiningAccount('OTHER', 100); assert.equal(booking.processPayment(other).success, false);
    assert.equal(other.getBalance(), 100); assert.equal(account.getBalance(), 100); assert.equal(booking.bookingStatus, 'Pending');
});
test('retained confirmBooking method enforces payment; no unpaid confirmation bypass', () => {
    const { booking, account } = fixture(); booking.confirmBooking(); assert.equal(account.getBalance(), 60);
    const empty = fixture(new DiningAccount('B')); assert.throws(() => empty.booking.confirmBooking(), /Insufficient/);
    assert.equal(empty.booking.bookingStatus, 'Pending');
});
test('cancelled booking cannot pay; paid cancellation retains payment and prevents recharge', () => {
    const f = fixture(); f.booking.cancelBooking(); assert.equal(f.booking.processPayment().success, false);
    assert.equal(f.booking.bookingStatus, 'Cancelled'); assert.equal(f.account.getBalance(), 100);
    const paid = fixture(); paid.booking.processPayment(); paid.booking.cancelBooking();
    assert.equal(paid.booking.processPayment().success, false); assert.equal(paid.account.getBalance(), 60);
});
test('paid details cannot change; invalid pending edits restore earlier state', () => {
    const { booking } = fixture(); assert.throws(() => { booking.quantity = 0; }); assert.equal(booking.quantity, 2);
    assert.throws(() => { booking.mealType = 'Snack'; }); assert.equal(booking.mealType, 'Dinner');
    assert.throws(() => { booking.mealDate = ''; }); assert.equal(booking.mealDate, '2026-10-07');
    booking.processPayment(); assert.throws(() => { booking.quantity = 3; }); assert.equal(booking.calculateTotal(), 40);
});
test('actual Lab 2 shared Student references reflect name updates', () => {
    const { student, booking } = fixture(); student.firstName = 'Updated';
    assert.equal(booking.student, student); assert.match(booking.getSummary(), /Updated Marainump/);
});
test('required transaction fields are recorded with signed debit', () => {
    const { account, booking } = fixture(); booking.processPayment(); const t = account.getTransactions().at(-1);
    assert.equal(t.type, 'Meal Payment'); assert.equal(t.amount, -40); assert.match(t.description, /Dinner booking/);
    assert.ok(!Number.isNaN(Date.parse(t.timestamp))); assert.equal(t.balanceAfter, 60);
});
test('same account-summary loop uses correct subtype method', () => {
    const accounts = [new DiningAccount('D'), new RewardsDiningAccount('R', 0, 2.5), new CreditDiningAccount('C', 0, 500)];
    const output = []; const old = console.log; console.log = text => output.push(text);
    try { for (const account of accounts) account.displayAccountSummary(); } finally { console.log = old; }
    for (const type of ['Standard', 'Rewards', 'Credit']) assert.ok(output.includes(`Account Type: ${type} Dining Account`));
    assert.ok(output.includes('Credit Limit: K500.00'));
});
test('app duplicate booking validation happens before another debit', () => {
    const app = new DiningApp(); const s = app.registerStudent(new Student('250692', 'Taisen', 'Marainump'));
    const a = app.assignAccount(s, new DiningAccount('A', 100));
    app.bookAndPay(s, { mealDate: '2026-10-07', mealType: 'Lunch', quantity: 2 });
    assert.throws(() => app.bookAndPay(s, { mealDate: '2026-10-07', mealType: 'lunch', quantity: 1 }), /Duplicate/);
    assert.equal(a.getBalance(), 70); assert.equal(app.getBookings().length, 1);
});
test('app keeps failed booking Pending in the original bookings collection', () => {
    const app = new DiningApp(); const s = app.registerStudent(new Student('250692', 'Taisen', 'Marainump'));
    app.assignAccount(s, new DiningAccount('A'));
    const { booking, result } = app.bookAndPay(s, { mealDate: '2026-10-07', mealType: 'Dinner', quantity: 2 });
    assert.equal(result.success, false); assert.equal(booking.bookingStatus, 'Pending'); assert.equal(app.getBookings()[0], booking);
});
test('app rejects duplicate student IDs and account numbers; collection copies safe', () => {
    const app = new DiningApp(); const s = app.registerStudent(new Student('250692', 'Taisen', 'Marainump'));
    app.assignAccount(s, new DiningAccount('A'));
    assert.throws(() => app.registerStudent(new Student('250692', 'Other', 'Name')));
    const other = app.registerStudent(new Student('OTHER', 'Other', 'Name'));
    assert.throws(() => app.assignAccount(other, new DiningAccount('a')));
    app.getStudents().length = 0; assert.equal(app.getStudents().length, 2);
});
test('retained history function reports total count and combined cost', () => {
    const { student, booking } = fixture(); const output = []; const old = console.log;
    console.log = x => output.push(String(x));
    try { displayBookingHistory(student, [booking]); } finally { console.log = old; }
    assert.ok(output.includes('Total Bookings: 1')); assert.ok(output.includes('Combined Cost: K40.00'));
});
test('invalid Student/MealBooking inputs and original meal prices retained', () => {
    assert.throws(() => new Student('', 'Taisen', 'Marainump'));
    assert.throws(() => new MealBooking({ student: {}, mealDate: 'x', mealType: 'Dinner', quantity: 1 }));
    const { student } = fixture();
    for (const [mealType, price] of [['Breakfast', 10], ['Lunch', 15], ['Dinner', 20]]) {
        assert.equal(new MealBooking({ student, mealDate: 'x', mealType, quantity: 2 }).calculateTotal(), price * 2);
    }
});
function cli(lines) {
    const result = spawnSync(process.execPath, [path.join(__dirname, '../DiningApp.js')], { input: lines.join('\n') + '\n', encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 0, result.stderr); assert.equal(result.error, undefined); return result.stdout;
}
test('actual CLI: required Maria dinner payment and final K60', () => {
    const output = cli(['1', 'DWU2026001', 'Maria', 'Kila', '2', 'RA001', '100', '2.5', '2026-10-07', 'Dinner', '2', '', 'y', 'n', 'n', '3']);
    assert.match(output, /Payment successful/); assert.match(output, /Status:\s+Confirmed/); assert.match(output, /Remaining Balance: K60.00/);
    assert.match(output, /Total Transactions: 2/); assert.match(output, /Application closed/);
});
test('actual CLI: insufficient funds, deposit, retry same Pending booking', () => {
    const output = cli(['1', '250692', 'Taisen', 'Marainump', '1', 'DA001', '0', '2026-10-07', 'Lunch', '2', '', 'y', 'n', 'n', '6', '250692', '100', '', '7', '250692', '1', '9', '250692', '3']);
    assert.match(output, /Payment rejected: Insufficient funds/); assert.match(output, /Status:\s+Pending/);
    assert.match(output, /Payment successful/); assert.match(output, /Current Balance: K70.00/);
    assert.match(output, /Total Bookings: 1/);
});
test('retained Lab 2 console tests run without FAIL results', () => {
    const result = spawnSync(process.execPath, [path.join(__dirname, '../DiningApp.js'), '--lab2-tests'], { encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 0); assert.doesNotMatch(result.stdout, /FAIL:/);
    assert.match(result.stdout, /Mary Kila-Smith/); assert.match(result.stdout, /Total Bookings: 2/);
});

test('boolean and malformed quantities rejected; numeric input strings retained', () => {
    const { student } = fixture();
    for (const quantity of [true, false, null, '1e2', '2.5', Number.MAX_SAFE_INTEGER + 1]) {
        assert.throws(() => new MealBooking({ student, mealDate: 'x', mealType: 'Lunch', quantity }));
    }
    assert.equal(new MealBooking({ student, mealDate: 'x', mealType: 'Lunch', quantity: '2' }).calculateTotal(), 30);
});
