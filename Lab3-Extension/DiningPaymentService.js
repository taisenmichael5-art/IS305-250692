import { DiningAccount } from './DiningAccount.js';
import { requiredText } from './money.js';

/**
 * Part 2: composition helper used INSIDE the existing DiningApp.
 * Selectors read the actual Student/MealBooking APIs, which were not supplied.
 * Does not replace Student, MealBooking or DiningApp, and does not create bookings.
 */
export class DiningPaymentService {
  #accounts = [];
  #paidBookings = new WeakMap();
  #paidIds = new Set();
  #read;
  constructor({ getStudentId, getBookingStudentId, getBookingId, getBookingTotal }) {
    for (const fn of [getStudentId, getBookingStudentId, getBookingId, getBookingTotal]) {
      if (typeof fn !== 'function') throw new TypeError('Supply all four Student/MealBooking selectors.');
    }
    this.#read = { getStudentId, getBookingStudentId, getBookingId, getBookingTotal };
  }
  attachAccount(student, account) {
    const id = requiredText(this.#read.getStudentId(student), 'Student ID');
    if (!(account instanceof DiningAccount)) throw new TypeError('Expected a DiningAccount or subclass.');
    if (account.studentId !== id) throw new Error('Account belongs to a different student.');
    if (this.#accounts.some(item => item.studentId === id)) throw new Error('Student already has an account.');
    if (this.#accounts.some(item => item.accountId === account.accountId)) throw new Error('Account ID already exists.');
    this.#accounts.push(account);
    return account;
  }
  getAccount(student) {
    const id = requiredText(this.#read.getStudentId(student), 'Student ID');
    const account = this.#accounts.find(item => item.studentId === id);
    if (!account) throw new Error('Create a dining account for this student first.');
    return account;
  }
  getAccountSummaries() { return this.#accounts.map(account => account.getSummary()); }
  payForBooking(student, booking) {
    if (!booking || typeof booking !== 'object') throw new TypeError('Expected a MealBooking object.');
    const studentId = requiredText(this.#read.getStudentId(student), 'Student ID');
    const ownerId = requiredText(this.#read.getBookingStudentId(booking), 'Booking student ID');
    const bookingId = requiredText(this.#read.getBookingId(booking), 'Booking ID');
    if (ownerId !== studentId) throw new Error('Cannot pay for another student’s booking.');
    if (this.#paidBookings.has(booking) || this.#paidIds.has(bookingId)) throw new Error('Booking has already been paid.');
    const account = this.getAccount(student);
    const amount = this.#read.getBookingTotal(booking);
    // All selectors and checks run before the payment changes account state.
    const receipt = account.payMeal(amount, bookingId); // Polymorphism: no account-type switch here.
    this.#paidBookings.set(booking, receipt);
    this.#paidIds.add(bookingId);
    return receipt;
  }
  getReceipt(booking) {
    const receipt = this.#paidBookings.get(booking);
    return receipt ? { ...receipt } : null;
  }
}
export default DiningPaymentService;
