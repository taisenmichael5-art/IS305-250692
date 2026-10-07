/** IS305 Lab 3 Part 1 — Taisen Marainump, 250692. ES module. */
class DiningAccount {
  #accountNumber;
  #balance; // Integer toea; public methods accept/return kina.
  #transactions = [];

  constructor(accountNumber, openingBalance = 0) {
    if (typeof accountNumber !== 'string' || !accountNumber.trim()) {
      throw new TypeError('Account number cannot be empty.');
    }
    this.#accountNumber = accountNumber.trim();
    this.#balance = this.#toToea(openingBalance, true);
    if (this.#balance > 0) this.#record('Opening Balance', this.#balance, 'Opening balance');
  }

  #toToea(amount, allowZero = false) {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
      throw new TypeError('Amount must be a finite number.');
    }
    const toea = Math.round(amount * 100);
    if (amount < 0 || (!allowZero && toea <= 0) || !Number.isSafeInteger(toea) ||
        Math.abs(amount * 100 - toea) > 0.00001) {
      throw new RangeError(`Amount must be ${allowZero ? 'non-negative' : 'greater than zero'} and have at most two decimal places.`);
    }
    return toea;
  }

  #description(value) {
    if (typeof value !== 'string' || !value.trim()) throw new TypeError('Description cannot be empty.');
    return value.trim();
  }

  #record(type, toea, description) {
    this.#transactions.push(Object.freeze({
      transactionNumber: this.#transactions.length + 1,
      timestamp: new Date().toISOString(),
      type, amount: toea / 100, description, balanceAfter: this.getBalance()
    }));
  }

  getAccountNumber() { return this.#accountNumber; }
  getAccountType() { return 'Standard Dining Account'; }
  _minimumBalanceToea() { return 0; } // Subclass policy; mutations stay private.
  getBalance() { return this.#balance / 100; }
  getTransactions() { return this.#transactions.map(transaction => ({ ...transaction })); }

  // Default description demonstrates simulated method overloading.
  deposit(amount, description = 'Dining account deposit') {
    const toea = this.#toToea(amount);
    const note = this.#description(description);
    if (!Number.isSafeInteger(this.#balance + toea)) throw new RangeError('Balance exceeds the supported limit.');
    this.#balance += toea;
    this.#record('Deposit', toea, note);
    return this.getBalance();
  }

  payForMeal(amount, description = 'Meal payment') {
    const toea = this.#toToea(amount);
    const note = this.#description(description);
    // A rejected payment changes neither the balance nor the history.
    const minimum = this._minimumBalanceToea();
    if (!Number.isSafeInteger(minimum) || minimum > 0) throw new RangeError('Invalid account balance policy.');
    if (this.#balance - toea < minimum) {
      throw new RangeError(`Insufficient funds: available K${((this.#balance - minimum) / 100).toFixed(2)}, required K${amount.toFixed(2)}.`);
    }
    this.#balance -= toea;
    this.#record('Meal Payment', -toea, note);
    return true;
  }

  displayAccountSummary() {
    console.log(`Account Number: ${this.getAccountNumber()}`);
    console.log(`Account Type: ${this.getAccountType()}`);
    console.log(`Current Balance: K${this.getBalance().toFixed(2)}`);
  }
}
module.exports = DiningAccount;
