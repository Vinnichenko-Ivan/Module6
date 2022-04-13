var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../classifier/classifier-id3", "../utils/id3", "../classifier/classifier", "../classifier/classifier-impl"], function (require, exports, classifier_id3_1, id3_1, classifier_1, classifier_impl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BuildTreeID3Algorithm = void 0;
    function equalsChildren(children) {
        if (children.length === 0 || children[0].type != classifier_1.TreeNodeType.LEAF) {
            return false;
        }
        let classValue = children[0].classValue;
        for (let i = 1; i < children.length; i++) {
            if (children[i].type != classifier_1.TreeNodeType.LEAF || children[i].classValue != classValue) {
                return false;
            }
        }
        return true;
    }
    class BuildTreeID3Algorithm {
        constructor(learnDataset, minSubsetSize, minInfoGain, maxTreeDepth, maxThresholdClassPercent, minThresholdClassPercent) {
            this.learnDataset = learnDataset;
            this.minSubsetSize = minSubsetSize;
            this.minInfoGain = minInfoGain;
            this.maxTreeDepth = maxTreeDepth;
            this.maxThresholdClassPercent = maxThresholdClassPercent;
            this.minThresholdClassPercent = minThresholdClassPercent;
        }
        run(holder) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.build(null, this.learnDataset.copyFull(), 0);
            });
        }
        build(condition, dataset, deep) {
            return __awaiter(this, void 0, void 0, function* () {
                let bags = id3_1.Distribution.of(dataset);
                let targetClass = bags.maxClass;
                let leaf = true;
                let children = [];
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
                            let child = yield this.build(conditions[i], sets[i], deep + 1);
                            children.push(child);
                        }
                        if (!equalsChildren(children)) {
                            leaf = false;
                        }
                    }
                }
                return leaf
                    ? new classifier_impl_1.TreeLeafImpl(this.learnDataset, condition, targetClass)
                    : new classifier_impl_1.TreeFlowImpl(this.learnDataset, condition, children);
            });
        }
        findBestSplit(dataset) {
            let distribution = id3_1.Distribution.of(dataset);
            if (distribution.totalCount < this.minSubsetSize * 2
                || distribution.totalCount == distribution.perClass[distribution.maxClass]) {
                return null;
            }
            let splits = new Array(dataset.attributeCount);
            for (const attribute of dataset.attributes) {
                if (attribute.isClass) {
                    continue;
                }
                let split;
                if (attribute.isDiscrete) {
                    split = new classifier_id3_1.EnumSplit(dataset, attribute, this.minSubsetSize);
                }
                else {
                    split = new classifier_id3_1.NumberSplit(dataset, attribute, this.minSubsetSize);
                }
                if (split.calc()) {
                    splits[attribute.index] = split;
                }
            }
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
        thresholdClassPercent(deep) {
            return (-Math.sqrt(Math.min(deep, this.maxTreeDepth) / this.maxTreeDepth) + 1)
                * (this.maxThresholdClassPercent - this.minThresholdClassPercent) + this.minThresholdClassPercent;
        }
    }
    exports.BuildTreeID3Algorithm = BuildTreeID3Algorithm;
});
//# sourceMappingURL=build-tree-id3.js.map