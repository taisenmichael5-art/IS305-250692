const DiningAccount = require('./DiningAccount');
const RewardsDiningAccount = require('./RewardsDiningAccount');
const CreditDiningAccount = require('./CreditDiningAccount');
const Student = require('./Student');
const MealBooking = require('./MealBooking');

function displayTransactionHistory(account) {
    console.log('\n=== TRANSACTION HISTORY ===');
    account.getTransactions().forEach((t, index) => {
        console.log(`${index + 1}. ${t.type} — K${Math.abs(t.amount).toFixed(2)}`);
        console.log(`   Signed amount: K${t.amount.toFixed(2)}`);
        console.log(`   Description: ${t.description}`);
        console.log(`   Date and time: ${t.timestamp}`);
        console.log(`   Balance: K${t.balanceAfter.toFixed(2)}`);
    });
    console.log(`Total Transactions: ${account.getTransactions().length}`);
}
function runPart1Demonstration() {
    console.log('\n=== STANDARD DINING ACCOUNT ===');
    const standard = new DiningAccount('DA001', 1000);
    console.log('Account Number: DA001\nOpening Balance: K1000.00');
    standard.deposit(500); console.log('Deposit: K500.00');
    standard.payForMeal(200, 'Meal payment');
    console.log('Meal Payment: K200.00\nPayment successful');
    console.log(`Final Balance: K${standard.getBalance().toFixed(2)}`);
    try { standard.payForMeal(2000); } catch (error) { console.log(`Payment rejected: ${error.message}`); }
    console.log('\n=== REWARDS DINING ACCOUNT ===');
    const rewards = new RewardsDiningAccount('RA001', 1500, 2.5);
    rewards.deposit(500, 'Weekly meal allowance');
    console.log('Account Number: RA001');
    console.log(`Balance Before Reward: K${rewards.getBalance().toFixed(2)}`);
    console.log(`Reward Rate: ${rewards.getRewardRate()}%`);
    console.log(`Reward Earned: K${rewards.calculateReward().toFixed(2)}`);
    rewards.applyReward(); console.log(`Final Balance: K${rewards.getBalance().toFixed(2)}`);
    return { standard, rewards };
}
function runPart2Demonstration() {
    console.log('\n=== CREDIT ACCOUNT — EXACT LIMIT DEMONSTRATION ===');
    const credit = new CreditDiningAccount('CA001', 1000, 500);
    credit.payForMeal(1500, 'Catering payment');
    console.log(`Payment successful. Resulting Balance: K${credit.getBalance().toFixed(2)}`);
    try { credit.payForMeal(1, 'Exceeds limit'); } catch (error) { console.log(error.message); }
    console.log('\n=== POLYMORPHIC ACCOUNT PROCESSING ===');
    const diningAccounts = [new DiningAccount('POLY-D', 100),
        new RewardsDiningAccount('POLY-R', 100, 2.5), credit];
    for (const account of diningAccounts) account.displayAccountSummary();

    console.log('\n=== SIMULATED OVERLOADING ===');
    const empty = new DiningAccount('DA001');
    const funded = new DiningAccount('DA002', 500);
    empty.deposit(100); empty.deposit(100, 'Additional meal funds');
    empty.displayAccountSummary(); funded.displayAccountSummary();

    const student = new Student('DWU2026001', 'Maria', 'Kila');
    const rewards = new RewardsDiningAccount('RA001', 100, 2.5);
    student.assignDiningAccount(rewards);
    console.log('\n=== STUDENT DINING ACCOUNT ===');
    console.log(`Student: ${student.getFullName()}\nStudent ID: ${student.studentId}`);
    console.log('Account Type: RewardsDiningAccount\nAccount Number: RA001\nOpening Balance: K100.00');
    const booking = new MealBooking({ student, mealDate: '2026-10-07', mealType: 'Dinner', quantity: 2 });
    const result = booking.processPayment(student.getDiningAccount());
    console.log('\n=== MEAL BOOKING ===');
    console.log(`Meal: ${booking.mealType}\nQuantity: ${booking.quantity}\nTotal Cost: K${booking.calculateTotal().toFixed(2)}`);
    console.log(`Payment Status: ${result.success ? 'Successful' : 'Rejected'}\nBooking Status: ${booking.bookingStatus}`);
    console.log(`Remaining Balance: K${rewards.getBalance().toFixed(2)}`);
    console.log(booking.processPayment(rewards).message); // Duplicate payment rejection.
    displayTransactionHistory(rewards);

    console.log('\n=== PENDING PAYMENT AND FUNDED RETRY ===');
    const taisen = new Student('250692', 'Taisen', 'Marainump');
    const standard = new DiningAccount('DA250692'); taisen.assignDiningAccount(standard);
    const lunch = new MealBooking({ student: taisen, mealDate: '2026-10-07', mealType: 'Lunch', quantity: 2 });
    console.log(lunch.processPayment(standard).message);
    console.log(`Booking Status: ${lunch.bookingStatus}`);
    standard.deposit(100, 'Weekly meal allowance');
    console.log(lunch.processPayment(standard).message);
    console.log(lunch.getSummary()); displayTransactionHistory(standard);
    displayTransactionHistory(credit);
    return { credit, student, booking, rewards, taisen, lunch, standard };
}
module.exports = { runPart1Demonstration, runPart2Demonstration, displayTransactionHistory };
