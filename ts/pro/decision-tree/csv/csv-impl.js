define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TemplateImpl = exports.ClassImpl = exports.AttributeNumber = exports.AttributeEnum = exports.DatasetImpl = void 0;
    class DatasetImpl {
        constructor(attributes, templates, classIndex) {
            this.attributes = attributes;
            this.class = attributes[classIndex];
            this.templates = templates;
        }
        get attributeCount() {
            return this.attributes.length;
        }
        get templateCount() {
            return this.templates.length;
        }
        copyMeta() {
            return new DatasetImpl(this.attributes, [], this.class.index);
        }
        copyFull() {
            return new DatasetImpl(this.attributes, [...this.templates], this.class.index);
        }
        shuffle() {
            let copy = [...this.templates];
            for (let i = 0; i < this.templateCount; i++) {
                let index = (Math.random() * copy.length) | 0;
                this.templates[i] = copy[index];
                copy.splice(index, 1);
            }
        }
    }
    exports.DatasetImpl = DatasetImpl;
    class AttributeEnum {
        constructor(index, values, name) {
            this.names = {};
            this.index = index;
            this.values = values;
            this.name = name == undefined ? String(index) : name;
            for (let i = 0; i < values.length; i++) {
                this.names[values[i]] = i;
            }
        }
        get isClass() {
            return false;
        }
        get isDiscrete() {
            return true;
        }
        get isNumeric() {
            return false;
        }
        get valueCount() {
            return this.values.length;
        }
        displayValue(value) {
            return this.values[value];
        }
        parse(value) {
            return this.names[value];
        }
    }
    exports.AttributeEnum = AttributeEnum;
    class AttributeNumber {
        constructor(index, name) {
            this.index = index;
            this.name = name == undefined ? String(index) : name;
        }
        get isClass() {
            return false;
        }
        get isDiscrete() {
            return false;
        }
        get isNumeric() {
            return true;
        }
        get valueCount() {
            throw 'Числовой атрибут не поддерживает дискретные значения';
        }
        get values() {
            throw 'Числовой атрибут не поддерживает дискретные значения';
        }
        displayValue(value) {
            return parseFloat(value.toFixed(3)).toString();
        }
        parse(value) {
            return +value;
        }
    }
    exports.AttributeNumber = AttributeNumber;
    class ClassImpl extends AttributeEnum {
        constructor(index, values, name) {
            super(index, values, name);
        }
        get isClass() {
            return true;
        }
    }
    exports.ClassImpl = ClassImpl;
    class TemplateImpl {
        constructor(values) {
            this.values = values;
        }
        isMissing(attribute) {
            return false;
        }
        value(attribute) {
            return this.values[attribute.index];
        }
        static of(attributes, unparsedValues) {
            let values = new Array(attributes.length);
            for (let i = 0; i < values.length; i++) {
                values[i] = attributes[i].parse(unparsedValues[i]);
            }
            return new TemplateImpl(values);
        }
    }
    exports.TemplateImpl = TemplateImpl;
});
//# sourceMappingURL=csv-impl.js.map