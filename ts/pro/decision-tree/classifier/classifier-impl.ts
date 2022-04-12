import {Dataset} from "../csv/csv";
import {Condition, TreeFlow, TreeLeaf, TreeMark, TreeNode, TreeNodeType} from "./classifier";

abstract class TreeNodeImpl implements TreeNode {

    readonly condition: Condition;

    abstract readonly htmlElement: HTMLElement;

    protected constructor(condition: Condition) {
        this.condition = condition;
    }

    deleteDisplay() {
        this.htmlElement.parentElement.removeChild(this.htmlElement);
    }

    abstract get type(): TreeNodeType;

    abstract createDisplay(): void

    abstract resetDisplay(): void;

    abstract markDisplay(value: TreeMark): void;

}

export class TreeFlowImpl extends TreeNodeImpl implements TreeFlow {

    private readonly dataset: Dataset;

    readonly type = TreeNodeType.FLOW;

    readonly children: TreeNode[];

    readonly htmlElement: HTMLElement;

    readonly htmlSpanElement: HTMLElement;

    readonly htmlUlElement: HTMLElement;

    constructor(dataset: Dataset, condition: Condition, children: TreeNode[]) {
        super(condition);
        this.dataset = dataset;
        this.children = children;
        this.htmlElement = document.createElement('li');
        this.htmlSpanElement = this.htmlElement.appendChild(document.createElement('span'));
        this.htmlUlElement = this.htmlElement.appendChild(document.createElement('ul'));
    }

    createDisplay() {
        if (this.condition) {
            this.htmlSpanElement.innerHTML =
                `${this.condition.displayAttribute()}<br>
            ${this.condition.displayOperator()} ${this.condition.displayValue()}`;
            this.htmlSpanElement.classList.add('node');
        }
        else {
            this.htmlSpanElement.classList.add('root');
            this.htmlSpanElement.textContent = 'Корень';
        }

        for (const child of this.children) {
            this.htmlUlElement.appendChild(child.htmlElement);
            child.createDisplay();
        }
    }

    resetDisplay() {
        for (const child of this.children) {
            child.resetDisplay();
        }
        this.markDisplay(TreeMark.NONE);
    }

    markDisplay(value: TreeMark) {
        if (value != TreeMark.NONE) {
            this.htmlSpanElement.setAttribute('mark', value);
        }
        else {
            this.htmlSpanElement.removeAttribute('mark');
        }
    }
}

export class TreeLeafImpl extends TreeNodeImpl implements TreeLeaf {

    private readonly dataset: Dataset;

    private rightCount: number = 0;

    private wrongCount: number = 0;

    readonly type = TreeNodeType.LEAF;

    readonly classValue: number;

    readonly htmlElement: HTMLElement;

    readonly htmlSpanElement: HTMLElement;

    readonly htmlUlElement: HTMLElement;

    readonly htmlClassElement: HTMLElement;

    readonly htmlClassSpanElement: HTMLElement;

    readonly htmlClassCounterElement: HTMLElement;

    constructor(dataset: Dataset, condition: Condition, classValue: number) {
        super(condition);
        this.dataset = dataset;
        this.classValue = classValue;
        this.htmlElement = document.createElement('li');
        this.htmlSpanElement = this.htmlElement.appendChild(document.createElement('span'));
        this.htmlUlElement = this.htmlElement.appendChild(document.createElement('ul'));
        this.htmlClassElement = this.htmlUlElement.appendChild(document.createElement('li'));
        this.htmlClassSpanElement = this.htmlClassElement.appendChild(document.createElement('span'));
        this.htmlClassCounterElement = document.createElement('span');
    }

    createDisplay() {
        if (this.condition) {
            this.htmlSpanElement.innerHTML =
                `${this.condition.displayAttribute()}<br>
            ${this.condition.displayOperator()} ${this.condition.displayValue()}`;
            this.htmlSpanElement.classList.add('node');
        }
        else {
            this.htmlSpanElement.classList.add('root');
            this.htmlSpanElement.textContent = 'Корень';
        }

        this.htmlClassSpanElement.innerHTML = `${this.dataset.class.values[this.classValue]}<br>`;
        this.htmlClassSpanElement.classList.add('leaf');

        this.htmlClassCounterElement.classList.add("result");
        this.htmlClassSpanElement.appendChild(this.htmlClassCounterElement);
        this.updateCounter();
    }

    markDisplay(value: TreeMark) {
        if (value == TreeMark.NONE) {
            this.htmlSpanElement.removeAttribute('mark');
            this.htmlClassSpanElement.removeAttribute('mark');
        }
        else if (value == TreeMark.HIGHLIGHT) {
            this.htmlSpanElement.setAttribute('mark', TreeMark.HIGHLIGHT);
        }
        else {
            this.htmlClassSpanElement.setAttribute('mark', value);
            this.incrementCount(value);
        }
    }

    resetDisplay() {
        this.rightCount = this.wrongCount = 0;
        this.updateCounter();
        this.markDisplay(TreeMark.NONE);
    }

    private incrementCount(value: TreeMark) {
        if (value == TreeMark.RIGHT) {
            ++this.rightCount;
        }
        else {
            ++this.wrongCount
        }
        this.updateCounter();
    }

    private updateCounter() {
        this.htmlClassCounterElement.textContent = `✔️${this.rightCount} ❌${this.wrongCount}`;
    }
}