import {Dataset} from "./csv/csv";
import {loadDatasetFromString} from "./csv/csv-loader";
import {TreeNode} from "./classifier/classifier";
import {AlgorithmHolder} from "./algorithm/algorithm";
import {BuildTreeID3Algorithm} from "./algorithm/build-tree-id3";
import {ClassificationAlgorithm} from "./algorithm/classification";

const algorithmHolder: AlgorithmHolder = new AlgorithmHolder();

let tree: TreeNode;
let learnDataset: Dataset;
let testDataset: Dataset

document.getElementById('load-dataset').onclick = () => {
    let files = (<HTMLInputElement>document.getElementById('file-dataset')).files;
    let named = (<HTMLInputElement>document.getElementById('named-dataset')).checked;
    let reader = new FileReader();
    reader.onload = e => {
        learnDataset = loadDatasetFromString(<string>e.target.result, undefined, named);
        //test(learnDataset, 1);
        drawTree();
    }
    reader.readAsText(files[0], "UTF-8");
};

document.getElementById('load-tests').onclick = () => {
    let files = (<HTMLInputElement>document.getElementById('file-tests')).files;
    let named = (<HTMLInputElement>document.getElementById('named-dataset')).value == 'on';
    let reader = new FileReader();
    reader.onload = e => {
        testDataset = loadDatasetFromString(<string>e.target.result, undefined, named);
        runTests();
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
        elementWheel -= (<WheelEvent> event.originalEvent).deltaY / 1000;
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

/*function test(dataset: Dataset, iterations: number) {
    drawTree(dataset);
    average(dataset, 0.99, iterations);
    average(dataset, 0.9, iterations);
    average(dataset, 0.5, iterations);
    average(dataset, 0.1, iterations);
    average(dataset, 0.01, iterations);
}

async function average(sourceDataset: Dataset, testPercent: number, iterations: number): void {
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

        algorithmHolder.algorithm = new BuildTreeID3Algorithm(
            learnDataset,
            2,
            0,
            10,
            1,
            0.5);

        let tree = await algorithmHolder.start<TreeNode>();
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
}*/

async function drawTree() {
    if (algorithmHolder.running) {
        return;
    }

    algorithmHolder.iterationDelay = 0;
    algorithmHolder.algorithm = new BuildTreeID3Algorithm(
        learnDataset,
        2,
        0,
        10,
        0,
        0.5);
    let newTree = await algorithmHolder.start<TreeNode>();

    if (tree) {
        tree.deleteDisplay();
    }
    tree = newTree;

    let htmlElement = $('#decision-tree')[0];
    htmlElement.innerHTML = ''
    htmlElement.appendChild(tree.htmlElement);
    tree.createDisplay();

    elementX = 0;
    elementY = 0;
    $('.movable').css({
        'transform': `translate(${elementX}px, ${elementY}px) scale(${elementScale})`
    });
}

/*function drawTemplate(dataset: Dataset, index: number) {
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
}*/

async function runTests() {
    if (algorithmHolder.running) {
        return;
    }

    algorithmHolder.iterationDelay = 50;
    algorithmHolder.algorithm = new ClassificationAlgorithm(
        testDataset,
        tree
    )
    await algorithmHolder.start();
}
