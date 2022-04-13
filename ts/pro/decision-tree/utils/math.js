define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.entropy = exports.log2linear = void 0;
    function log2linear(num) {
        return num <= 0 ? 0 : num * Math.log2(num);
    }
    exports.log2linear = log2linear;
    function entropy(bag, total) {
        let entropy = 0;
        for (let j = 0; j < bag.length; j++) {
            entropy -= log2linear(bag[j] / total);
        }
        return entropy;
    }
    exports.entropy = entropy;
});
//# sourceMappingURL=math.js.map