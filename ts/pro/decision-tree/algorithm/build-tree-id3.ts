import {Algorithm, AlgorithmHolder} from "./algorithm";
import {Dataset} from "../csv/csv";
import {EnumSplit, NumberSplit} from "../classifier/classifier-id3-impl";
import {Distribution} from "../utils/id3";
import {Condition, Split, TreeLeaf, TreeNode, TreeNodeType} from "../classifier/classifier";
import {TreeFlowImpl, TreeLeafImpl} from "../classifier/classifier-impl";

/**
 * Проверяет, не совпадают ли классы у всех листов
 * @param children потомки
 * @return true, если все листы совпадают
 */
function equalsChildren(children: TreeNode[]): boolean {
    if (children.length === 0 || children[0].type != TreeNodeType.LEAF) {
        return false;
    }

    let classValue = (<TreeLeaf>children[0]).classValue;
    for (let i = 1; i < children.length; i++) {
        if (children[i].type != TreeNodeType.LEAF || (<TreeLeaf>children[i]).classValue != classValue) {
            return false;
        }
    }
    return true;
}

export class BuildTreeID3Algorithm implements Algorithm {

    /**
     * Датасет на обучение
     */
    private readonly learnDataset: Dataset;

    /**
     * Минимальное количество элементов в подмножествах, на которые можно разделить множество
     */
    private readonly minSubsetSize: number;

    /**
     * Порог прироста информации, выше которого разделение не будут игнорироваться
     */
    private readonly minInfoGain: number;

    /**
     * Максимальная глубина дерева
     */
    private readonly maxTreeDepth: number;

    /**
     * Максимальный порог процентного соотношение наибольшего класса,
     * чтобы ветка превратилась в лист
     */
    private readonly maxThresholdClassPercent: number;

    /**
     * Минимальный порог процентного соотношение наибольшего класса,
     * чтобы ветка превратилась в лист
     */
    private readonly minThresholdClassPercent: number;

    constructor(learnDataset: Dataset,
                minSubsetSize: number,
                minInfoGain: number,
                maxTreeDepth: number,
                maxThresholdClassPercent: number,
                minThresholdClassPercent: number) {
        this.learnDataset = learnDataset;
        this.minSubsetSize = minSubsetSize;
        this.minInfoGain = minInfoGain;
        this.maxTreeDepth = maxTreeDepth;
        this.maxThresholdClassPercent = maxThresholdClassPercent;
        this.minThresholdClassPercent = minThresholdClassPercent;
    }

    async run(holder: AlgorithmHolder): Promise<TreeNode> {
        return await this.build(holder, null, this.learnDataset, 0);
    }

    /**
     * Построение дерева
     * @param holder
     * @param condition
     * @param dataset
     * @param deep
     * @private
     */
    private async build(holder: AlgorithmHolder,
                        condition: Condition,
                        dataset: Dataset,
                        deep: number): Promise<TreeNode> {

        let bags = Distribution.of(dataset);
        let targetClass = bags.maxClass;
        let leaf = true;
        let children = []
        let classPercent = bags.perClass[bags.maxClass] / bags.totalCount;

        if (deep < this.maxTreeDepth && classPercent <= this.thresholdClassPercent(deep)) {
            let split = this.findBestSplit(dataset);

            if (split != undefined) {
                let sets = split.split();
                let conditions = split.conditions();

                for (let i = 0; i < sets.length; i++) {
                    if (sets[i].templateCount === 0) {
                        continue;
                    }

                    let child = await this.build(holder, conditions[i], sets[i], deep + 1);
                    children.push(child);
                }

                // Обрезка совпадающих листов
                if (!equalsChildren(children)) {
                    leaf = false;
                }
            }
        }

        await holder.delay();
        return leaf
            ? new TreeLeafImpl(this.learnDataset, condition, targetClass)
            : new TreeFlowImpl(this.learnDataset, condition, children);
    }

    /**
     * Поиск наилучшего разделения
     * @param dataset данные
     */
    private findBestSplit(dataset: Dataset): Split {
        // Принадлежат ли все экземпляры одному классу
        // или недостаточно экземпляров для разделения
        let distribution = Distribution.of(dataset);
        if (distribution.totalCount < this.minSubsetSize * 2
            || distribution.totalCount == distribution.perClass[distribution.maxClass]) {
            return null;
        }

        // Массив ID3 разделений
        let splits = new Array<Split>(dataset.attributeCount);

        // Для каждого атрибута
        for (const attribute of dataset.attributes) {
            // Если атрибут является классом - пропускаем
            if (attribute.isClass) {
                continue;
            }

            let split;
            if (attribute.isDiscrete) {
                split = new EnumSplit(dataset, attribute, this.minSubsetSize);
            }
            else {
                split = new NumberSplit(dataset, attribute, this.minSubsetSize);
            }

            if (split.calc()) {
                splits[attribute.index] = split;
            }
        }

        // Поиск лучшего атрибута для разделения
        let maxInfoGain = 0;
        let bestSplit;
        for (const attribute of dataset.attributes) {
            let split = splits[attribute.index];

            if (attribute.isClass || split == undefined) {
                continue;
            }

            if (split.infoGain >= maxInfoGain) {
                maxInfoGain = split.infoGain;
                bestSplit = split;
            }
        }

        if (maxInfoGain <= this.minInfoGain) {
            return null;
        }

        return bestSplit;
    }

    /**
     * Подсчет порога процента классов
     * @param deep глубина рекурсии
     */
    private thresholdClassPercent(deep: number): number {
        return (-Math.sqrt(Math.min(deep, this.maxTreeDepth) / this.maxTreeDepth) + 1)
            * (this.maxThresholdClassPercent - this.minThresholdClassPercent) + this.minThresholdClassPercent;
    }
}