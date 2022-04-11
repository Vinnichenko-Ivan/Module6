import {Dataset} from "../csv/csv";
import {Condition, TreeFlow, TreeLeaf, TreeMark, TreeNode, TreeNodeType} from "./classifier";

abstract class TreeNodeImpl implements TreeNode {

    readonly condition: Condition;

    readonly htmlElement: HTMLElement;

    protected constructor(condition: Condition) {
        this.condition = condition;
    }

    abstract get type(): TreeNodeType;

    abstract createDisplay(): void

    abstract deleteDisplay(): void

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
            this.htmlSpanElement.innerText = 'Корень';
        }

        for (const child of this.children) {
            this.htmlUlElement.appendChild(child.htmlElement);
            child.createDisplay();
        }
    }

    deleteDisplay() {
        this.htmlElement.parentElement.removeChild(this.htmlElement);
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

    private count: number = 0;

    readonly type = TreeNodeType.LEAF;

    readonly classValue: number;

    readonly htmlElement: HTMLElement;

    readonly htmlSpanElement: HTMLElement;

    readonly htmlUlElement: HTMLElement;

    readonly htmlClassElement: HTMLElement;

    readonly htmlClassSpanElement: HTMLElement;

    constructor(dataset: Dataset, condition: Condition, classValue: number) {
        super(condition);
        this.dataset = dataset;
        this.classValue = classValue;
        this.htmlElement = document.createElement('li');
        this.htmlSpanElement = this.htmlElement.appendChild(document.createElement('span'));
        this.htmlUlElement = this.htmlElement.appendChild(document.createElement('ul'));
        this.htmlClassElement = this.htmlUlElement.appendChild(document.createElement('li'));
        this.htmlClassSpanElement = this.htmlClassElement.appendChild(document.createElement('span'));
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
            this.htmlSpanElement.innerText = 'Корень';
        }

        this.htmlClassSpanElement.innerText = this.dataset.class.values[this.classValue];
        this.htmlClassSpanElement.classList.add('leaf');
    }

    deleteDisplay() {
        this.htmlElement.parentElement.removeChild(this.htmlElement);
    }

    markDisplay(value: TreeMark) {
        if (value != TreeMark.NONE) {
            this.htmlSpanElement.setAttribute('mark', TreeMark.HIGHLIGHT);
            this.htmlClassSpanElement.setAttribute('mark', value);
        }
        else {
            this.htmlSpanElement.removeAttribute('mark');
            this.htmlClassSpanElement.removeAttribute('mark');
        }
    }

    incrementCount() {

    }

    resetCount(){

    }
}