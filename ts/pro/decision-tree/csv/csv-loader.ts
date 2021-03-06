import {Dataset} from "./csv";
import {AttributeEnum, AttributeNumber, ClassImpl, DatasetImpl, TemplateImpl} from "./csv-impl";

/**
 * Преобразовать строку в таблицу
 * @param string строка
 * @param splitter разделитель атрибутов в строках. По умолчанию ';'.
 * @return {string[][]} набор данных
 */
export function toTable(string: string, splitter?: string): string[][] {
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

/**
 * Загрузить набор данных из строки
 * @param string строка
 * @param classIndex индекс столбца класса
 * @param namedAttributes присутствует ли строка с именами атрибутов? По умолчанию false.
 * @param splitter разделитель атрибутов в строках. По умолчанию ';'.
 * @return {Dataset} набор данных
 */
export function loadDatasetFromString(string: string, classIndex?: number, namedAttributes?: boolean, splitter?: string): Dataset {
    return loadDatasetFromData(toTable(string, splitter), classIndex, namedAttributes);
}

/**
 * Загрузить набор данных из таблицы
 * @param table таблица
 * @param classIndex индекс столбца класса
 * @param namedAttributes присутствует ли строка с именами атрибутов? По умолчанию false.
 * @return {Dataset} набор данных
 */
export function loadDatasetFromData(table: string[][], classIndex?: number, namedAttributes?: boolean): Dataset {
    let attributes = [];
    let templates = [];

    if (classIndex == undefined) {
        classIndex = table[0].length - 1;
    }

    // Загружаем атрибуты
    for (let i = 0; i < table[0].length; i++) {
        let name = namedAttributes ? table[0][i] : undefined;

        // Если это класс
        if (i == classIndex) {
            let classes = [];

            for (let j = name ? 1 : 0; j < table.length; j++) {
                if (classes.indexOf(table[j][i]) == -1) {
                    classes.push(table[j][i]);
                }
            }
            attributes.push(new ClassImpl(i, classes, name))
            continue;
        }

        // Для чисел
        if (table[name ? 1 : 0][i].match(/^(\-)?[\d\.\,]+$/)) {
            attributes.push(new AttributeNumber(i, name))
        }

        // Для enum
        else {
            let values = [];

            for (let j = name ? 1 : 0; j < table.length; j++) {
                if (values.indexOf(table[j][i]) == -1) {
                    values.push(table[j][i]);
                }
            }
            attributes.push(new AttributeEnum(i, values, name))
        }
    }

    // Загружаем выборку
    for (let i = namedAttributes ? 1 : 0; i < table.length; i++) {
        templates.push(TemplateImpl.of(attributes, table[i]));
    }

    return new DatasetImpl(attributes, templates, classIndex);
}