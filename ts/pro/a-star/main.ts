import {AStarAlgorithm} from "./algoritm/a-star";
import {AlgorithmHolder} from "./algoritm/algorithm";
import {CellMark, Field} from "./field";
import {Position} from "./utils";
import {PrimeAlgorithm} from "./algoritm/prime";

let selected: JQuery;
const field: Field = new Field(document.getElementById("field"));
const algorithmHolder: AlgorithmHolder = new AlgorithmHolder();

/*
 * Определяем события кнопок
 */
$('#field-resize').on('click', resizeField);
$('#field-generate').on('click', generateLabyrinth);
$('#field-find').on('click', findPath);
const iterDelayElement = $('.iter-delay.val').on('input', e => setIterationDelay(e.target))[0];
const fieldSizeElement = $('.field-size.val').on('input', e => setFieldSize(e.target))[0];

/*
 * Определяем события для взаимодействия с клетками
 */
$('#field')
    .on('mousedown', event => {
        if (!algorithmHolder.running && $(event.target).hasClass('cell')) {
            selected = $(event.target);
        }
        return false;
    })
    .on('mouseup', event => {
        if (!algorithmHolder.running && $(event.target).hasClass('cell')) {
            let element = $(event.target);

            if (selected.attr('type') === 'start' || selected.attr('type') === 'end') {
                let old = selected.attr('type');
                selected.attr('type', 'empty')
                element.attr('type', old);
                selected = null;
            }
        }
    });

/**
 * Функция изменения размера поля
 */
async function resizeField() {
    // Проверка состояния
    if (algorithmHolder.running) {
        await algorithmHolder.stop()
    }

    // Получаем размер из ввода
    field.width = field.height = +(<HTMLInputElement>fieldSizeElement).value;

    // Обновляем поле
    field.rebuild();

    // Добавляем точки начала и конца
    field.setMark(new Position(2, (field.height/2)|0), CellMark.START);
    field.setMark(new Position(field.width - 3, (field.height/2)|0), CellMark.END)
}

/**
 * Функция генерации лабиринта
 */
async function generateLabyrinth() {
    // Проверка состояния
    if (algorithmHolder.running) {
        await algorithmHolder.stop()
    }

    algorithmHolder.algorithm = new PrimeAlgorithm(field);
    await algorithmHolder.start();
}

/**
 * Функция запуска поиска пути по алгоритму A*
 */
async function findPath() {
    // Проверка состояния
    if (algorithmHolder.running) {
        await algorithmHolder.stop()
    }

    // Инициализация
    let start = $('.cell[type="start"]');
    let end = $('.cell[type="end"]');

    let startPosition = new Position(+start.attr('x'), +start.attr('y'))
    let endPosition = new Position(+end.attr('x'), +end.attr('y'))

    // Отчищаем путь
    field.clearAttributes();

    // Выполняем алгоритм A*
    algorithmHolder.algorithm = new AStarAlgorithm(field, startPosition, endPosition);
    let path = await algorithmHolder.start();

    // Отмечаем найденный путь
    for (const position of <Position[]> path) {
        field.getCell(position).path = true;
    }
}

/**
 * Функция изменения задержки между итерациями.
 * Вызывается, когда меняется значение в вводе
 */
function setIterationDelay(target: HTMLElement) {
    algorithmHolder.iterationDelay = +(<HTMLInputElement> target).value;
    $('.iter-delay.display').text((<HTMLInputElement> target).value);
}

/**
 * Функция изменения размера поля.
 * Вызывается, когда меняется значение в вводе
 */
function setFieldSize(target: HTMLElement) {
    $('.field-size.display').text((<HTMLInputElement> target).value);
}

// Запуск
setIterationDelay(iterDelayElement);
setFieldSize(fieldSizeElement);
resizeField().then();