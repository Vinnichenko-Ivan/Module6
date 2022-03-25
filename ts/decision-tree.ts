import {Id3Tree} from "./util/classifier-id3";
import {Dataset} from "./util/csv";

import {monks1} from "./data/monks1";
import {iris} from "./data/iris";
import {soybean} from "./data/soybean";
import {diabetes} from "./data/diabetes";
import {glass} from "./data/glass";

test(iris, 100);

function test(dataset: Dataset, iterations: number) {
    printTree(dataset);
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

function printTree(dataset: Dataset) {
    let tree = new Id3Tree();
    tree.build(dataset);
    console.log(tree.toString());
}
