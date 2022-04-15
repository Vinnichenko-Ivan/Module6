var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./algorithm/a-star", "./algorithm/algorithm", "./field", "./utils", "./algorithm/prime", "./audio"], function (require, exports, a_star_1, algorithm_1, field_1, utils_1, prime_1, audio_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const field = new field_1.Field(document.getElementById("field"));
    const algorithmHolder = new algorithm_1.AlgorithmHolder();
    let selected;
    $('#change-theme').on('change', changeTheme);
    $('#field-resize').on('click', resizeField);
    $('#field-generate').on('click', generateLabyrinth);
    $('#field-find').on('click', findPath);
    const iterDelayElement = $('.iter-delay.val').on('input', e => setIterationDelay(e.target))[0];
    const fieldSizeElement = $('.field-size.val').on('input', e => setFieldSize(e.target))[0];
    $('#field')
        .on('mousedown', event => {
        if (!algorithmHolder.running && $(event.target).hasClass('cell')) {
            let x = +event.target.getAttribute('x');
            let y = +event.target.getAttribute('y');
            selected = field.getCell(new utils_1.Position(x, y));
        }
        return false;
    })
        .on('mouseup', event => {
        if (!algorithmHolder.running && $(event.target).hasClass('cell')) {
            let x = +event.target.getAttribute('x');
            let y = +event.target.getAttribute('y');
            let element = field.getCell(new utils_1.Position(x, y));
            if (selected.mark != field_1.CellMark.NONE && element.mark == field_1.CellMark.NONE) {
                let oldMark = selected.mark;
                selected.reset();
                element.reset();
                element.mark = oldMark;
                selected = null;
            }
        }
    });
    function changeTheme() {
        if (this.checked) {
            $('#dark-theme').attr('media', '');
            $('#light-theme').attr('media', 'none');
        }
        else {
            $('#dark-theme').attr('media', 'none');
            $('#light-theme').attr('media', '');
        }
    }
    function resizeField() {
        return __awaiter(this, void 0, void 0, function* () {
            if (algorithmHolder.running) {
                yield algorithmHolder.stop();
            }
            field.width = field.height = +fieldSizeElement.value;
            field.rebuild();
            selected = null;
            field.setMark(new utils_1.Position(2, (field.height / 2) | 0), field_1.CellMark.START);
            field.setMark(new utils_1.Position(field.width - 3, (field.height / 2) | 0), field_1.CellMark.END);
        });
    }
    function generateLabyrinth() {
        return __awaiter(this, void 0, void 0, function* () {
            if (algorithmHolder.running) {
                yield algorithmHolder.stop();
            }
            algorithmHolder.algorithm = new prime_1.PrimeAlgorithm(field);
            yield algorithmHolder.start();
        });
    }
    function findPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (algorithmHolder.running) {
                yield algorithmHolder.stop();
            }
            let start = $('.cell[type="start"]');
            let end = $('.cell[type="end"]');
            let startPosition = new utils_1.Position(+start.attr('x'), +start.attr('y'));
            let endPosition = new utils_1.Position(+end.attr('x'), +end.attr('y'));
            field.clearAttributes();
            algorithmHolder.algorithm = new a_star_1.AStarAlgorithm(field, startPosition, endPosition);
            let path = yield algorithmHolder.start();
            for (const position of path) {
                field.getCell(position).path = true;
            }
        });
    }
    function setIterationDelay(target) {
        algorithmHolder.iterationDelay = +target.value * 5;
        $('.iter-delay.display').text(algorithmHolder.iterationDelay);
    }
    function setFieldSize(target) {
        $('.field-size.display').text(target.value);
    }
    setIterationDelay(iterDelayElement);
    setFieldSize(fieldSizeElement);
    resizeField().then();
    audio_1.initializeAudio();
});
//# sourceMappingURL=main.js.map