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

    /**
     * Отображаемый оператор (например = или <)
     */
    displayOperator(): string;

    /**
     * Отображаемое значение
     */
    displayValue(): string;

    /**
     * Отображаемый атрибут
     */
    displayAttribute(): string;

}

/**
 * Интерфейс для отображаемых элементов
 */
export interface Display {

    /**
     * HTML элементик
     */
    get htmlElement(): HTMLElement;

    /**
     * Создать отображение и вывести на экран
     */
    createDisplay(): void;

    /**
     * Удалить отображение и убрать с экрана
     */
    deleteDisplay(): void;

    /**
     * Сбросить отображение к дефолтным настройкам
     */
    resetDisplay(): void;

}

/**
 * Интерфейс узлов
 */
export interface TreeNode extends Display {

    /**
     * Условия, которое должны выполниться, чтобы перейти в этот узел
     */
    get condition(): Condition;

    /**
     * Тип узла
     */
    get type(): TreeNodeType;

    /**
     * Обновить состояние узла (для анимации)
     * @param value состояние (или отметка)
     */
    markDisplay(value: TreeMark): void;

}

/**
 * Интерфейс узла "ветка"
 */
export interface TreeFlow extends TreeNode {

    /**
     * Детишки ветки
     */
    get children(): TreeNode[];

}

/**
 * Интерфейс узла "лист"
 */
export interface TreeLeaf extends TreeNode {

    /**
     * Значение класса листа
     */
    get classValue(): number;

}

/**
 * Типы узлов
 */
export enum TreeNodeType {FLOW, LEAF}

/**
 * Типы состояний (или отметок) узла (для анимации)
 */
export enum TreeMark {
    HIGHLIGHT = 'highlight',
    RIGHT = 'right',
    WRONG = 'wrong',
    NONE = 'none'
}