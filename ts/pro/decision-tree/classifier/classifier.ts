import {Dataset, Template} from "../csv/csv";

/**
 * Разделение
 */
export interface Split {

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
 * Условие
 */
export interface Condition {

    /**
     * Проверяет образец по условию.
     * Если образец удовлетворяет условию, то он может спуститься ниже
     * в соответствующий узел дерева.
     * @param template образец
     * @return true, если образец удовлетворяет условию
     */
    check(template: Template): boolean;

    displayOperator(): string;

    displayValue(): string;

    displayAttribute(): string;

}

export interface Display {

    get htmlElement(): HTMLElement;

    createDisplay(): void;

    deleteDisplay(): void;

}

export enum TreeNodeType {FLOW, LEAF}

export interface TreeNode extends Display {

    get condition(): Condition;

    get type(): TreeNodeType;

    markDisplay(value: TreeMark): void;

}

export interface TreeFlow extends TreeNode {

    get children(): TreeNode[];

}

export interface TreeLeaf extends TreeNode {

    get classValue(): number;

    incrementCount(): void

    resetCount(): void;

}

export enum TreeMark {
    HIGHLIGHT = 'highlight',
    RIGHT = 'right',
    WRONG = 'wrong',
    NONE = 'none'
}