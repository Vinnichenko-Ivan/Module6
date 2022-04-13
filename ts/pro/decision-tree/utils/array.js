define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.numberMatrix = exports.numberArray = void 0;
    function numberArray(length) {
        let array = new Array(length);
        for (let i = 0; i < length; i++) {
            array[i] = 0;
        }
        return array;
    }
    exports.numberArray = numberArray;
    function numberMatrix(height, width) {
        let array = new Array(height);
        for (let i = 0; i < height; i++) {
            array[i] = new Array(width);
            for (let j = 0; j < width; j++) {
                array[i][j] = 0;
            }
        }
        return array;
    }
    exports.numberMatrix = numberMatrix;
});
//# sourceMappingURL=array.js.map