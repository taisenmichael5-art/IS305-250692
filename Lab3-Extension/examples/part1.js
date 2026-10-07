// Account-concept demonstration only; this does not replace the DiningApp menu.
import { DiningAccount } from '../DiningAccount.js';
import { RewardsDiningAccount } from '../RewardsDiningAccount.js';
import { formatMoney } from '../money.js';
const accounts = [new DiningAccount('STD-250692', '250692'),
  new RewardsDiningAccount({ accountId: 'RWD-250692', studentId: '250692', bonusRate: 0.02 })];
for (const account of accounts) {
  account.deposit({ amount: 100, description: 'Lab demonstration top-up' });
  account.payMeal(30, 'LUNCH-EXAMPLE');
  console.log(`${account.getAccountType()}: ${formatMoney(account.getBalance())}`);
  console.table(account.getTransactions());
}
