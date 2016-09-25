var Pricey = require('../dist/pricey').default;
var config = require('../dist/pricey').currencies.EUR;

var p1 = Pricey.createPrice('0.1', config);

var p2 = Pricey.createPrice(0.2, config);
var p3 = Pricey.createPrice(10, config);
var p4 = Pricey.addTax(p3, 19);
var p9 = Pricey.includingTax(p2, 19);

var p5 = Pricey.addDiscount(p3, 5);
var p6 = Pricey.addTax(p5,19);
var p7 = Pricey.createPrice('0.5', config);
var p8 = Pricey.addTax(p7, 7);

var c = Pricey.createCalulation([p1,p2,p3,p4,p5,p6,p8,p9]);
console.log(p3.toString());
console.log(p4.toString());
console.log(p6.toString());
console.log(p9.toString());

console.log(Pricey.hasTax(p9));
console.log(Pricey.hasTax(p1));

console.log(c.toString());
