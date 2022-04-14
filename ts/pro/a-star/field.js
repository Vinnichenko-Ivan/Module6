define(["require", "exports", "./utils"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Field = exports.Cell = exports.CellMark = exports.CellState = void 0;
    var CellState;
    (function (CellState) {
        CellState["EMPTY"] = "empty";
        CellState["WALL"] = "wall";
    })(CellState = exports.CellState || (exports.CellState = {}));
    var CellMark;
    (function (CellMark) {
        CellMark["NONE"] = "none";
        CellMark["START"] = "start";
        CellMark["END"] = "end";
    })(CellMark = exports.CellMark || (exports.CellMark = {}));
    class Cell {
        constructor(htmlElement, state) {
            this._reachable = false;
            this._explored = false;
            this._path = false;
            this.htmlElement = htmlElement;
            this._state = state;
            this._mark = CellMark.NONE;
        }
        get state() {
            return this._state;
        }
        set state(state) {
            this._state = state;
            if (this.mark == CellMark.NONE) {
                this.htmlElement.setAttribute('type', state);
            }
        }
        get mark() {
            return this._mark;
        }
        set mark(mark) {
            this._mark = mark;
            if (this.state == CellState.EMPTY) {
                this.htmlElement.setAttribute('type', mark);
            }
        }
        get reachable() {
            return this._reachable;
        }
        set reachable(value) {
            this._reachable = value;
            if (value) {
                this.htmlElement.classList.add('reachable');
            }
            else {
                this.htmlElement.classList.remove('reachable');
            }
        }
        get explored() {
            return this._explored;
        }
        set explored(value) {
            this._explored = value;
            if (value) {
                this.htmlElement.classList.add('explored');
            }
            else {
                this.htmlElement.classList.remove('explored');
            }
        }
        get path() {
            return this._path;
        }
        set path(value) {
            this._path = value;
            if (value) {
                this.htmlElement.classList.add('path');
            }
            else {
                this.htmlElement.classList.remove('path');
            }
        }
        reset() {
            this.state = CellState.EMPTY;
            this.mark = CellMark.NONE;
            this.reachable = false;
            this.explored = false;
            this.path = false;
        }
    }
    exports.Cell = Cell;
    class Field {
        constructor(htmlElement) {
            this.htmlElement = htmlElement;
        }
        getCell(position) {
            return this.matrix[position.x][position.y];
        }
        getType(position) {
            return this.matrix[position.x][position.y].state;
        }
        setType(position, state) {
            let cell = this.matrix[position.x][position.y];
            cell.state = state;
        }
        getMark(position) {
            return this.matrix[position.x][position.y].mark;
        }
        setMark(position, mark) {
            let cell = this.matrix[position.x][position.y];
            cell.mark = mark;
        }
        fillType(state) {
            for (let i = 0; i < this.matrix.length; i++) {
                for (let j = 0; j < this.matrix[i].length; j++) {
                    let cell = this.getCell(new utils_1.Position(i, j));
                    cell.reset();
                    cell.state = state;
                }
            }
        }
        clearAttributes() {
            for (let i = 0; i < this.matrix.length; i++) {
                for (let j = 0; j < this.matrix[i].length; j++) {
                    let cell = this.getCell(new utils_1.Position(i, j));
                    cell.reachable = false;
                    cell.explored = false;
                    cell.path = false;
                }
            }
        }
        rebuild() {
            this.matrix = new Array(this.height);
            for (let i = 0; i < this.height; i++) {
                this.matrix[i] = new Array(this.width);
            }
            while (this.htmlElement.firstChild) {
                this.htmlElement.removeChild(this.htmlElement.lastChild);
            }
            for (let y = 0; y < this.height; y++) {
                let cellRowElement = this.htmlElement.appendChild(document.createElement('div'));
                cellRowElement.classList.add('cell-row');
                for (let x = 0; x < this.width; x++) {
                    let position = new utils_1.Position(x, y);
                    let cellElement = cellRowElement.appendChild(document.createElement('div'));
                    cellElement.classList.add('cell');
                    cellElement.setAttribute('type', 'empty');
                    cellElement.setAttribute('x', String(x));
                    cellElement.setAttribute('y', String(y));
                    cellElement.onclick = () => {
                        if (this.getType(position) == CellState.WALL) {
                            this.setType(position, CellState.EMPTY);
                        }
                        else if (this.getMark(position) != CellMark.START && this.getMark(position) != CellMark.END) {
                            this.setType(position, CellState.WALL);
                        }
                    };
                    this.matrix[x][y] = new Cell(cellElement, CellState.EMPTY);
                }
            }
        }
    }
    exports.Field = Field;
});
//# sourceMappingURL=field.js.map