define(["require", "exports", "./math", "./array"], function (require, exports, math_1, array_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.infoGain = exports.Distribution = void 0;
    class Distribution {
        constructor(numBags, numClasses) {
            this.perClassPerBag = array_1.numberMatrix(numBags, numClasses);
            this.perBag = array_1.numberArray(numBags);
            this.perClass = array_1.numberArray(numClasses);
            this._totalCount = 0;
        }
        get classCount() {
            return this.perClass.length;
        }
        get bagCount() {
            return this.perBag.length;
        }
        get totalCount() {
            return this._totalCount;
        }
        get maxClass() {
            let maxCount = 0;
            let maxIndex = 0;
            for (let i = 0; i < this.classCount; i++) {
                if (this.perClass[i] > maxCount) {
                    maxCount = this.perClass[i];
                    maxIndex = i;
                }
            }
            return maxIndex;
        }
        get maxBag() {
            let maxCount = 0;
            let maxIndex = 0;
            for (let i = 0; i < this.bagCount; i++) {
                if (this.perBag[i] > maxCount) {
                    maxCount = this.perBag[i];
                    maxIndex = i;
                }
            }
            return maxIndex;
        }
        add(bagIndex, classIndex) {
            this.perClassPerBag[bagIndex][classIndex]++;
            this.perBag[bagIndex]++;
            this.perClass[classIndex]++;
            this._totalCount++;
        }
        check(minNoObj) {
            let counter = 0;
            for (let i = 0; i < this.bagCount; i++) {
                if (this.perBag[i] >= minNoObj) {
                    counter++;
                }
            }
            return counter > 1;
        }
        static of(dataset) {
            let bags = new Distribution(1, dataset.class.valueCount);
            for (const template of dataset.templates) {
                bags.add(0, template.value(dataset.class));
            }
            return bags;
        }
    }
    exports.Distribution = Distribution;
    function oldEntropy(distribution) {
        return math_1.entropy(distribution.perClass, distribution.totalCount);
    }
    function newEntropy(distribution) {
        let value = 0;
        for (let i = 0; i < distribution.bagCount; i++) {
            value += distribution.perBag[i]
                / distribution.totalCount
                * math_1.entropy(distribution.perClassPerBag[i], distribution.perBag[i]);
        }
        return value;
    }
    function infoGain(bags) {
        return oldEntropy(bags) - newEntropy(bags);
    }
    exports.infoGain = infoGain;
});
//# sourceMappingURL=id3.js.map