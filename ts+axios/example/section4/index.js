var Greeter = /** @class */ (function () {
    function Greeter(message) {
        this.greeting = message;
    }
    Greeter.prototype.greet = function () {
        return 'Hello, ' + this.greeting;
    };
    Greeter.standardGreeting = 'Hello, there';
    return Greeter;
}());
var greeter = new Greeter('world');
console.log(greeter.greet());
