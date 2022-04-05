/**
 * Интерфейс набора данных
 */
export interface Dataset {

    /**
     * Все атрибуты набора
     */
    get attributes(): Attribute[];

    /**
     * Количество атрибутов набора
     */
    get attributeCount(): number;

    /**
     * Класс набора
     */
    get class(): Class;

    /**
     * Все образцы набора
     */
    get templates(): Template[];

    /**
     * Количество образцов набора
     */
    get templateCount(): number;

    /**
     * Скопировать только метаданные набора.
     * В метаданные входят атрибуты и класс.
     * @return Dataset скопированный только с метаданными набор.
     */
    copyMeta(): Dataset;

    /**
     * Скопировать полностью весь набор со всеми образцами.
     * @return Dataset скопированный набор.
     */
    copyFull(): Dataset;
}

/**
 * Интерфейс атрибута
 */
export interface Attribute {

    /**
     * Индекс атрибута
     */
    get index(): number;

    /**
     * Название атрибута (или индекс в виде строки, если его нет)
     */
    get name(): string;

    /**
     * Дискретный ли атрибут
     */
    get isDiscrete(): boolean;

    /**
     * Числовой ли атрибут
     */
    get isNumeric(): boolean;

    /**
     * Является ли классом атрибут
     */
    get isClass(): boolean;

    /**
     * Названия значений атрибута (только для дискретного атрибута)
     */
    get values(): string[];

    /**
     * Количество значений атрибута (только для дискретного атрибута)
     */
    get valueCount(): number;

    /**
     * Спарсить значения атрибута по названию
     * @return number значение атрибута
     */
    parse(value: string): number;

}

/**
 * Интерфейс класса
 */
export interface Class extends Attribute {

}

/**
 * Интерфейс шаблона
 */
export interface Template {

    isMissing(attribute: Attribute): boolean;

    /**
     * Получить значение атрибута у образца
     * @param attribute атрибут или класс
     */
    value(attribute: Attribute | Class): number;

}