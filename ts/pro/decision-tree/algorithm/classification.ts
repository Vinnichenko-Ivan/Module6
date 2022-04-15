import {Algorithm, AlgorithmHolder} from "./algorithm";
import {Dataset, Template} from "../csv/csv";
import {TreeFlow, TreeLeaf, TreeMark, TreeNode, TreeNodeType} from "../classifier/classifier";

/**
 * Класс статистики
 * @author Аникушин Роман
 */
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

/**
 * Класс алгоритма классификации
 * @author Аникушин Роман
 */
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

    /**
     * Выбранные узлы в дереве (для анимации)
     */
    private selected: TreeNode[] = [];

    constructor(testDataset: Dataset, tree: TreeNode) {
        this.testDataset = testDataset.copyFull();
        this.statistic = new Statistic(testDataset.templateCount);
        this.tree = tree;
    }

    /**
     * Классификация выборки тестовых данных
     *
     * @param holder контейнер алгоритма
     */
    async run(holder: AlgorithmHolder): Promise<any> {
        this.tree.resetDisplay();

        // Перебираем все образцы
        for (const test of this.testDataset.templates) {
            if (!holder.running) {
                break;
            }

            // Классификацая образца
            let classValue = await this.classify(holder, this.tree, test);

            // Задержка
            await holder.delay();

            // Обновляем статистику и отрисовываем
            this.updateStatistic(test.value(this.testDataset.class), classValue);
            this.drawResult();

            // Сбрасываем анимацию с этого образца,
            // так как дальше будет следующий образец
            for (const selected of this.selected) {
                selected.markDisplay(TreeMark.NONE);
            }
            this.selected = [];
        }
    }

    /**
     * Классификация образца
     *
     * @param holder контейнер алгоритма
     * @param node узел
     * @param test тестовый образец, который нужно классифицировать
     * @return number значение класса образца
     */
    async classify(holder: AlgorithmHolder, node: TreeNode, test: Template): Promise<number> {
        // Задержка
        await holder.delay();

        // Для дальнейшего сброса анимации
        this.selected.push(node);

        // Если задержка между итерациями достаточно большая,
        // чтобы глаз человека как-то реагировал, то анимируем,
        // иначе анимируем только листы
        if (holder.iterationDelay > 25) {
            node.markDisplay(TreeMark.HIGHLIGHT);
        }

        // Если узел это лист, то анимируем его
        if (node.type == TreeNodeType.LEAF) {
            let leaf = <TreeLeaf> node;
            let classValue = leaf.classValue;

            if (test.value(this.testDataset.class) == classValue) {
                leaf.markDisplay(TreeMark.RIGHT);
            }
            else {
                leaf.markDisplay(TreeMark.WRONG);
            }

            return classValue;
        }

        // Проходимся по всем детишкам и классифицируем их тоже
        for (const child of (<TreeFlow> node).children) {
            if (child.condition.check(test)) {
                return await this.classify(holder, child, test);
            }
        }
    }

    /**
     * Обновление статистики
     *
     * @param excepted ожидаемое значение
     * @param actual реальное значение
     */
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

    /**
     * Отрисовка статистики
     */
    private drawResult() {
        document.getElementById('result-classified').innerText
            = `${this.statistic.classifier.toString()}/${this.statistic.total.toString()}`;
        document.getElementById('result-successful').innerText = this.statistic.successful.toString();
        document.getElementById('result-errors').innerText = this.statistic.errors.toString();
        document.getElementById('result-error-percent').innerText
            = parseFloat((this.statistic.errorPercent * 100).toFixed(2)).toString() + '%';
    }
}