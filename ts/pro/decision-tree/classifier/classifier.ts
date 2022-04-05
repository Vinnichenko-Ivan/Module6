import {Dataset, Template} from "../csv/csv";

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

    appendHTMLChildren(parentElement: HTMLElement): void;

    toString(): string;

}