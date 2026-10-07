// Call demonstratePart1() from your EXISTING DiningApp; this is not its replacement.
import { DiningAccount } from './DiningAccount.js';
import { RewardsDiningAccount } from './RewardsDiningAccount.js';
import { pathToFileURL } from 'node:url';

export function demonstratePart1() {
  const standard = new DiningAccount('DA001', 1000);
  console.log('========================================');
  console.log('        STANDARD DINING ACCOUNT');
  console.log('========================================');
  console.log(`Account Number: ${standard.getAccountNumber()}`);
  console.log(`Opening Balance: K${standard.getBalance().toFixed(2)}`);
  standard.deposit(500); // One argument; default description.
  console.log('Deposit: K500.00');
  console.log('Meal Payment: K200.00');
  try {
    standard.payForMeal(200, 'Meal booking payment');
    console.log('Payment successful');
    console.log('Payment Status: Successful');
  } catch (error) { console.log(`Payment rejected: ${error.message}`); }
  console.log(`Final Balance: K${standard.getBalance().toFixed(2)}`);

  const rewards = new RewardsDiningAccount('RA001', 1500, 2.5);
  rewards.deposit(500, 'Weekly meal allowance'); // Two arguments.
  console.log('\n========================================');
  console.log('        REWARDS DINING ACCOUNT');
  console.log('========================================');
  console.log(`Account Number: ${rewards.getAccountNumber()}`);
  console.log(`Balance Before Reward: K${rewards.getBalance().toFixed(2)}`);
  console.log(`Reward Rate: ${rewards.getRewardRate()}%`);
  console.log(`Reward Earned: K${rewards.calculateReward().toFixed(2)}`);
  rewards.applyReward();
  console.log(`Final Balance: K${rewards.getBalance().toFixed(2)}`);
  console.log('========================================');
  return { standard, rewards };
}

export function demonstrateInsufficientFunds() {
  const account = new DiningAccount('DA-REJECT', 100);
  console.log('\nINSUFFICIENT-FUNDS CHECK');
  try {
    account.payForMeal(200, 'Rejected meal payment');
    console.log('Payment successful');
  } catch (error) { console.log(`Payment rejected: ${error.message}`); }
  console.log(`Unchanged Balance: K${account.getBalance().toFixed(2)}`);
  return account;
}

// Direct demonstration command; importing into DiningApp has no automatic side effects.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  demonstratePart1();
  if (process.argv.includes('--rejection')) demonstrateInsufficientFunds();
}
