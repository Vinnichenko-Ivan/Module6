/*
 * Модуль модальной менюшки
 */

import {dataset, drawTree, loadLearnDataset, loadLearnFileDataset, loadTestFileDataset} from "./main";

/*
 * ПЕРЕМЕННЫЕ
 */

// Текущий шаг в модальной менюшке
let currentStep: number;

/*
 * ФУНКЦИИ
 */

/**
 * Функция инициализации модального окна
 */
export function initializeModal() {
    // Обработка события перехода на следующий шаг
    $('.to-step').on('click', onClickNextStep);

    // Обработка события закрытия модального окна
    $('.close-modal-window').on('click', () => {
        document.getElementById('modal-window-blur').style.display = 'none';
        document.getElementById('modal-window').style.display = 'none';
        currentStep = null;
    });

    // Обработка события открытия модального окна
    $('.open-modal-window').on('click', () => {
        document.getElementById('modal-window-blur').style.display = 'block';
        document.getElementById('modal-window').style.display = 'flex';
    });


    // Обработка события переключения именования атрибутов
    $('#named-dataset').on('input', () => {
        loadLearnDataset();
        updateTable();
    });
}

/**
 * Отчистить все ошибки на экране
 */
function clearError() {
    for (const element of $('.error')) {
        element.textContent = ''
    }
}

/**
 * Отобразить ошибку на экране
 * @param error ошибка
 */
function displayError(error: string) {
    for (const element of $('.error')) {
        let span = element.appendChild(document.createElement('span'));
        span.textContent = error;
    }
}

/**
 * Отчистить обучающий датасет на экране
 */
function resetLearnDataset() {
    for (const element of $('.dataset-table')) {
        element.innerHTML = '';
    }
    dataset.classIndex = null;
}

/**
 * Функция клика перехода на следующий шаг
 */
async function onClickNextStep(e: JQuery.ClickEvent) {
    clearError();
    if (currentStep == undefined || !e.target.hasAttribute('check') || await tryNextStep()) {
        currentStep = +e.target.getAttribute('step');
        $('.step').css({display: 'none'});
        $(`.step[step="${currentStep}"]`).css({display: 'flex'});
    }
}

/**
 * Функция перехода на следующий шага
 * @return true, если можно перейти на следующий шаг
 */
async function tryNextStep(): Promise<boolean> {
    switch (currentStep) {

        // Шаг первый - загрузка обучающей выборки
        case 1: {
            resetLearnDataset();

            // Если выбираем выборку из предлагаемых
            if ((<HTMLInputElement> $('#radio-learn-dataset-list')[0]).checked) {
                let datasetName = (<HTMLInputElement> document.getElementById('learn-dataset-type')).value;
                let result = await fetch('../assets/datasets/' + datasetName + '.csv');

                if (!result.ok) {
                    displayError('Этого набора нет в стандартных, возможно он был удален =/');
                    return false;
                }

                dataset.learnDatasetString = await result.text();
                loadLearnDataset();
                updateTable();
            }

            // Если из файла
            else if ((<HTMLInputElement> $('#radio-learn-dataset-file')[0]).checked) {
                if ((<HTMLInputElement> document.getElementById('file-dataset')).files.length === 0) {
                    displayError('Вы не загрузили файл с обучающей выборкой!');
                    return false;
                }
                loadLearnFileDataset(updateTable);
            }
            return true;
        }

        // Шаг первый - предпросмотр таблицы обучающей выборки
        case 2: {
            return true;
        }

        // Шаг первый - загрузка тестов
        case 3: {

            // Если выбираем тесты из файла
            if ((<HTMLInputElement> $('#radio-test-dataset-file')[0]).checked) {
                if ((<HTMLInputElement> document.getElementById('file-tests')).files.length === 0) {
                    displayError('Вы не загрузили файл с тестами!');
                    return false;
                }
                loadTestFileDataset(() => dataset.testDataset.shuffle());
            }

            // Если из обучающего набора
            else if ((<HTMLInputElement> $('#radio-test-dataset-ratio')[0]).checked) {
                dataset.learnDataset.shuffle();
                dataset.testDataset = dataset.learnDataset.copyMeta();
                let count = (+$('input[target="tests"]').val() * dataset.learnDataset.templateCount / 100) | 0;

                for (let i = 0; i < count; i++) {
                    dataset.testDataset.templates.push(dataset.learnDataset.templates[0]);
                    dataset.learnDataset.templates.splice(0, 1);
                }
            }

            // Рисуем дерево
            drawTree().then();
            document.getElementById('modal-window-blur').style.display = 'none';
            document.getElementById('modal-window').style.display = 'none';
            currentStep = null;
            return false;
        }
    }
}

/**
 * Функция обновления таблицы
 */
function updateTable() {
    for (const element of $('.dataset-table')) {
        element.innerHTML = '';

        let rows = 10;
        let trElements = new Array<HTMLElement>(rows);
        for (let i = 0; i < trElements.length; i++) {
            trElements[i] = element.appendChild(document.createElement('tr'));
        }

        for (let i = 0; i < dataset.learnDataset.attributeCount; i++) {
            let attribute = dataset.learnDataset.attributes[i];
            let columnElements = new Array<HTMLElement>(rows)

            let thElement = trElements[0].appendChild(document.createElement('th'));
            columnElements[0] = thElement;
            thElement.textContent = attribute.name;

            for (let j = 1; j < trElements.length - 1; j++) {
                let tdElement = trElements[j].appendChild(document.createElement('td'));
                columnElements[j] = tdElement;
                tdElement.textContent = attribute.displayValue(dataset.learnDataset.templates[j - 1].value(attribute));
            }

            let etcElement = trElements[trElements.length - 1].appendChild(document.createElement('td'));
            columnElements[trElements.length - 1] = etcElement;
            etcElement.textContent = '...';

            if (attribute.isClass) {
                for (const element of columnElements) {
                    element.classList.add('class');
                }
            }

            for (const element of columnElements) {
                element.onclick = () => {
                    dataset.classIndex = i;
                    loadLearnDataset();
                    updateTable();
                }
            }
        }
    }
}