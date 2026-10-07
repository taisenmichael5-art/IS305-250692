const test = require('node:test');
const assert = require('node:assert/strict');
const DiningAccount = require('../DiningAccount');
const RewardsDiningAccount = require('../RewardsDiningAccount');

test('required standard demonstration finishes at K1300', () => {
  const a = new DiningAccount('DA001', 1000); a.deposit(500);
  assert.equal(a.payForMeal(200, 'Lunch'), true); assert.equal(a.getBalance(), 1300);
});
test('constructor default gives zero balance and account number validates', () => {
  assert.equal(new DiningAccount('DA002').getBalance(), 0);
  for (const id of ['', ' ', null, 123]) assert.throws(() => new DiningAccount(id));
  assert.throws(() => new DiningAccount('A', -1));
});
test('deposit overload defaults and custom description both recorded', () => {
  const a = new DiningAccount('A'); a.deposit(500); a.deposit(500, 'Weekly meal allowance');
  assert.equal(a.getBalance(), 1000);
  assert.equal(a.getTransactions()[1].description, 'Weekly meal allowance');
});
test('rejected payment leaves balance and history unchanged; exact balance accepted', () => {
  const a = new DiningAccount('A', 100); const before = a.getTransactions();
  assert.throws(() => a.payForMeal(200), /Insufficient funds/);
  assert.equal(a.getBalance(), 100); assert.deepEqual(a.getTransactions(), before);
  a.payForMeal(100); assert.equal(a.getBalance(), 0);
});
test('invalid amounts and descriptions cannot mutate state', () => {
  const a = new DiningAccount('A', 100);
  for (const x of [0, -1, NaN, Infinity, '500', null, 1.001, 0.00000001]) {
    assert.throws(() => a.deposit(x)); assert.throws(() => a.payForMeal(x));
  }
  assert.throws(() => a.deposit(10, '')); assert.throws(() => a.payForMeal(10, ' '));
  assert.equal(a.getBalance(), 100); assert.equal(a.getTransactions().length, 1);
});
test('history copies protect stored transactions', () => {
  const a = new DiningAccount('A', 100); const history = a.getTransactions();
  history[0].amount = 999; history.push({});
  assert.equal(a.getTransactions()[0].amount, 100); assert.equal(a.getTransactions().length, 1);
});
test('rewards formula and application match K50 and K2050 exactly', () => {
  const a = new RewardsDiningAccount('RA001', 1500, 2.5); a.deposit(500);
  assert.equal(a.getBalance(), 2000); assert.equal(a.calculateReward(), 50);
  assert.equal(a.getBalance(), 2000); assert.equal(a.applyReward(), 50); assert.equal(a.getBalance(), 2050);
  const reward = a.getTransactions().at(-1); assert.equal(reward.amount, 50);
  assert.match(reward.description, /Reward credit at 2.5%/);
  assert.ok(a instanceof DiningAccount);
});
test('deposits do not automatically earn rewards', () => {
  const a = new RewardsDiningAccount('R', 1500, 2.5); a.deposit(500);
  assert.equal(a.getBalance(), 2000); assert.equal(a.getTransactions().length, 2);
});
test('reward rates validated; zero reward produces no invalid zero deposit', () => {
  for (const rate of [-1, 101, NaN, Infinity, '2.5']) assert.throws(() => new RewardsDiningAccount('R', 0, rate));
  const a = new RewardsDiningAccount('R', 100, 0); assert.equal(a.applyReward(), 0);
  assert.equal(a.getTransactions().length, 1);
});
test('repeat explicit reward uses new current balance as required by formula', () => {
  const a = new RewardsDiningAccount('R', 2000, 2.5); a.applyReward();
  assert.equal(a.calculateReward(), 51.25); a.applyReward(); assert.equal(a.getBalance(), 2101.25);
});
test('integer-toea arithmetic and reward rounding', () => {
  const a = new DiningAccount('A'); a.deposit(.1); a.deposit(.2); a.payForMeal(.3); assert.equal(a.getBalance(), 0);
  assert.equal(new RewardsDiningAccount('R', 1, 2.5).calculateReward(), .03);
});
test('summary uses overridden account type and includes rate', () => {
  const calls = []; const original = console.log;
  console.log = text => calls.push(text);
  try { new RewardsDiningAccount('R', 1500, 2.5).displayAccountSummary(); }
  finally { console.log = original; }
  assert.ok(calls.includes('Account Type: Rewards Dining Account'));
  assert.ok(calls.includes('Reward Rate: 2.5%'));
});
