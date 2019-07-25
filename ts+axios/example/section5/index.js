function add(x) {
    if (Array.isArray(x)) {
        return x.reduce(function (prev, next) {
            return prev + next;
        }, 0);
    }
    else {
        return true;
    }
}
console.log(add([1, 2, 3]));
console.log(add(1));
