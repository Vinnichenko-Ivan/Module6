define(["require", "exports", "./classifier"], function (require, exports, classifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TreeLeafImpl = exports.TreeFlowImpl = void 0;
    class TreeNodeImpl {
        constructor(condition) {
            this.condition = condition;
        }
        deleteDisplay() {
            this.htmlElement.parentElement.removeChild(this.htmlElement);
        }
    }
    class TreeFlowImpl extends TreeNodeImpl {
        constructor(dataset, condition, children) {
            super(condition);
            this.type = classifier_1.TreeNodeType.FLOW;
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
            this.markDisplay(classifier_1.TreeMark.NONE);
        }
        markDisplay(value) {
            if (value != classifier_1.TreeMark.NONE) {
                this.htmlSpanElement.setAttribute('mark', value);
            }
            else {
                this.htmlSpanElement.removeAttribute('mark');
            }
        }
    }
    exports.TreeFlowImpl = TreeFlowImpl;
    class TreeLeafImpl extends TreeNodeImpl {
        constructor(dataset, condition, classValue) {
            super(condition);
            this.rightCount = 0;
            this.wrongCount = 0;
            this.type = classifier_1.TreeNodeType.LEAF;
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
        markDisplay(value) {
            if (value == classifier_1.TreeMark.NONE) {
                this.htmlSpanElement.removeAttribute('mark');
                this.htmlClassSpanElement.removeAttribute('mark');
            }
            else if (value == classifier_1.TreeMark.HIGHLIGHT) {
                this.htmlSpanElement.setAttribute('mark', classifier_1.TreeMark.HIGHLIGHT);
            }
            else {
                this.htmlClassSpanElement.setAttribute('mark', value);
                this.incrementCount(value);
            }
        }
        resetDisplay() {
            this.rightCount = this.wrongCount = 0;
            this.updateCounter();
            this.markDisplay(classifier_1.TreeMark.NONE);
        }
        incrementCount(value) {
            if (value == classifier_1.TreeMark.RIGHT) {
                ++this.rightCount;
            }
            else {
                ++this.wrongCount;
            }
            this.updateCounter();
        }
        updateCounter() {
            this.htmlClassCounterElement.textContent = `✔️${this.rightCount} ❌${this.wrongCount}`;
        }
    }
    exports.TreeLeafImpl = TreeLeafImpl;
});
//# sourceMappingURL=classifier-impl.js.map