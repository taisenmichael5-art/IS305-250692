import test from 'node:test';
import assert from 'node:assert/strict';
import { DiningAccount } from '../DiningAccount.js';
import { RewardsDiningAccount } from '../RewardsDiningAccount.js';
import { CreditDiningAccount } from '../CreditDiningAccount.js';
import { DiningPaymentService } from '../DiningPaymentService.js';

test('default and object constructors; initial balance recorded', () => {
  assert.equal(new DiningAccount('A', '250692').getBalance(), 0);
  const a = new DiningAccount({ accountId: 'A', studentId: '250692', openingBalance: 20 });
  assert.equal(a.getTransactions()[0].type, 'OPENING');
  assert.equal(a.getBalance(), 20);
});
test('encapsulation: returned transaction copies cannot change account history', () => {
  const a = new DiningAccount('A', '250692'); a.deposit(5);
  const logs = a.getTransactions(); logs[0].balanceAfter = 999; logs.push({});
  assert.equal(a.getBalance(), 5); assert.equal(a.getTransactions().length, 1);
  assert.equal(a.getTransactions()[0].balanceAfter, 5);
  assert.equal(a.balance, undefined);
});
test('standard account accepts exact balance and rejects overdraft atomically', () => {
  const a = new DiningAccount('A', '250692', 30); a.payMeal(30, 'B1');
  assert.equal(a.getBalance(), 0); const before = a.getTransactions();
  assert.throws(() => a.payMeal(.01, 'B2'), /insufficient/);
  assert.deepEqual(a.getTransactions(), before);
});
test('deposit and payment accept both simulated overload forms', () => {
  const a = new DiningAccount('A', '250692'); a.deposit(10); a.deposit({ amount: 20, description: 'Cash' });
  a.payMeal({ amount: 5, bookingId: 'B1' }); a.payMeal(5, 'B2'); assert.equal(a.getBalance(), 20);
});
for (const value of [0, -1, NaN, Infinity, '10', null, 1.001, 0.00000001]) {
  test(`invalid deposit/payment rejected without mutation: ${String(value)}`, () => {
    const a = new DiningAccount('A', '250692', 20); const before = a.getTransactions();
    assert.throws(() => a.deposit(value)); assert.throws(() => a.payMeal(value));
    assert.equal(a.getBalance(), 20); assert.deepEqual(a.getTransactions(), before);
  });
}
test('rewards deposits record a separate 2% bonus and payment earns no bonus', () => {
  const a = new RewardsDiningAccount('R', '250692');
  assert.deepEqual(a.deposit(100), { deposited: 100, bonus: 2, balance: 102 });
  a.payMeal(30, 'B1'); assert.equal(a.getBalance(), 72);
  assert.deepEqual(a.getTransactions().map(t => t.type), ['DEPOSIT', 'BONUS', 'MEAL_PAYMENT']);
});
test('reward opening balance earns no bonus; rate zero allowed', () => {
  const a = new RewardsDiningAccount({ accountId: 'R', studentId: '250692', openingBalance: 50, bonusRate: 0 });
  a.deposit(10); assert.equal(a.getBalance(), 60);
});
test('credit boundary inclusive, rejection atomic, deposit repays debt', () => {
  const a = new CreditDiningAccount('C', '250692', 0, 100);
  a.payMeal(100, 'B1'); assert.equal(a.getBalance(), -100); assert.equal(a.getAvailableFunds(), 0);
  const before = a.getTransactions(); assert.throws(() => a.payMeal(.01, 'B2'));
  assert.deepEqual(a.getTransactions(), before); a.deposit(40); assert.equal(a.getBalance(), -60);
});
test('invalid construction and configuration rejected', () => {
  assert.throws(() => new DiningAccount('', '250692'));
  assert.throws(() => new DiningAccount('A', '', 10));
  assert.throws(() => new DiningAccount('A', '250692', -1));
  for (const rate of [-.1, 1.1, NaN, '0.02']) assert.throws(() => new RewardsDiningAccount('R', '250692', 0, rate));
  assert.throws(() => new CreditDiningAccount('C', '250692', 0, -1));
});
test('toea arithmetic and half-up bonus rounding', () => {
  const a = new DiningAccount('A', '250692'); a.deposit(.1); a.deposit(.2); a.payMeal(.3); assert.equal(a.getBalance(), 0);
  const r = new RewardsDiningAccount('R', '250692'); r.deposit(.25); assert.equal(r.getBalance(), .26);
});
test('balance ceiling checked before deposit and bonus mutate state', () => {
  const a = new RewardsDiningAccount('R', '250692', 1_000_000_000);
  const before = a.getTransactions(); assert.throws(() => a.deposit(1));
  assert.equal(a.getBalance(), 1_000_000_000); assert.deepEqual(a.getTransactions(), before);
});
// Fixtures exercise the selector contract; they are not replacement application classes.
function fixture(account = new DiningAccount('A', '250692', 100)) {
  const service = new DiningPaymentService({ getStudentId: s => s.id, getBookingStudentId: b => b.student.id,
    getBookingId: b => b.id, getBookingTotal: b => b.total });
  const student = { id: '250692', name: 'Taisen Marainump' };
  const booking = { id: 'B1', student, total: 30 };
  service.attachAccount(student, account); return { service, student, booking, account };
}
test('composition connects existing object references to account and receipt', () => {
  const { service, student, booking, account } = fixture(); service.payForBooking(student, booking);
  assert.equal(account.getBalance(), 70); assert.equal(service.getReceipt(booking).amount, -30);
});
test('duplicate booking object and reused booking ID cannot charge twice', () => {
  const { service, student, booking, account } = fixture(); service.payForBooking(student, booking);
  assert.throws(() => service.payForBooking(student, booking), /already/);
  assert.throws(() => service.payForBooking(student, { ...booking }), /already/); assert.equal(account.getBalance(), 70);
});
test('wrong ownership, duplicate accounts and missing account rejected', () => {
  const { service, student, booking, account } = fixture();
  assert.throws(() => service.attachAccount(student, new DiningAccount('X', 'other')), /different/);
  assert.throws(() => service.attachAccount(student, new DiningAccount('X', '250692')), /already/);
  assert.throws(() => service.attachAccount({ id: 'other' }, new DiningAccount('A', 'other')), /already/);
  assert.throws(() => service.payForBooking(student, { ...booking, student: { id: 'other' } }), /another/);
  assert.throws(() => service.getAccount({ id: 'missing' }), /first/); assert.equal(account.getBalance(), 100);
});
test('failed payment leaves booking unpaid and a later funded retry succeeds', () => {
  const { service, student, booking, account } = fixture(new DiningAccount('A', '250692', 0));
  assert.throws(() => service.payForBooking(student, booking)); assert.equal(service.getReceipt(booking), null);
  assert.equal(account.getTransactions().length, 0); account.deposit(30); service.payForBooking(student, booking);
  assert.equal(account.getBalance(), 0);
});
test('integration dispatches credit policy through the same payment method', () => {
  const { service, student, booking, account } = fixture(new CreditDiningAccount('A', '250692', 0, 100));
  service.payForBooking(student, booking); assert.equal(account.getBalance(), -30);
});
test('missing selectors and invalid booking totals fail before account mutation', () => {
  assert.throws(() => new DiningPaymentService({}));
  const { service, student, booking, account } = fixture(); booking.total = '30';
  assert.throws(() => service.payForBooking(student, booking)); assert.equal(account.getBalance(), 100);
});
