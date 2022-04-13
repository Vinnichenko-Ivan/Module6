define(["require", "exports", "../utils/id3"], function (require, exports, id3_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NumberCondition = exports.EnumCondition = exports.NumberSplit = exports.EnumSplit = void 0;
    class EnumSplit {
        constructor(dataset, attribute, minSubsetSize) {
            this.dataset = dataset;
            this.attribute = attribute;
            this.minSubsetSize = minSubsetSize;
        }
        get infoGain() {
            return this._infoGain;
        }
        calc() {
            let bags = new id3_1.Distribution(this.attribute.valueCount, this.dataset.class.valueCount);
            for (const template of this.dataset.templates) {
                if (!template.isMissing(this.attribute)) {
                    bags.add(template.value(this.attribute), template.value(this.dataset.class));
                }
            }
            if (bags.check(this.minSubsetSize)) {
                this._infoGain = id3_1.infoGain(bags);
                return true;
            }
            return false;
        }
        split() {
            let subsets = new Array(this.attribute.valueCount);
            for (let i = 0; i < subsets.length; i++) {
                subsets[i] = this.dataset.copyMeta();
            }
            for (const template of this.dataset.templates) {
                subsets[template.value(this.attribute)].templates.push(template);
            }
            return subsets;
        }
        conditions() {
            let conditions = new Array(this.attribute.valueCount);
            for (let valueIndex = 0; valueIndex < this.attribute.valueCount; valueIndex++) {
                conditions[valueIndex] = new EnumCondition(this.attribute, valueIndex);
            }
            return conditions;
        }
    }
    exports.EnumSplit = EnumSplit;
    class NumberSplit {
        constructor(dataset, attribute, minSubsetSize) {
            this.dataset = dataset;
            this.attribute = attribute;
            this.minSubsetSize = minSubsetSize;
        }
        get infoGain() {
            return this._infoGain;
        }
        calc() {
            let sortedTemplates = [...this.dataset.templates].sort((e1, e2) => {
                return e1.value(this.attribute) - e2.value(this.attribute);
            });
            let thresholds = [];
            for (let i = 1; i < sortedTemplates.length; i++) {
                let lastValue = sortedTemplates[i - 1].value(this.attribute);
                let currentValue = sortedTemplates[i].value(this.attribute);
                let lastClass = sortedTemplates[i - 1].value(this.dataset.class);
                let currentClass = sortedTemplates[i].value(this.dataset.class);
                if (lastValue == currentValue || lastClass == currentClass) {
                    continue;
                }
                thresholds.push((lastValue + currentValue) / 2);
            }
            for (const threshold of thresholds) {
                let bags = new id3_1.Distribution(2, this.dataset.class.valueCount);
                for (const template of this.dataset.templates) {
                    if (!template.isMissing(this.attribute)) {
                        let index = template.value(this.attribute) <= threshold ? 0 : 1;
                        bags.add(index, template.value(this.dataset.class));
                    }
                }
                let gain = id3_1.infoGain(bags);
                if (bags.check(this.minSubsetSize) && (this._infoGain == undefined || gain > this._infoGain)) {
                    this._threshold = threshold;
                    this._infoGain = gain;
                }
            }
            return this._infoGain != undefined;
        }
        split() {
            let subsets = new Array(2);
            for (let i = 0; i < subsets.length; i++) {
                subsets[i] = this.dataset.copyMeta();
            }
            for (const template of this.dataset.templates) {
                let index = template.value(this.attribute) <= this._threshold ? 0 : 1;
                subsets[index].templates.push(template);
            }
            return subsets;
        }
        conditions() {
            let conditions = new Array(2);
            conditions[0] = new NumberCondition(this.attribute, this._threshold, true);
            conditions[1] = new NumberCondition(this.attribute, this._threshold, false);
            return conditions;
        }
    }
    exports.NumberSplit = NumberSplit;
    class AbstractCondition {
        constructor(attribute) {
            this._attribute = attribute;
        }
        displayAttribute() {
            return this._attribute.name;
        }
        toString() {
            return this.displayAttribute() + ' ' + this.displayOperator() + ' ' + this.displayValue();
        }
    }
    class EnumCondition extends AbstractCondition {
        constructor(attribute, value) {
            super(attribute);
            this._value = value;
        }
        check(template) {
            return template.value(this._attribute) == this._value;
        }
        displayOperator() {
            return '=';
        }
        displayValue() {
            return this._attribute.displayValue(this._value);
        }
    }
    exports.EnumCondition = EnumCondition;
    class NumberCondition extends AbstractCondition {
        constructor(attribute, value, lessOrEquals) {
            super(attribute);
            this._value = value;
            this._lessOrEquals = lessOrEquals;
        }
        check(template) {
            return (template.value(this._attribute) <= this._value) == this._lessOrEquals;
        }
        displayOperator() {
            return this._lessOrEquals ? '⩽' : '>';
        }
        displayValue() {
            return this._attribute.displayValue(this._value);
        }
    }
    exports.NumberCondition = NumberCondition;
});
//# sourceMappingURL=classifier-id3.js.map