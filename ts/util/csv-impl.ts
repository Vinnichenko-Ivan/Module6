import {Attribute, Class, Dataset, Template} from "./csv";

export class DatasetImpl implements Dataset {

    readonly attributes: Attribute[];

    readonly class: Class;

    readonly templates: Template[];

    constructor(attributes: Attribute[],
                templates: Template[],
                classIndex: number) {
        this.attributes = attributes;
        this.class = attributes[classIndex];
        this.templates = templates;
    }

    get attributeCount(): number {
        return this.attributes.length;
    }

    get templateCount(): number {
        return this.templates.length;
    }

    add(template: Template): void {
        this.templates.push(template);
    }

    copyMeta(): Dataset {
        return new DatasetImpl(this.attributes, [], this.class.index);
    }

    copyFull(): Dataset {
        return new DatasetImpl(this.attributes, [...this.templates], this.class.index);
    }
}

export class AttributeEnum implements Attribute {

    readonly index: number;

    readonly name: string;

    readonly values: string[];

    private readonly names: {[key: string]: number} = {};

    constructor(index: number, values: string[], name?: string) {
        this.index = index;
        this.values = values;
        this.name = name == undefined ? String(index) : name;
        for (let i = 0; i < values.length; i++) {
            this.names[values[i]] = i;
        }
    }

    get isClass(): boolean {
        return false;
    }

    get isDiscrete(): boolean {
        return true;
    }

    get isNumeric(): boolean {
        return false;
    }

    get valueCount(): number {
        return this.values.length;
    }

    parse(value: string): number {
        return this.names[value];
    }
}

export class AttributeNumber implements Attribute {

    readonly index: number;

    readonly name: string;

    constructor(index: number, name?: string) {
        this.index = index;
        this.name = name == undefined ? String(index) : name;
    }

    get isClass(): boolean {
        return false;
    }

    get isDiscrete(): boolean {
        return false;
    }

    get isNumeric(): boolean {
        return true;
    }

    get valueCount(): number {
        throw 'Числовой атрибут не поддерживает дискретные значения';
    }

    get values(): string[] {
        throw 'Числовой атрибут не поддерживает дискретные значения';
    }

    parse(value: string): number {
        return +value;
    }
}

export class ClassImpl extends AttributeEnum {

    constructor(index: number, values: string[], name?: string) {
        super(index, values, name);
    }

    get isClass(): boolean {
        return true;
    }
}

export class TemplateImpl implements Template {

    private readonly values: number[];

    constructor(values: number[]) {
        this.values = values;
    }

    isMissing(attribute: Attribute): boolean {
        return false;
    }

    value(attribute: Attribute | Class): number {
        return this.values[attribute.index];
    }

    static of(attributes: Attribute[], unparsedValues: string[]) {
        let values = new Array<number>(attributes.length);

        for (let i = 0; i < values.length; i++) {
            values[i] = attributes[i].parse(unparsedValues[i]);
        }

        return new TemplateImpl(values);
    }
}