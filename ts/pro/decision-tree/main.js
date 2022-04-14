var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./csv/csv-loader", "./algorithm/algorithm", "./algorithm/build-tree-id3", "./algorithm/classification", "./move", "../../audio"], function (require, exports, csv_loader_1, algorithm_1, build_tree_id3_1, classification_1, move_1, audio_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    move_1.initializeMove();
    audio_1.initializeAudio();
    const algorithmHolder = new algorithm_1.AlgorithmHolder(+$('input[target="iteration-delay"]').val());
    let tree;
    let learnDataset;
    let testDataset;
    let currentStep;
    let classIndex;
    $('.to-step').on('click', e => {
        clearError();
        if (currentStep == undefined || !e.target.hasAttribute('check') || checkStep()) {
            currentStep = +e.target.getAttribute('step');
            $('.step').css({ display: 'none' });
            $(`.step[step="${currentStep}"]`).css({ display: 'flex' });
        }
    });
    $('#named-dataset').on('input', () => loadLearnDataset());
    $('.range input').on('input', e => {
        let value = e.target.value;
        if (e.target.hasAttribute("datatype") && e.target.getAttribute("datatype") == 'percent') {
            value = value + '%';
        }
        $(`.range .display[target="${e.target.getAttribute("target")}"]`)
            .text(value);
    });
    $('input[target="iteration-delay"]').on('input', e => {
        algorithmHolder.iterationDelay = +e.target.value;
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
    $('#load-tests').on('click', runTests);
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
    function checkStep() {
        switch (currentStep) {
            case 1: {
                if (document.getElementById('file-dataset').files.length === 0) {
                    displayError('Вы не загрузили файл с обучающей выборкой!');
                    return false;
                }
                resetLearnDataset();
                loadLearnDataset();
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
                    loadTestDataset();
                    testDataset.shuffle();
                }
                else if ($('#radio-test-dataset-ratio')[0].checked) {
                    learnDataset.shuffle();
                    testDataset = learnDataset.copyMeta();
                    let count = (+$('input[target="tests"]').val() * learnDataset.templateCount / 100) | 0;
                    for (let i = 0; i < count; i++) {
                        testDataset.templates.push(learnDataset.templates[0]);
                        learnDataset.templates.splice(0, 1);
                    }
                }
                else {
                    return;
                }
                drawTree();
                document.getElementById('modal-window-blur').style.display = 'none';
                document.getElementById('modal-window').style.display = 'none';
                currentStep = null;
                return false;
            }
        }
    }
    function resetLearnDataset() {
        for (const element of $('.dataset-table')) {
            element.innerHTML = '';
        }
        classIndex = null;
    }
    function loadLearnDataset() {
        let files = document.getElementById('file-dataset').files;
        let named = document.getElementById('named-dataset').checked;
        let reader = new FileReader();
        reader.onload = e => {
            learnDataset = csv_loader_1.loadDatasetFromString(e.target.result, classIndex, named);
            updateTable();
        };
        reader.readAsText(files[0], "UTF-8");
    }
    function loadTestDataset() {
        let files = document.getElementById('file-tests').files;
        let named = document.getElementById('named-dataset').value == 'on';
        let reader = new FileReader();
        reader.onload = e => {
            testDataset = csv_loader_1.loadDatasetFromString(e.target.result, undefined, named);
        };
        reader.readAsText(files[0], "UTF-8");
    }
    function updateTable() {
        for (const element of $('.dataset-table')) {
            element.innerHTML = '';
            let rows = 10;
            let trElements = new Array(rows);
            for (let i = 0; i < trElements.length; i++) {
                trElements[i] = element.appendChild(document.createElement('tr'));
            }
            for (let i = 0; i < learnDataset.attributeCount; i++) {
                let attribute = learnDataset.attributes[i];
                let columnElements = new Array(rows);
                let thElement = trElements[0].appendChild(document.createElement('th'));
                columnElements[0] = thElement;
                thElement.textContent = attribute.name;
                for (let j = 1; j < trElements.length - 1; j++) {
                    let tdElement = trElements[j].appendChild(document.createElement('td'));
                    columnElements[j] = tdElement;
                    tdElement.textContent = attribute.displayValue(learnDataset.templates[j - 1].value(attribute));
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
                        classIndex = i;
                        loadLearnDataset();
                    };
                }
            }
        }
    }
    function drawTree() {
        return __awaiter(this, void 0, void 0, function* () {
            if (algorithmHolder.running) {
                yield algorithmHolder.stop();
            }
            algorithmHolder.algorithm = new build_tree_id3_1.BuildTreeID3Algorithm(learnDataset, 2, +$('input[target="min-info-gain"]').val() / 100, +$('input[target="max-depth"]').val(), 1, +$('input[target="min-ratio"]').val() / 100);
            let newTree = yield algorithmHolder.start();
            if (tree) {
                tree.deleteDisplay();
            }
            tree = newTree;
            let htmlElement = $('#decision-tree')[0];
            htmlElement.innerHTML = '';
            htmlElement.appendChild(tree.htmlElement);
            tree.createDisplay();
            move_1.resetMove();
        });
    }
    function runTests() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!testDataset) {
                return;
            }
            if (algorithmHolder.running) {
                yield algorithmHolder.stop();
            }
            algorithmHolder.algorithm = new classification_1.ClassificationAlgorithm(testDataset, tree);
            yield algorithmHolder.start();
        });
    }
});
//# sourceMappingURL=main.js.map