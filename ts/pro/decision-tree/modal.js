define(["require", "exports", "./main"], function (require, exports, main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initializeModal = void 0;
    let currentStep;
    function initializeModal() {
        $('.to-step').on('click', e => {
            clearError();
            if (currentStep == undefined || !e.target.hasAttribute('check') || tryNextStep()) {
                currentStep = +e.target.getAttribute('step');
                $('.step').css({ display: 'none' });
                $(`.step[step="${currentStep}"]`).css({ display: 'flex' });
            }
        });
        $('.close-modal-window').on('click', () => {
            document.getElementById('modal-window-blur').style.display = 'none';
            document.getElementById('modal-window').style.display = 'none';
            currentStep = null;
        });
        $('.open-modal-window').on('click', () => {
            document.getElementById('modal-window-blur').style.display = 'block';
            document.getElementById('modal-window').style.display = 'flex';
        });
        $('#named-dataset').on('input', () => main_1.loadLearnDataset(updateTable));
    }
    exports.initializeModal = initializeModal;
    function clearError() {
        for (const element of $('.error')) {
            element.textContent = '';
        }
    }
    function displayError(error) {
        for (const element of $('.error')) {
            let span = element.appendChild(document.createElement('span'));
            span.textContent = error;
        }
    }
    function resetLearnDataset() {
        for (const element of $('.dataset-table')) {
            element.innerHTML = '';
        }
        main_1.dataset.classIndex = null;
    }
    function tryNextStep() {
        switch (currentStep) {
            case 1: {
                if (document.getElementById('file-dataset').files.length === 0) {
                    displayError('Вы не загрузили файл с обучающей выборкой!');
                    return false;
                }
                resetLearnDataset();
                main_1.loadLearnDataset(updateTable);
                return true;
            }
            case 2: {
                return true;
            }
            case 3: {
                if ($('#radio-test-dataset-file')[0].checked) {
                    if (document.getElementById('file-tests').files.length === 0) {
                        displayError('Вы не загрузили файл с тестами!');
                        return false;
                    }
                    main_1.loadTestDataset(() => main_1.dataset.testDataset.shuffle());
                }
                else if ($('#radio-test-dataset-ratio')[0].checked) {
                    main_1.dataset.learnDataset.shuffle();
                    main_1.dataset.testDataset = main_1.dataset.learnDataset.copyMeta();
                    let count = (+$('input[target="tests"]').val() * main_1.dataset.learnDataset.templateCount / 100) | 0;
                    for (let i = 0; i < count; i++) {
                        main_1.dataset.testDataset.templates.push(main_1.dataset.learnDataset.templates[0]);
                        main_1.dataset.learnDataset.templates.splice(0, 1);
                    }
                }
                else {
                    return;
                }
                main_1.drawTree().then();
                document.getElementById('modal-window-blur').style.display = 'none';
                document.getElementById('modal-window').style.display = 'none';
                currentStep = null;
                return false;
            }
        }
    }
    function updateTable() {
        for (const element of $('.dataset-table')) {
            element.innerHTML = '';
            let rows = 10;
            let trElements = new Array(rows);
            for (let i = 0; i < trElements.length; i++) {
                trElements[i] = element.appendChild(document.createElement('tr'));
            }
            for (let i = 0; i < main_1.dataset.learnDataset.attributeCount; i++) {
                let attribute = main_1.dataset.learnDataset.attributes[i];
                let columnElements = new Array(rows);
                let thElement = trElements[0].appendChild(document.createElement('th'));
                columnElements[0] = thElement;
                thElement.textContent = attribute.name;
                for (let j = 1; j < trElements.length - 1; j++) {
                    let tdElement = trElements[j].appendChild(document.createElement('td'));
                    columnElements[j] = tdElement;
                    tdElement.textContent = attribute.displayValue(main_1.dataset.learnDataset.templates[j - 1].value(attribute));
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
                        main_1.dataset.classIndex = i;
                        main_1.loadLearnDataset(updateTable);
                    };
                }
            }
        }
    }
});
//# sourceMappingURL=modal.js.map