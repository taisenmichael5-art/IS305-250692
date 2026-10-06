import { DiningAccount } from './DiningAccount.js';

/** Part 1: specialised rewards account; super() chains to the base constructor. */
export class RewardsDiningAccount extends DiningAccount {
  #bonusRate;
  constructor(accountId, studentId, openingBalance = 0, bonusRate = 0.02) {
    if (accountId !== null && typeof accountId === 'object') {
      ({ accountId, studentId, openingBalance = 0, bonusRate = 0.02 } = accountId);
    }
    if (typeof bonusRate !== 'number' || !Number.isFinite(bonusRate) || bonusRate < 0 || bonusRate > 1) {
      throw new RangeError('Bonus rate must be between 0 and 1.');
    }
    super(accountId, studentId, openingBalance);
    this.#bonusRate = bonusRate;
  }
  getBonusRate() { return this.#bonusRate; }
  getAccountType() { return 'Rewards'; }
  getDepositBonusCents(depositCents) { return Math.round(depositCents * this.#bonusRate); }
  deposit(amount, description = 'Rewards top-up') {
    return super.deposit(amount, description); // Override reuses the atomic base algorithm.
  }
  getSummary() { return { ...super.getSummary(), bonusRate: this.#bonusRate }; }
}
export default RewardsDiningAccount;
