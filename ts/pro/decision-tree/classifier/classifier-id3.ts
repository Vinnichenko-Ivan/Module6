import {Attribute, Dataset, Template} from "../csv/csv";
import {Distribution, infoGain} from "../utils/id3";
import {Condition, Split} from "./classifier";

/**
 * Разделение дискретного атрибута
 * @author Аникушин Роман
 */
export class EnumSplit implements Split {

    private readonly minSubsetSize: number;

    private readonly dataset: Dataset;

    readonly attribute: Attribute;

    private _infoGain: number;

    constructor(dataset: Dataset, attribute: Attribute, minSubsetSize: number) {
        this.dataset = dataset;
        this.attribute = attribute;
        this.minSubsetSize = minSubsetSize;
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

        if (bags.check(this.minSubsetSize)) {
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

    conditions(): AbstractCondition[] {
        let conditions = new Array<AbstractCondition>(this.attribute.valueCount);

        for (let valueIndex = 0; valueIndex < this.attribute.valueCount; valueIndex++) {
            conditions[valueIndex] = new EnumCondition(this.attribute, valueIndex);
        }

        return conditions;
    }
}

/**
 * Разделение числового атрибута
 * @author Аникушин Роман
 */
export class NumberSplit implements Split {

    private readonly dataset: Dataset;

    private readonly minSubsetSize: number;

    readonly attribute: Attribute;

    private _infoGain: number;

    private _threshold: number;

    constructor(dataset: Dataset, attribute: Attribute, minSubsetSize: number) {
        this.dataset = dataset;
        this.attribute = attribute;
        this.minSubsetSize = minSubsetSize;
    }

    get infoGain(): number {
        return this._infoGain;
    }

    calc(): boolean {
        let sortedTemplates = [...this.dataset.templates].sort((e1, e2) => {
            return e1.value(this.attribute) - e2.value(this.attribute);
        });

        // Поиск всех порогов, где класс меняется
        let thresholds = new Set<number>()
        for (let i = 1; i < sortedTemplates.length; i++) {
            let lastValue = sortedTemplates[i - 1].value(this.attribute);
            let currentValue = sortedTemplates[i].value(this.attribute);

            let lastClass = sortedTemplates[i - 1].value(this.dataset.class);
            let currentClass = sortedTemplates[i].value(this.dataset.class);

            // ЭВРИСТИКА ДЛЯ ОПТИМИЗАЦИИ
            // https://habr.com/ru/company/ods/blog/322534/
            if (lastClass == currentClass) {
                continue;
            }

            thresholds.add((lastValue + currentValue) / 2);
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

            if (bags.check(this.minSubsetSize) && (this._infoGain == undefined || gain > this._infoGain)) {
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

    conditions(): AbstractCondition[] {
        let conditions = new Array<AbstractCondition>(2);

        conditions[0] = new NumberCondition(this.attribute, this._threshold, true);
        conditions[1] = new NumberCondition(this.attribute, this._threshold, false);

        return conditions;
    }
}

/**
 * Условие перехода на узел ниже
 * @author Аникушин Роман
 */
abstract class AbstractCondition implements Condition {

    protected readonly _attribute: Attribute;

    protected constructor(attribute: Attribute) {
        this._attribute = attribute;
    }

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
 * @author Аникушин Роман
 */
export class EnumCondition extends AbstractCondition {

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
        return this._attribute.displayValue(this._value);
    }
}

/**
 * Числовое условие (<= или >)
 * @author Аникушин Роман
 */
export class NumberCondition extends AbstractCondition {

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
        return this._attribute.displayValue(this._value);
    }
}