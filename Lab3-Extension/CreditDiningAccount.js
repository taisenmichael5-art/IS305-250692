import { DiningAccount } from './DiningAccount.js';
import { toCents } from './money.js';

/** Part 2: permits negative balances, including exactly the approved limit. */
export class CreditDiningAccount extends DiningAccount {
  #creditLimitCents;
  constructor(accountId, studentId, openingBalance = 0, creditLimit = 100) {
    if (accountId !== null && typeof accountId === 'object') {
      ({ accountId, studentId, openingBalance = 0, creditLimit = 100 } = accountId);
    }
    const limit = toCents(creditLimit, 'Credit limit', true);
    super(accountId, studentId, openingBalance);
    this.#creditLimitCents = limit;
  }
  getAccountType() { return 'Credit'; }
  getMinimumBalanceCents() { return -this.#creditLimitCents; }
  getCreditLimit() { return this.#creditLimitCents / 100; }
  getAvailableFunds() { return this.getBalance() + this.getCreditLimit(); }
  payMeal(amount, bookingId = 'Credit meal payment') {
    return super.payMeal(amount, bookingId); // Base algorithm dispatches to the credit policy.
  }
  getSummary() {
    return { ...super.getSummary(), creditLimit: this.getCreditLimit(), availableFunds: this.getAvailableFunds() };
  }
}
export default CreditDiningAccount;
