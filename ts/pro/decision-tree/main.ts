import {Dataset} from "./csv/csv";
import {loadDatasetFromString} from "./csv/csv-loader";
import {TreeNode} from "./classifier/classifier";
import {AlgorithmHolder} from "./algorithm/algorithm";
import {BuildTreeID3Algorithm} from "./algorithm/build-tree-id3";
import {ClassificationAlgorithm} from "./algorithm/classification";
import {initializeMove, resetMove} from "./move";
import {initializeAudio} from "./audio";

initializeMove();
initializeAudio();

const algorithmHolder: AlgorithmHolder = new AlgorithmHolder(+$('input[target="iteration-delay"]').val());

let tree: TreeNode;
let learnDataset: Dataset;
let testDataset: Dataset

let currentStep: number;
let classIndex: number;

$('.to-step').on('click', e => {
    clearError();
    if (currentStep == undefined || !e.target.hasAttribute('check') || checkStep()) {
        currentStep = +e.target.getAttribute('step');
        $('.step').css({display: 'none'});
        $(`.step[step="${currentStep}"]`).css({display: 'flex'});
    }
});

$('#named-dataset').on('input', () => loadLearnDataset());

$('.range input').on('input', e => {
    let value = (<HTMLInputElement> e.target).value;
    if (e.target.hasAttribute("datatype") && e.target.getAttribute("datatype") == 'percent') {
        value = value + '%';
    }
    $(`.range .display[target="${e.target.getAttribute("target")}"]`)
        .text(value)
});

$('input[target="iteration-delay"]').on('input', e => {
    algorithmHolder.iterationDelay = +(<HTMLInputElement> e.target).value;
})

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
        element.textContent = ''
    }
}

function displayError(error: string) {
    for (const element of $('.error')) {
        let span = element.appendChild(document.createElement('span'));
        span.textContent = error;
    }
}

function checkStep(): boolean {
    switch (currentStep) {
        case 1: {
            if ((<HTMLInputElement> document.getElementById('file-dataset')).files.length === 0) {
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
            if ((<HTMLInputElement> $('#radio-test-dataset-file')[0]).checked) {
                if ((<HTMLInputElement> document.getElementById('file-tests')).files.length === 0) {
                    displayError('Вы не загрузили файл с тестами!');
                    return false;
                }
                loadTestDataset(() => testDataset.shuffle());
            }
            else if ((<HTMLInputElement> $('#radio-test-dataset-ratio')[0]).checked) {
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
    let files = (<HTMLInputElement> document.getElementById('file-dataset')).files;
    let named = (<HTMLInputElement>document.getElementById('named-dataset')).checked;
    let reader = new FileReader();

    reader.onload = e => {
        learnDataset = loadDatasetFromString(<string> e.target.result, classIndex, named);
        updateTable();
    }
    reader.readAsText(files[0], "UTF-8");
}

function loadTestDataset(callback: () => void) {
    let files = (<HTMLInputElement>document.getElementById('file-tests')).files;
    let named = (<HTMLInputElement>document.getElementById('named-dataset')).value == 'on';
    let reader = new FileReader();
    reader.onload = e => {
        testDataset = loadDatasetFromString(<string>e.target.result, undefined, named);
        callback();
    }
    reader.readAsText(files[0], "UTF-8");
}

function updateTable() {
    for (const element of $('.dataset-table')) {
        element.innerHTML = '';

        let rows = 10;
        let trElements = new Array<HTMLElement>(rows);
        for (let i = 0; i < trElements.length; i++) {
            trElements[i] = element.appendChild(document.createElement('tr'));
        }

        for (let i = 0; i < learnDataset.attributeCount; i++) {
            let attribute = learnDataset.attributes[i];
            let columnElements = new Array<HTMLElement>(rows)

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
                }
            }
        }
    }
}

async function drawTree() {
    if (algorithmHolder.running) {
        await algorithmHolder.stop();
    }

    algorithmHolder.algorithm = new BuildTreeID3Algorithm(
        learnDataset,
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

async function runTests() {
    if (!testDataset) {
        return;
    }

    if (algorithmHolder.running) {
        await algorithmHolder.stop();
    }

    algorithmHolder.algorithm = new ClassificationAlgorithm(
        testDataset,
        tree
    )
    await algorithmHolder.start();
}
