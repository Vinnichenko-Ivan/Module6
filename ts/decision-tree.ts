import {Id3Tree} from "./util/classifier-id3";
import {Dataset, Template} from "./util/csv";

import {monks1} from "./data/monks1";
import {iris} from "./data/iris";
import {soybean} from "./data/soybean";
import {diabetes} from "./data/diabetes";
import {glass} from "./data/glass";
import {loadDatasetFromString} from "./util/loader";

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
        runTests().then(r => runningAnimation = false);
    }
    reader.readAsText(files[0], "UTF-8");
};

drawResult();
test(iris, 100);

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
}

function drawTemplate(dataset: Dataset, index: number) {
    let template = dataset.templates[index];

    let htmlElement = $('#current-test')[0];
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
