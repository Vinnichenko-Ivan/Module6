var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./csv/csv-loader", "./algorithm/algorithm", "./algorithm/build-tree-id3", "./algorithm/classification", "./move", "./audio", "./modal"], function (require, exports, csv_loader_1, algorithm_1, build_tree_id3_1, classification_1, move_1, audio_1, modal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.drawTree = exports.loadTestFileDataset = exports.loadLearnFileDataset = exports.loadLearnDataset = exports.dataset = void 0;
    move_1.initializeMove();
    modal_1.initializeModal();
    audio_1.initializeAudio();
    class DatasetSettings {
    }
    const algorithmHolder = new algorithm_1.AlgorithmHolder(+$('input[target="iteration-delay"]').val());
    let tree;
    exports.dataset = new DatasetSettings();
    $('.range input').on('input', e => {
        let value = e.target.value;
        if (e.target.hasAttribute("datatype") && e.target.getAttribute("datatype") == 'percent') {
            value = value + '%';
        }
        $(`.range .display[target="${e.target.getAttribute("target")}"]`)
            .text(value);
    });
    $('input[target="iteration-delay"]').on('input', e => {
        algorithmHolder.iterationDelay = +e.target.value;
    });
    $('#run-classification').on('click', runClassification);
    function loadLearnDataset() {
        let named = document.getElementById('named-dataset').checked;
        exports.dataset.learnDataset = csv_loader_1.loadDatasetFromString(exports.dataset.learnDatasetString, exports.dataset.classIndex, named);
    }
    exports.loadLearnDataset = loadLearnDataset;
    function loadLearnFileDataset(callback) {
        let files = document.getElementById('file-dataset').files;
        let reader = new FileReader();
        reader.onload = e => {
            exports.dataset.learnDatasetString = e.target.result;
            loadLearnDataset();
            if (callback != undefined) {
                callback();
            }
        };
        reader.readAsText(files[0], "UTF-8");
    }
    exports.loadLearnFileDataset = loadLearnFileDataset;
    function loadTestFileDataset(callback) {
        let files = document.getElementById('file-tests').files;
        let named = document.getElementById('named-dataset').value == 'on';
        let reader = new FileReader();
        reader.onload = e => {
            exports.dataset.testDataset = csv_loader_1.loadDatasetFromString(e.target.result, undefined, named);
            if (callback != undefined) {
                callback();
            }
        };
        reader.readAsText(files[0], "UTF-8");
    }
    exports.loadTestFileDataset = loadTestFileDataset;
    function drawTree() {
        return __awaiter(this, void 0, void 0, function* () {
            if (algorithmHolder.running) {
                yield algorithmHolder.stop();
            }
            algorithmHolder.algorithm = new build_tree_id3_1.BuildTreeID3Algorithm(exports.dataset.learnDataset, 2, +$('input[target="min-info-gain"]').val() / 100, +$('input[target="max-depth"]').val(), 1, +$('input[target="min-ratio"]').val() / 100);
            let newTree = yield algorithmHolder.start();
            if (tree) {
                tree.deleteDisplay();
            }
            tree = newTree;
            let htmlElement = $('#decision-tree')[0];
            htmlElement.innerHTML = '';
            htmlElement.appendChild(tree.htmlElement);
            tree.createDisplay();
            move_1.resetMove();
        });
    }
    exports.drawTree = drawTree;
    function runClassification() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!exports.dataset.testDataset) {
                return;
            }
            if (algorithmHolder.running) {
                yield algorithmHolder.stop();
            }
            algorithmHolder.algorithm = new classification_1.ClassificationAlgorithm(exports.dataset.testDataset, tree);
            yield algorithmHolder.start();
        });
    }
});
//# sourceMappingURL=main.js.map