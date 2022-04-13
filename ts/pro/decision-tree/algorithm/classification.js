var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../classifier/classifier"], function (require, exports, classifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClassificationAlgorithm = void 0;
    class Statistic {
        constructor(total) {
            this.classifier = 0;
            this.successful = 0;
            this.errors = 0;
            this.errorPercent = 0;
            this.total = total;
        }
    }
    class ClassificationAlgorithm {
        constructor(testDataset, tree) {
            this.selected = [];
            this.testDataset = testDataset.copyFull();
            this.statistic = new Statistic(testDataset.templateCount);
            this.tree = tree;
        }
        run(holder) {
            return __awaiter(this, void 0, void 0, function* () {
                this.tree.resetDisplay();
                for (const test of this.testDataset.templates) {
                    if (!holder.running) {
                        break;
                    }
                    let classValue = yield this.classify(holder, this.tree, test);
                    yield holder.delay();
                    this.updateStatistic(test.value(this.testDataset.class), classValue);
                    this.drawResult();
                    for (const selected of this.selected) {
                        selected.markDisplay(classifier_1.TreeMark.NONE);
                    }
                    this.selected = [];
                }
            });
        }
        classify(holder, node, test) {
            return __awaiter(this, void 0, void 0, function* () {
                yield holder.delay();
                this.selected.push(node);
                if (holder.iterationDelay > 25) {
                    node.markDisplay(classifier_1.TreeMark.HIGHLIGHT);
                }
                if (node.type == classifier_1.TreeNodeType.LEAF) {
                    let leaf = node;
                    let classValue = leaf.classValue;
                    if (test.value(this.testDataset.class) == classValue) {
                        leaf.markDisplay(classifier_1.TreeMark.RIGHT);
                    }
                    else {
                        leaf.markDisplay(classifier_1.TreeMark.WRONG);
                    }
                    return classValue;
                }
                for (const child of node.children) {
                    if (child.condition.check(test)) {
                        return yield this.classify(holder, child, test);
                    }
                }
            });
        }
        updateStatistic(excepted, actual) {
            if (excepted == actual) {
                this.statistic.successful++;
            }
            else {
                this.statistic.errors++;
            }
            this.statistic.classifier++;
            this.statistic.errorPercent = this.statistic.errors / this.statistic.classifier;
        }
        drawResult() {
            document.getElementById('result-classified').innerText
                = `${this.statistic.classifier.toString()}/${this.statistic.total.toString()}`;
            document.getElementById('result-successful').innerText = this.statistic.successful.toString();
            document.getElementById('result-errors').innerText = this.statistic.errors.toString();
            document.getElementById('result-error-percent').innerText
                = parseFloat((this.statistic.errorPercent * 100).toFixed(2)).toString() + '%';
        }
    }
    exports.ClassificationAlgorithm = ClassificationAlgorithm;
});
//# sourceMappingURL=classification.js.map