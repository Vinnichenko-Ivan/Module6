import {entropy} from "./math";
import {Dataset} from "../csv/csv";
import {numberArray, numberMatrix} from "./array";

/**
 * Класс распределения
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

    /**
     * Количество различных значений классов у образцов в разбиении
     */
    get classCount(): number {
        return this.perClass.length;
    }

    /**
     * Количество различных значений атрибутов (ну или чего там) у образцов в разбиении
     */
    get bagCount(): number {
        return this.perBag.length;
    }

    /**
     * Количество образцов в разбиении
     */
    get totalCount(): number {
        return this._totalCount;
    }

    /**
     * Самое частовстречающееся значение класса
     */
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

    /**
     * Самое частовстречающееся значение аттрибута (ну или чего там)
     */
    get maxBag(): number {
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

    /**
     * Добавить образец
     * @param bagIndex значение атрибута образца
     * @param classIndex значение класса образца
     */
    add(bagIndex: number, classIndex: number): void {
        this.perClassPerBag[bagIndex][classIndex]++;
        this.perBag[bagIndex]++;
        this.perClass[classIndex]++;
        this._totalCount++;
    }

    /**
     * Проверяет, чтобы было хотя бы одно значение атрибута,
     * по которому количество образцов будет больше minNoObj
     * @param minNoObj порог количества образцов
     */
    check(minNoObj: number) {
        let counter = 0;

        for (let i = 0; i < this.bagCount; i++) {
            if (this.perBag[i] >= minNoObj) {
                counter++;
            }
        }
        return counter > 1;
    }

    /**
     * Получить разбиения по выборке данных
     * @param dataset выборка данных
     */
    static of(dataset: Dataset): Distribution {
        let bags = new Distribution(1, dataset.class.valueCount);

        for (const template of dataset.templates) {
            bags.add(0, template.value(dataset.class));
        }

        return bags;
    }
}

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
export function infoGain(bags: Distribution): number {
    return oldEntropy(bags) - newEntropy(bags);
}