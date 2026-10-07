import { DiningAccount } from './DiningAccount.js';

/** Reward rate is a percentage: pass 2.5 for 2.5%, not 0.025. */
export class RewardsDiningAccount extends DiningAccount {
  #rewardRate;

  constructor(accountNumber, openingBalance = 0, rewardRate = 0) {
    if (typeof rewardRate !== 'number' || !Number.isFinite(rewardRate) || rewardRate < 0 || rewardRate > 100) {
      throw new RangeError('Reward rate must be a number between 0 and 100 percent.');
    }
    super(accountNumber, openingBalance); // Constructor chaining.
    this.#rewardRate = rewardRate;
  }

  getRewardRate() { return this.#rewardRate; }
  getAccountType() { return 'Rewards Dining Account'; } // Method overriding.

  calculateReward() {
    // Reward = current balance × rate / 100, rounded to the nearest toea.
    return Math.round(this.getBalance() * this.#rewardRate) / 100;
  }

  applyReward() {
    const reward = this.calculateReward();
    if (reward > 0) {
      // Reuse the inherited validated balance-changing method.
      super.deposit(reward, `Reward credit at ${this.#rewardRate}%`);
    }
    return reward;
  }

  displayAccountSummary() {
    super.displayAccountSummary();
    console.log(`Reward Rate: ${this.#rewardRate}%`);
  }
}
export default RewardsDiningAccount;
