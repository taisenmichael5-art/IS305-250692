const DiningAccount = require("./DiningAccount");

/** Exact Part 2 credit-account API. */
class CreditDiningAccount extends DiningAccount {
  #creditLimit;
  constructor(accountNumber, openingBalance = 0, creditLimit = 0) {
    const cents = Math.round(creditLimit * 100);
    if (typeof creditLimit !== 'number' || !Number.isFinite(creditLimit) || creditLimit < 0 ||
        !Number.isSafeInteger(cents) || Math.abs(creditLimit * 100 - cents) > .00001) {
      throw new RangeError('Credit limit must be a non-negative amount with at most two decimals.');
    }
    super(accountNumber, openingBalance);
    this.#creditLimit = cents / 100;
  }
  getAccountType() { return 'Credit Dining Account'; }
  getCreditLimit() { return this.#creditLimit; }
  _minimumBalanceToea() { return -Math.round(this.#creditLimit * 100); }
  payForMeal(amount, description = 'Credit meal payment') {
    // Shared private balance/history algorithm dispatches to the credit policy.
    try { return super.payForMeal(amount, description); }
    catch (error) {
      if (error instanceof RangeError && error.message.startsWith('Insufficient funds')) {
        throw new RangeError(`Payment rejected: credit limit K${this.#creditLimit.toFixed(2)} would be exceeded. ${error.message}`);
      }
      throw error;
    }
  }
  displayAccountSummary() {
    super.displayAccountSummary();
    console.log(`Credit Limit: K${this.#creditLimit.toFixed(2)}`);
  }
}
module.exports = CreditDiningAccount;
