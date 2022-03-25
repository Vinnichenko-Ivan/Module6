import {Dataset, Template} from "./csv";
import {numberArray, numberMatrix} from "./util";

/**
 * Распределения
 */
export class Distribution {

    private _totalCount: number;

    readonly perClassPerBag: number[][];

    readonly perBag: number[];

    readonly perClass: number[];

    constructor(numBags: number, numClasses: number) {
        this.perClassPerBag = numberMatrix(numBags, numClasses);
        this.perBag = numberArray(numBags);
        this.perClass = numberArray(numClasses);
        this._totalCount = 0;
    }

    get classCount(): number {
        return this.perClass.length;
    }

    get bagCount(): number {
        return this.perBag.length;
    }

    get totalCount(): number {
        return this._totalCount;
    }

    get maxClass(): number {
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

    add(bagIndex: number, classIndex: number): void {
        this.perClassPerBag[bagIndex][classIndex]++;
        this.perBag[bagIndex]++;
        this.perClass[classIndex]++;
        this._totalCount++;
    }

    check(minNoObj: number) {
        let counter = 0;

        for (let i = 0; i < this.bagCount; i++) {
            if (this.perBag[i] >= minNoObj) {
                counter++;
            }
        }
        return counter > 1;
    }

    static of(dataset: Dataset): Distribution {
        let bags = new Distribution(1, dataset.class.valueCount);

        for (const template of dataset.templates) {
            bags.add(0, template.value(dataset.class));
        }

        return bags;
    }
}

/**
 * Интерфейс дерева классификации
 */
export interface ClassifierTree {

    /**
     * Построить дерево решений по выборке данных
     * @param dataset обучающая выборка
     */
    build(dataset: Dataset): void;

    /**
     * Классифицировать образец по построенному дереву
     * @param template образец
     * @return number индекс класса
     */
    classify(template: Template): number;

    toString(): string;

}