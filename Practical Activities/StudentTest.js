const Student = require("./Student");

const jessie = new Student();
console.log("No-argument values:", jessie.toString());

const jack = new Student(8906);
console.log("One-argument values:", jack.toString());

const harry = new Student(8908, "Harry");
console.log("Two-argument values:", harry.toString());

const barry = new Student(8900, "Barry", "Allen");
console.log("Three-argument values:", barry.toString());