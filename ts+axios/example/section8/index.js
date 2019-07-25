// function extend<T, U>(first: T, second: U): T & U {
//   let result = {} as T & U
var UIElement = /** @class */ (function () {
    function UIElement() {
    }
    UIElement.prototype.animate = function (dx, dy, easing) {
        // if (easing === 'ease-in') {
        // }
    };
    return UIElement;
}());
var button = new UIElement();
button.animate(0, 0, 'ease-in');
button.animate(0, 0, null);
