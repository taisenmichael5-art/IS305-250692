import { toCents, requiredText } from './money.js';

/** Part 1: base account. Optional parameters/object form simulate overloading. */
export class DiningAccount {
  #accountId;
  #studentId;
  #balanceCents;
  #transactions = [];

  constructor(accountId, studentId, openingBalance = 0) {
    if (accountId !== null && typeof accountId === 'object') {
      ({ accountId, studentId, openingBalance = 0 } = accountId);
    }
    this.#accountId = requiredText(accountId, 'Account ID');
    this.#studentId = requiredText(studentId, 'Student ID');
    this.#balanceCents = toCents(openingBalance, 'Opening balance', true);
    if (this.#balanceCents > 0) {
      this.#transactions.push(this.#record('OPENING', this.#balanceCents, 'Opening balance', this.#balanceCents));
    }
  }

  get accountId() { return this.#accountId; }
  get studentId() { return this.#studentId; }
  getBalance() { return this.#balanceCents / 100; }
  getAccountType() { return 'Standard'; }
  getMinimumBalanceCents() { return 0; }
  getDepositBonusCents(_depositCents) { return 0; }
  getTransactions() { return this.#transactions.map(transaction => ({ ...transaction })); }

  #record(type, cents, description, balance, offset = 0) {
    return Object.freeze({
      transactionId: `${this.#accountId}-T${String(this.#transactions.length + 1 + offset).padStart(3, '0')}`,
      timestamp: new Date().toISOString(), type, amount: cents / 100,
      description, balanceAfter: balance / 100
    });
  }

  // Both deposit(100) and deposit({ amount: 100, description: 'Top-up' }) work.
  deposit(amount, description = 'Cash deposit') {
    if (amount !== null && typeof amount === 'object') {
      ({ amount, description = 'Cash deposit' } = amount);
    }
    const cents = toCents(amount, 'Deposit');
    const note = requiredText(description, 'Description');
    const bonus = this.getDepositBonusCents(cents); // Dynamic dispatch to Rewards.
    if (!Number.isSafeInteger(bonus) || bonus < 0) throw new RangeError('Invalid deposit bonus.');
    const depositedBalance = this.#balanceCents + cents;
    const finalBalance = depositedBalance + bonus;
    if (!Number.isSafeInteger(finalBalance) || finalBalance > 100_000_000_000) {
      throw new RangeError('Resulting balance exceeds the supported maximum.');
    }
    // Prepare every record before changing any state: all-or-nothing deposit.
    const records = [this.#record('DEPOSIT', cents, note, depositedBalance)];
    if (bonus > 0) records.push(this.#record('BONUS', bonus, 'Deposit reward', finalBalance, 1));
    this.#transactions.push(...records);
    this.#balanceCents = finalBalance;
    return Object.freeze({ deposited: cents / 100, bonus: bonus / 100, balance: this.getBalance() });
  }

  canAfford(amount) {
    const cents = toCents(amount, 'Meal cost');
    return this.#balanceCents - cents >= this.getMinimumBalanceCents();
  }

  // payMeal(30, 'B001') or payMeal({ amount: 30, bookingId: 'B001' }).
  payMeal(amount, bookingId = 'Meal payment') {
    if (amount !== null && typeof amount === 'object') {
      ({ amount, bookingId = 'Meal payment' } = amount);
    }
    const cents = toCents(amount, 'Meal cost');
    const reference = requiredText(bookingId, 'Booking reference');
    const nextBalance = this.#balanceCents - cents;
    if (nextBalance < this.getMinimumBalanceCents()) {
      throw new RangeError(`${this.getAccountType()} account: insufficient available funds or credit.`);
    }
    const transaction = this.#record('MEAL_PAYMENT', -cents, reference, nextBalance);
    this.#transactions.push(transaction);
    this.#balanceCents = nextBalance;
    return Object.freeze({ ...transaction });
  }

  getSummary() {
    return { accountId: this.accountId, studentId: this.studentId,
      type: this.getAccountType(), balance: this.getBalance(),
      transactions: this.#transactions.length };
  }
}
export default DiningAccount;
