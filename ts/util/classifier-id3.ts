import {ClassifierTree, Distribution} from "./classifier";
import {Attribute, Dataset, Template} from "./csv";
import {entropy} from "./util";

/**
 * Вычисление энтропии до разбиения:
 * @param distribution распределение
 * @return энтропия
 * @see <a href="https://habr.com/ru/company/ods/blog/322534/">Дерево решений
 */
function oldEntropy(distribution: Distribution): number {
    return entropy(distribution.perClass, distribution.totalCount);
}

/**
 * Вычисление энтропии после разбиения:
 * @param distribution распределение
 * @return энтропия
 * @see <a href="https://habr.com/ru/company/ods/blog/322534/">Дерево решений
 */
function newEntropy(distribution: Distribution): number {
    let value = 0;

    for (let i = 0; i < distribution.bagCount; i++) {
        value += distribution.perBag[i]
            / distribution.totalCount
            * entropy(distribution.perClassPerBag[i], distribution.perBag[i]);
    }
    return value;
}

/**
 * Вычисление прироста информации:
 * @param bags распределение
 * @return прирост информации
 * @see <img src="https://media.cheggcdn.com/media/22c/22c4ec5f-8e44-4f9e-b741-300c8b5bf426/phpo4tnyU.png" width=295 height=85>
 * @see <br><a href="https://habr.com/ru/company/ods/blog/322534/">Дерево решений
 */
function infoGain(bags: Distribution): number {
    return oldEntropy(bags) - newEntropy(bags);
}

/**
 * Разделение
 */
interface Split {

    /**
     * Прирост информации
     */
    get infoGain(): number;

    /**
     * Посчитать прирост информации
     * @return true, если разбиение имеет смысл
     */
    calc(): boolean;

    /**
     * Разделить на подмножества
     */
    split(): Dataset[];

    /**
     * Получить условия подмножеств
     */
    conditions(): Condition[];

}

/**
 * Разделение дискретного атрибута
 */
class EnumSplit implements Split {

    private readonly dataset: Dataset;

    readonly attribute: Attribute;

    private _infoGain: number;

    constructor(dataset: Dataset, attribute: Attribute) {
        this.dataset = dataset;
        this.attribute = attribute;
    }

    get infoGain(): number {
        return this._infoGain;
    }

    calc(): boolean {
        let bags = new Distribution(this.attribute.valueCount, this.dataset.class.valueCount);

        for (const template of this.dataset.templates) {
            if (!template.isMissing(this.attribute)) {
                bags.add(template.value(this.attribute), template.value(this.dataset.class));
            }
        }

        if (bags.check(2)) {
            this._infoGain = infoGain(bags);
            return true;
        }
        return false;
    }

    split(): Dataset[] {
        let subsets = new Array<Dataset>(this.attribute.valueCount);

        for (let i = 0; i < subsets.length; i++) {
            subsets[i] = this.dataset.copyMeta();
        }

        for (const template of this.dataset.templates) {
            subsets[template.value(this.attribute)].templates.push(template);
        }

        return subsets;
    }

    conditions(): Condition[] {
        let conditions = new Array<Condition>(this.attribute.valueCount);

        for (let valueIndex = 0; valueIndex < this.attribute.valueCount; valueIndex++) {
            conditions[valueIndex] = new EnumCondition(this.attribute, valueIndex);
        }

        return conditions;
    }
}

/**
 * Разделение числового атрибута
 */
class NumberSplit implements Split {

    private readonly dataset: Dataset;

    readonly attribute: Attribute;

    private _infoGain: number;

    private _threshold: number;

    constructor(dataset: Dataset, attribute: Attribute) {
        this.dataset = dataset;
        this.attribute = attribute;
    }

    get infoGain(): number {
        return this._infoGain;
    }

    calc(): boolean {
        let sortedTemplates = [...this.dataset.templates].sort((e1, e2) => {
            return e1.value(this.attribute) - e2.value(this.attribute);
        });

        // Поиск всех возможных порогов
        let thresholds = []
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

        // Поиск наилучшего разделения
        for (const threshold of thresholds) {
            let bags = new Distribution(2, this.dataset.class.valueCount);

            for (const template of this.dataset.templates) {
                if (!template.isMissing(this.attribute)) {
                    let index = template.value(this.attribute) <= threshold ? 0 : 1;
                    bags.add(index, template.value(this.dataset.class));
                }
            }
            let gain = infoGain(bags);

            if (bags.check(2) && (this._infoGain == undefined || gain > this._infoGain)) {
                this._threshold = threshold;
                this._infoGain = gain;
            }
        }

        return this._infoGain != undefined;
    }

    split(): Dataset[] {
        let subsets = new Array<Dataset>(2);

        for (let i = 0; i < subsets.length; i++) {
            subsets[i] = this.dataset.copyMeta();
        }

        for (const template of this.dataset.templates) {
            let index = template.value(this.attribute) <= this._threshold ? 0 : 1;
            subsets[index].templates.push(template);
        }

        return subsets;
    }

    conditions(): Condition[] {
        let conditions = new Array<Condition>(2);

        conditions[0] = new NumberCondition(this.attribute, this._threshold, true);
        conditions[1] = new NumberCondition(this.attribute, this._threshold, false);

        return conditions;
    }
}

/**
 * Поиск наилучшего разделения
 * @param dataset данные
 */
function findBestSplit(dataset: Dataset): Split {
    // Принадлежат ли все экземпляры одному классу
    // или недостаточно экземпляров для разделения
    let distribution = Distribution.of(dataset);
    if (distribution.totalCount < 4 || distribution.totalCount == distribution.perClass[distribution.maxClass]) {
        return null;
    }

    // Массив ID3 разделений
    let splits = new Array<Split>(dataset.attributeCount);

    // Для каждого атрибута
    for (const attribute of dataset.attributes) {
        // Если атрибут является классом - пропускаем
        if (attribute.isClass) {
            continue;
        }

        let split;
        if (attribute.isDiscrete) {
            split = new EnumSplit(dataset, attribute);
        }
        else {
            split = new NumberSplit(dataset, attribute);
        }

        if (split.calc()) {
            splits[attribute.index] = split;
        }
    }

    // Поиск лучшего атрибута для разделения
    let maxInfoGain = 0;
    let bestSplit;
    for (const attribute of dataset.attributes) {
        let split = splits[attribute.index];

        if (attribute.isClass || split == undefined) {
            continue;
        }

        if (split.infoGain >= maxInfoGain) {
            maxInfoGain = split.infoGain;
            bestSplit = split;
        }
    }

    return bestSplit;
}

/**
 * Условие перехода на узел ниже
 */
interface Condition {

    /**
     * Проверяет образец по условию.
     * Если образец удовлетворяет условию, то он может спуститься ниже
     * в соответствующий узел дерева.
     * @param template образец
     * @return true, если образец удовлетворяет условию
     */
    check(template: Template): boolean;

    toString(): string;

}

/**
 * Дискретное условие (equals)
 */
class EnumCondition implements Condition {

    private readonly _attribute: Attribute;

    private readonly _value: number;

    constructor(attribute: Attribute, value: number) {
        this._attribute = attribute;
        this._value = value;
    }

    check(template: Template): boolean {
        return template.value(this._attribute) == this._value;
    }

    toString(): string {
        return this._attribute.name + " = " + this._attribute.values[this._value];
    }
}

/**
 * Числовое условие (<= или >)
 */
class NumberCondition implements Condition {

    private readonly _attribute: Attribute;

    private readonly _value: number;

    private readonly _lessOrEquals: boolean;

    constructor(attribute: Attribute, value: number, lessOrEquals: boolean) {
        this._attribute = attribute;
        this._value = value;
        this._lessOrEquals = lessOrEquals;
    }

    check(template: Template): boolean {
        return (template.value(this._attribute) <= this._value) == this._lessOrEquals;
    }

    toString(): string {
        return this._attribute.name + (this._lessOrEquals ? ' <= ' : ' > ') + this._value;
    }
}

/**
 * Класс дерева решений
 */
export class Id3Tree implements ClassifierTree {

    private _dataset: Dataset;

    private _children: Id3Tree[];

    private _condition: Condition;

    private _leaf: boolean;

    private _class: number;

    build(dataset: Dataset) {
        this._dataset = dataset;
        this.buildRecursive(dataset);
    }

    private buildRecursive(dataset: Dataset) {
        let bags = Distribution.of(dataset);
        let split = findBestSplit(dataset);

        this._class = bags.maxClass;
        this._children = [];

        if (split != undefined) {
            let sets = split.split();
            let conditions = split.conditions();

            for (let i = 0; i < sets.length; i++) {
                if (sets[i].templateCount === 0) {
                    continue;
                }

                let child = new Id3Tree();
                child._condition = conditions[i];
                child._dataset = this._dataset;
                child.build(sets[i]);

                this._children.push(child);
            }
            this._leaf = false;
        }
        else {
            this._leaf = true;
        }
    }

    classify(template: Template): number {
        for (const child of this._children) {
            if (child._condition.check(template)) {
                return child.classify(template);
            }
        }

        return this._class;
    }

    toString(): string {
        return this.toStringRecursive(0);
    }

    private toStringRecursive(deep: number): string {
        let string = '';

        let deepStr = '';
        for (let i = 0; i <= deep; i++) {
            deepStr += '----';
        }

        if (this._leaf) {
            string += deepStr + '> ' + this._dataset.class.values[this._class] + '\n';
        }
        else {
            for (let i = 0; i < this._children.length; i++) {
                string += deepStr + '[' + this._children[i]._condition + ']\n';
                string += this._children[i].toStringRecursive(deep + 1);
            }
        }

        return string;
    }
}