define(["require", "exports", "./csv-impl"], function (require, exports, csv_impl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadDatasetFromData = exports.loadDatasetFromString = exports.toTable = void 0;
    function toTable(string, splitter) {
        if (splitter == undefined) {
            splitter = string.includes(';') ? ';' : ',';
        }
        let lines = string
            .replace(/"/g, '')
            .replace(/_/g, ' ')
            .split('\n');
        let array = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length === 0 || lines[i].match(/^( *%)/)) {
                continue;
            }
            let attributes = [];
            for (const attribute of lines[i].split(splitter)) {
                attributes.push(attribute);
            }
            array.push(attributes);
        }
        return array;
    }
    exports.toTable = toTable;
    function loadDatasetFromString(string, classIndex, namedAttributes, splitter) {
        return loadDatasetFromData(toTable(string, splitter), classIndex, namedAttributes);
    }
    exports.loadDatasetFromString = loadDatasetFromString;
    function loadDatasetFromData(table, classIndex, namedAttributes) {
        let attributes = [];
        let templates = [];
        if (classIndex == undefined) {
            classIndex = table[0].length - 1;
        }
        for (let i = 0; i < table[0].length; i++) {
            let name = namedAttributes ? table[0][i] : undefined;
            if (i == classIndex) {
                let classes = [];
                for (let j = name ? 1 : 0; j < table.length; j++) {
                    if (classes.indexOf(table[j][i]) == -1) {
                        classes.push(table[j][i]);
                    }
                }
                attributes.push(new csv_impl_1.ClassImpl(i, classes, name));
                continue;
            }
            if (table[name ? 1 : 0][i].match(/^(\-)?[\d\.\,]+$/)) {
                attributes.push(new csv_impl_1.AttributeNumber(i, name));
            }
            else {
                let values = [];
                for (let j = name ? 1 : 0; j < table.length; j++) {
                    if (values.indexOf(table[j][i]) == -1) {
                        values.push(table[j][i]);
                    }
                }
                attributes.push(new csv_impl_1.AttributeEnum(i, values, name));
            }
        }
        for (let i = namedAttributes ? 1 : 0; i < table.length; i++) {
            templates.push(csv_impl_1.TemplateImpl.of(attributes, table[i]));
        }
        return new csv_impl_1.DatasetImpl(attributes, templates, classIndex);
    }
    exports.loadDatasetFromData = loadDatasetFromData;
});
//# sourceMappingURL=csv-loader.js.map