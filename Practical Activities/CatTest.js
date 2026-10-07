const Cat = require("./Cat");

const firstCat = new Cat();

firstCat.name = "Fifi";
firstCat.sayMeow();

console.log(`Cat ${firstCat.name} is ${firstCat.color}`);

const secondCat = new Cat("Fifi Jnr", "white");

secondCat.sayMeow();

console.log(`Cat ${secondCat.name} is ${secondCat.color}`);