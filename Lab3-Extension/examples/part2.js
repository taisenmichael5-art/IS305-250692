import { DiningAccount } from '../DiningAccount.js';
import { RewardsDiningAccount } from '../RewardsDiningAccount.js';
import { CreditDiningAccount } from '../CreditDiningAccount.js';
// Same method call, different behaviour: polymorphism over an array of accounts.
const accounts = [new DiningAccount('S1', '250692', 20),
  new RewardsDiningAccount('R1', '250692', 0, 0.02),
  new CreditDiningAccount('C1', '250692', 20, 100)];
accounts[1].deposit(20);
for (const account of accounts) {
  try {
    account.payMeal({ amount: 30, bookingId: 'DEMO-LUNCH' });
    console.log(`${account.getAccountType()}: payment accepted.`);
  } catch (error) { console.log(`${account.getAccountType()}: ${error.message}`); }
}
console.table(accounts.map(account => account.getSummary()));
