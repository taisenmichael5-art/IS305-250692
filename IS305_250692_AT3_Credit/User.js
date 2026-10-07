const V = require('./validation');
const { ROLES } = require('./constants');
class User {
  #userId; #firstName; #lastName; #email; #userType;
  constructor(userId, firstName, lastName, email, userType = 'Student') {
    this.#userId = V.id(userId, 'User ID');
    this.#userType = V.choice(userType, ROLES, 'User type');
    this.firstName = firstName; this.lastName = lastName; this.email = email;
    this.validate();
  }
  get userId() { return this.#userId; }
  get firstName() { return this.#firstName; }
  set firstName(value) { this.#firstName = V.text(value, 'First name', 100); }
  get lastName() { return this.#lastName; }
  set lastName(value) { this.#lastName = V.text(value, 'Last name', 100); }
  get email() { return this.#email; }
  set email(value) { this.#email = V.email(value); }
  get userType() { return this.#userType; }
  getFullName() { return `${this.#firstName} ${this.#lastName}`; }
  validate() {
    V.id(this.#userId); V.text(this.#firstName, 'First name'); V.text(this.#lastName, 'Last name'); V.email(this.#email); V.choice(this.#userType, ROLES, 'User type'); return true;
  }
  getPermissions() { return ['submit own requests', 'view own requests', 'update own Submitted requests', 'cancel own Submitted requests']; }
  displayInfo() { return `${this.userId} | ${this.getFullName()} | ${this.userType} | ${this.email}`; }
  toJSON() { return { className: 'User', userId: this.userId, firstName: this.firstName, lastName: this.lastName, email: this.email, userType: this.userType }; }
}
module.exports = User;
