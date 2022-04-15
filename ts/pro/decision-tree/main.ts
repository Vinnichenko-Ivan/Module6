/*
 * Главный модуль для дерева решений
 */

import {Dataset} from "./csv/csv";
import {loadDatasetFromString} from "./csv/csv-loader";
import {TreeNode} from "./classifier/classifier";
import {AlgorithmHolder} from "./algorithm/algorithm";
import {BuildTreeID3Algorithm} from "./algorithm/build-tree-id3";
import {ClassificationAlgorithm} from "./algorithm/classification";
import {initializeMove, resetMove} from "./move";
import {initializeAudio} from "./audio";
import {initializeModal} from "./modal";

/*
 * ИНИЦИАЛИЗАЦИЯ
 */

initializeMove();
initializeModal();
initializeAudio();

/*
 * Классы
 */

/**
 * Класс с переменными для доступа из других модулей
 */
class DatasetSettings {
    learnDataset: Dataset;
    testDataset: Dataset;
    classIndex: number;
}

/*
 * ПЕРЕМЕННЫЕ
 */

// Контейнер активных алгоритмов
const algorithmHolder: AlgorithmHolder = new AlgorithmHolder(+$('input[target="iteration-delay"]').val());

// Дерево
let tree: TreeNode;

// Выборки данных
export const dataset = new DatasetSettings();

/*
 * СОБЫТИЯ
 */

// Обработка события ввода данных в диапазоне
$('.range input').on('input', e => {
    let value = (<HTMLInputElement> e.target).value;
    if (e.target.hasAttribute("datatype") && e.target.getAttribute("datatype") == 'percent') {
        value = value + '%';
    }
    $(`.range .display[target="${e.target.getAttribute("target")}"]`)
        .text(value)
});

// Обработка события изменения задержки между итерациями
$('input[target="iteration-delay"]').on('input', e => {
    algorithmHolder.iterationDelay = +(<HTMLInputElement> e.target).value;
})

// Обработка события запуска тестов
$('#run-classification').on('click', runClassification);

/*
 * ФУНКЦИИ
 */

/**
 * Функция загрузки обучающего датасета
 */
export function loadLearnDataset(callback?: () => void) {
    let files = (<HTMLInputElement> document.getElementById('file-dataset')).files;
    let named = (<HTMLInputElement>document.getElementById('named-dataset')).checked;
    let reader = new FileReader();

    reader.onload = e => {
        dataset.learnDataset = loadDatasetFromString(<string> e.target.result, dataset.classIndex, named);
        if (callback != undefined) {
            callback();
        }
    }
    reader.readAsText(files[0], "UTF-8");
}

/**
 * Функция загрузки датасета с тестами
 * @param callback событие, которые выполнится после загрузки
 */
export function loadTestDataset(callback?: () => void) {
    let files = (<HTMLInputElement>document.getElementById('file-tests')).files;
    let named = (<HTMLInputElement>document.getElementById('named-dataset')).value == 'on';
    let reader = new FileReader();
    reader.onload = e => {
        dataset.testDataset = loadDatasetFromString(<string>e.target.result, undefined, named);
        if (callback != undefined) {
            callback();
        }
    }
    reader.readAsText(files[0], "UTF-8");
}

/**
 * Нарисовать дерево
 */
export async function drawTree() {
    if (algorithmHolder.running) {
        await algorithmHolder.stop();
    }

    algorithmHolder.algorithm = new BuildTreeID3Algorithm(
        dataset.learnDataset,
        2,
        +$('input[target="min-info-gain"]').val() / 100,
        +$('input[target="max-depth"]').val(),
        1,
        +$('input[target="min-ratio"]').val() / 100);
    let newTree = await algorithmHolder.start<TreeNode>();

    if (tree) {
        tree.deleteDisplay();
    }
    tree = newTree;

    let htmlElement = $('#decision-tree')[0];
    htmlElement.innerHTML = ''
    htmlElement.appendChild(tree.htmlElement);
    tree.createDisplay();
    resetMove();
}

/**
 * Запуск классификации
 */
async function runClassification() {
    if (!dataset.testDataset) {
        return;
    }

    if (algorithmHolder.running) {
        await algorithmHolder.stop();
    }

    algorithmHolder.algorithm = new ClassificationAlgorithm(
        dataset.testDataset,
        tree
    )
    await algorithmHolder.start();
}
