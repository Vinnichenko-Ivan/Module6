import {ClassifierTree} from "./classifier";
import {Attribute, Dataset, Template} from "../csv/csv";
import {Distribution, infoGain} from "../utils/id3";

/**
 * Минимальное количество элементов в подмножествах, на которые можно разделить множество
 */
const minSubsetSize = 2;

/**
 * Порог прироста информации, выше которого разделение не будут игнорироваться
 */
const minInfoGain = 0;

/**
 * Максимальная глубина дерева
 */
const maxTreeDepth = 10;

/**
 * Максимальная порог процентного соотношение наибольшего класса,
 * чтобы ветка превратилась в лист
 */
const maxThresholdClassPercent = 1;

/**
 * Минимальный порог процентного соотношение наибольшего класса,
 * чтобы ветка превратилась в лист
 */
const minThresholdClassPercent = 0.5;

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

        if (bags.check(minSubsetSize)) {
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

            if (bags.check(minSubsetSize) && (this._infoGain == undefined || gain > this._infoGain)) {
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
    if (distribution.totalCount < minSubsetSize * 2 || distribution.totalCount == distribution.perClass[distribution.maxClass]) {
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

    if (maxInfoGain <= minInfoGain) {
        return null;
    }

    return bestSplit;
}

/**
 * Условие перехода на узел ниже
 */
abstract class Condition {

    protected readonly _attribute: Attribute;

    protected constructor(attribute: Attribute) {
        this._attribute = attribute;
    }

    /**
     * Проверяет образец по условию.
     * Если образец удовлетворяет условию, то он может спуститься ниже
     * в соответствующий узел дерева.
     * @param template образец
     * @return true, если образец удовлетворяет условию
     */
    abstract check(template: Template): boolean;

    abstract displayOperator(): string;

    abstract displayValue(): string;

    displayAttribute(): string {
        return this._attribute.name;
    }

    toString(): string {
        return this.displayAttribute() + ' ' + this.displayOperator() + ' ' + this.displayValue();
    }
}

/**
 * Дискретное условие (equals)
 */
class EnumCondition extends Condition {

    private readonly _value: number;

    constructor(attribute: Attribute, value: number) {
        super(attribute);
        this._value = value;
    }

    check(template: Template): boolean {
        return template.value(this._attribute) == this._value;
    }

    displayOperator(): string {
        return '=';
    }

    displayValue(): string {
        return this._attribute.values[this._value];
    }
}

/**
 * Числовое условие (<= или >)
 */
class NumberCondition extends Condition {

    private readonly _value: number;

    private readonly _lessOrEquals: boolean;

    constructor(attribute: Attribute, value: number, lessOrEquals: boolean) {
        super(attribute);
        this._value = value;
        this._lessOrEquals = lessOrEquals;
    }

    check(template: Template): boolean {
        return (template.value(this._attribute) <= this._value) == this._lessOrEquals;
    }

    displayOperator(): string {
        return this._lessOrEquals ? '⩽' : '>';
    }

    displayValue(): string {
        return parseFloat(this._value.toFixed(3)).toString();
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

    private _htmlElement: HTMLElement;

    build(dataset: Dataset) {
        this._dataset = dataset;
        this.buildRecursive(dataset, 0);
    }

    classify(template: Template): number {
        for (const child of this._children) {
            if (child._condition.check(template)) {
                return child.classify(template);
            }
        }

        return this._class;
    }

    appendHTMLChildren(parentElement: HTMLElement) {
        this._htmlElement = parentElement;

        if (this._leaf) {
            let liElement = parentElement.appendChild(document.createElement('li'));
            let spanElement = liElement.appendChild(document.createElement('span'));

            spanElement.innerText = this._dataset.class.values[this._class];
            spanElement.classList.add('leaf')
        }
        else {
            for (const child of this._children) {
                let liElement = parentElement.appendChild(document.createElement('li'));
                let spanElement = liElement.appendChild(document.createElement('span'));
                let ulElement = liElement.appendChild(document.createElement('ul'));

                let condition = child._condition;
                spanElement.innerHTML = `${condition.displayAttribute()}<br>${condition.displayOperator()} ${condition.displayValue()}`;
                spanElement.classList.add('node')
                child.appendHTMLChildren(ulElement);
            }
        }
    }

    private static equalsChildren(array: Id3Tree[]): boolean {
        if (array.length === 0 || !array[0]._leaf) {
            return false;
        }

        let classIndex = array[0]._class;
        for (let i = 1; i < array.length; i++) {
            if (!array[i]._leaf || array[i]._class != classIndex) {
                return false;
            }
        }
        return true;
    }

    private testFunction(deep: number): number {
        return (-Math.sqrt(Math.min(deep, maxTreeDepth) / maxTreeDepth) + 1)
            * (maxThresholdClassPercent - minThresholdClassPercent) + minThresholdClassPercent;
    }

    private buildRecursive(dataset: Dataset, deep: number): void {
        let bags = Distribution.of(dataset);

        this._class = bags.maxClass;
        this._leaf = true;
        this._children = [];

        let classPercent = bags.perClass[bags.maxClass] / bags.totalCount;

        if (deep < maxTreeDepth && classPercent <= this.testFunction(deep)) {
            let split = findBestSplit(dataset);

            if (split != undefined) {
                let sets = split.split();
                let conditions = split.conditions();
                let children = []

                for (let i = 0; i < sets.length; i++) {
                    if (sets[i].templateCount === 0) {
                        continue;
                    }

                    let child = new Id3Tree();
                    child._condition = conditions[i];
                    child._dataset = this._dataset;
                    child.buildRecursive(sets[i], deep + 1);
                    children.push(child);
                }

                if (!Id3Tree.equalsChildren(children)) {
                    this._leaf = false;
                    this._children = children;
                }
            }
        }
    }
}