import {Id3Tree} from "./classifier/classifier-id3";
import {Dataset, Template} from "./csv/csv";
import {loadDatasetFromString} from "./csv/csv-loader";

class Statistic {

    total: number;
    classifier: number = 0;
    successful: number = 0;
    errors: number = 0;
    errorPercent: number = 0;

    constructor(total: number) {
        this.total = total;
    }
}

let tree: Id3Tree;
let learnDataset: Dataset;
let testDataset: Dataset

let iterationDelay = 50;
let runningAnimation = false;
let result = new Statistic(0);

document.getElementById('load-dataset').onclick = () => {
    let files = (<HTMLInputElement>document.getElementById('file-dataset')).files;
    let named = (<HTMLInputElement>document.getElementById('named-dataset')).checked;
    let reader = new FileReader();
    reader.onload = e => {
        learnDataset = loadDatasetFromString(<string>e.target.result, undefined, named);
        test(learnDataset, 1);
    }
    reader.readAsText(files[0], "UTF-8");
};

document.getElementById('load-tests').onclick = () => {
    let files = (<HTMLInputElement>document.getElementById('file-tests')).files;
    let named = (<HTMLInputElement>document.getElementById('named-dataset')).value == 'on';
    let reader = new FileReader();
    reader.onload = e => {
        testDataset = loadDatasetFromString(<string>e.target.result, undefined, named);
        runTests().then(() => runningAnimation = false);
    }
    reader.readAsText(files[0], "UTF-8");
};

let elementClientX = 0;
let elementClientY = 0;
let elementX = 0;
let elementY = 0;
let elementWheel = 0;
let elementScale = 1;
let lastX: number;
let lastY: number;

$('.area')
    .on('mousedown', event => {
        lastX = event.clientX;
        lastY = event.clientY;
        return false;
    })
    .on('mousemove', event => {
        if (lastX && lastY) {
            elementX += (event.clientX - lastX) / elementScale;
            elementY += (event.clientY - lastY) / elementScale;
            lastX = event.clientX;
            lastY = event.clientY;
            elementClientX = elementX * elementScale;
            elementClientY = elementY * elementScale;
            $('.movable').css({
                'transform': `translate(${elementClientX}px, ${elementClientY}px) scale(${elementScale})`
            });
        }
    })
    .on('mousewheel', event => {
        elementWheel += (<WheelEvent> event.originalEvent).deltaY / 1000;
        elementWheel = Math.max(-1, Math.min(1, elementWheel))
        elementScale = Math.pow(Math.E, elementWheel);
        elementClientX = elementX * elementScale;
        elementClientY = elementY * elementScale;
        $('.movable').css({
            'transform': `translate(${elementClientX}px, ${elementClientY}px) scale(${elementScale})`
        });
    })
    .on('mouseout', () => {
        if (lastX && lastY) {
            lastX = null;
            lastY = null;
        }
    })
    .on('mouseup', () => {
        lastX = null;
        lastY = null;
    });

function test(dataset: Dataset, iterations: number) {
    drawTree(dataset);
    average(dataset, 0.99, iterations);
    average(dataset, 0.9, iterations);
    average(dataset, 0.5, iterations);
    average(dataset, 0.1, iterations);
    average(dataset, 0.01, iterations);
}

function average(sourceDataset: Dataset, testPercent: number, iterations: number): void {
    let learnPercent = 1 - testPercent;
    let totalErrors = 0;
    let ms = Date.now();

    for (let k = 0; k < iterations; k++) {
        let dataset = sourceDataset.copyFull();
        let train = dataset.copyMeta();
        let tests = dataset.copyMeta();

        let total = dataset.templateCount;
        let i;
        for (i = 0; i < learnPercent * total; i++) {
            let rnd = Math.trunc(Math.random() * dataset.templateCount);
            train.templates.push(dataset.templates[rnd]);
            dataset.templates.splice(rnd, 1);
        }
        for (; i < total; i++) {
            tests.templates.push(dataset.templates[0]);
            dataset.templates.splice(0, 1);
        }

        let tree = new Id3Tree();
        tree.build(train);
        //console.log(tree.toString());

        let errors = 0;
        for (const test of tests.templates) {
            let excepted = test.value(tests.class);
            let actual = tree.classify(test);
            if (excepted != actual) {
                errors++;
            }
        }
        totalErrors += errors / tests.templateCount * 100;
    }

    ms = Date.now() - ms;
    console.log(`[процент тестов = ${testPercent * 100}%] средний процент ошибок: ${(totalErrors / iterations).toFixed(2)}% за ${ms} мс`);
}

function drawTree(dataset: Dataset) {
    tree = new Id3Tree();
    tree.build(dataset);

    let htmlElement = $('#decision-tree')[0];
    htmlElement.innerHTML = ''
    tree.appendHTMLChildren(htmlElement);

    elementX = 0;
    elementY = 0;
    $('.movable').css({
        'transform': `translate(${elementX}px, ${elementY}px) scale(${elementScale})`
    });
}

function drawTemplate(dataset: Dataset, index: number) {
    let template = dataset.templates[index];

    let htmlElement = $('#current-test')[0];
    if (!htmlElement) {
        return;
    }

    htmlElement.innerHTML = '';

    let headElement = htmlElement.appendChild(document.createElement('tr'));
    let indexNameElement = headElement.appendChild(document.createElement('th'));
    indexNameElement.innerText = 'ID';

    let valuesElement = htmlElement.appendChild(document.createElement('tr'));
    let indexValueElement = valuesElement.appendChild(document.createElement('td'));
    indexValueElement.innerText = (index + 1).toString();

    for (const attribute of testDataset.attributes) {
        let attributeNameElement = headElement.appendChild(document.createElement('th'));
        attributeNameElement.innerText = attribute.name;

        let attributeValueElement = valuesElement.appendChild(document.createElement('td'));
        attributeValueElement.innerText = template.value(attribute).toString();
    }
}

function drawResult() {
    document.getElementById('result-total').innerText = result.total.toString();
    document.getElementById('result-classified').innerText = result.classifier.toString();
    document.getElementById('result-successful').innerText = result.successful.toString();
    document.getElementById('result-errors').innerText = result.errors.toString();
    document.getElementById('result-error-percent').innerText
        = parseFloat((result.errorPercent * 100).toFixed(2)).toString() + '%';
}

async function runTests() {
    runningAnimation = true;
    result = new Statistic(testDataset.templateCount);

    for (let i = 0; i < testDataset.templateCount; i++) {
        drawTemplate(testDataset, i);
        await runTest(testDataset.templates[i]);
        drawResult();
        await new Promise(r => setTimeout(r, iterationDelay));
    }
}

async function runTest(test: Template) {
    let excepted = test.value(testDataset.class);
    let actual = tree.classify(test);

    if (excepted == actual) {
        result.successful++;
    }
    else {
        result.errors++;
    }
    result.classifier++;
    result.errorPercent = result.errors / result.classifier;
}
