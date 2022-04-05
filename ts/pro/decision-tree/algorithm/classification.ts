import {Algorithm, AlgorithmHolder} from "./algorithm";
import {Dataset, Template} from "../csv/csv";
import {TreeFlow, TreeLeaf, TreeNode, TreeNodeType} from "../classifier/classifier";

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

export class ClassificationAlgorithm implements Algorithm {

    /**
     * Датасет для тестирования
     */
    private readonly testDataset: Dataset;

    /**
     * Для статистики
     */
    private readonly statistic: Statistic;

    /**
     * Дерево классификации
     */
    private readonly tree: TreeNode;

    constructor(testDataset: Dataset, tree: TreeNode) {
        this.testDataset = testDataset;
        this.statistic = new Statistic(testDataset.templateCount);
        this.tree = tree;
    }

    async run(holder: AlgorithmHolder): Promise<any> {
        for (const test of this.testDataset.templates) {
            let classValue = await this.classify(holder, this.tree, test);
            this.updateStatistic(test.value(this.testDataset.class), classValue);
            this.drawResult();
        }
    }

    async classify(holder: AlgorithmHolder, node: TreeNode, test: Template): Promise<number> {
        await holder.delay();

        if (node.type == TreeNodeType.LEAF) {
            return (<TreeLeaf> node).classValue;
        }
        for (const child of (<TreeFlow> node).children) {
            if (child.condition.check(test)) {
                return await this.classify(holder, child, test);
            }
        }

        throw Error('Ни одно условие не было выполнено');
    }

    private updateStatistic(excepted: number, actual: number) {
        if (excepted == actual) {
            this.statistic.successful++;
        }
        else {
            this.statistic.errors++;
        }

        this.statistic.classifier++;
        this.statistic.errorPercent = this.statistic.errors / this.statistic.classifier;
    }

    private drawResult() {
        document.getElementById('result-total').innerText = this.statistic.total.toString();
        document.getElementById('result-classified').innerText = this.statistic.classifier.toString();
        document.getElementById('result-successful').innerText = this.statistic.successful.toString();
        document.getElementById('result-errors').innerText = this.statistic.errors.toString();
        document.getElementById('result-error-percent').innerText
            = parseFloat((this.statistic.errorPercent * 100).toFixed(2)).toString() + '%';
    }
}