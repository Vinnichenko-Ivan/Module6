import {Position} from "./utils";

export enum CellState {
    EMPTY = 'empty',
    WALL = 'wall'
}

export enum CellMark {
    NONE = 'none',
    START = 'start',
    END = 'end'
}

/**
 * Класс клетки
 */
export class Cell {

    private readonly htmlElement: HTMLElement;

    private _state: CellState;

    private _mark: CellMark;

    private _reachable: boolean = false;

    private _explored: boolean = false;

    private _path: boolean = false;

    constructor(htmlElement: HTMLElement, state: CellState) {
        this.htmlElement = htmlElement;
        this._state = state;
        this._mark = CellMark.NONE;
    }

    get state(): CellState {
        return this._state;
    }

    set state(state: CellState) {
        this._state = state;
        if (this.mark == CellMark.NONE) {
            this.htmlElement.setAttribute('type', state);
        }
    }

    get mark(): CellMark {
        return this._mark;
    }

    set mark(mark: CellMark) {
        this._mark = mark;
        if (this.state == CellState.EMPTY) {
            this.htmlElement.setAttribute('type', mark);
        }
    }

    get reachable(): boolean {
        return this._reachable;
    }

    set reachable(value: boolean) {
        this._reachable = value;
        if (value) {
            this.htmlElement.classList.add('reachable');
        }
        else {
            this.htmlElement.classList.remove('reachable');
        }
    }

    get explored(): boolean {
        return this._explored;
    }

    set explored(value: boolean) {
        this._explored = value;
        if (value) {
            this.htmlElement.classList.add('explored');
        }
        else {
            this.htmlElement.classList.remove('explored');
        }
    }

    get path(): boolean {
        return this._path;
    }

    set path(value: boolean) {
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

/**
 * Класс поля
 */
export class Field {

    htmlElement: HTMLElement;

    width: number;

    height: number;

    private matrix: Cell[][];

    constructor(htmlElement: HTMLElement) {
        this.htmlElement = htmlElement;
    }

    getCell(position: Position): Cell {
        return this.matrix[position.x][position.y];
    }

    getType(position: Position): CellState {
        return this.matrix[position.x][position.y].state;
    }

    setType(position: Position, state: CellState) {
        let cell = this.matrix[position.x][position.y];
        cell.state = state;
    }

    getMark(position: Position): CellMark {
        return this.matrix[position.x][position.y].mark;
    }

    setMark(position: Position, mark: CellMark) {
        let cell = this.matrix[position.x][position.y];
        cell.mark = mark;
    }

    fillType(state: CellState) {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                let cell = this.getCell(new Position(i, j));
                cell.reset();
                cell.state = state;
            }
        }
    }

    clearAttributes() {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                let cell = this.getCell(new Position(i, j));
                cell.reachable = false;
                cell.explored = false;
                cell.path = false;
            }
        }
    }

    rebuild() {
        // Создаем матрицу
        this.matrix = new Array<Cell[]>(this.height);
        for (let i = 0; i < this.height; i++) {
            this.matrix[i] = new Array<Cell>(this.width);
        }

        // Удаляем все элементы
        while (this.htmlElement.firstChild) {
            this.htmlElement.removeChild(this.htmlElement.lastChild)
        }

        // Добавляем элементы
        for (let y = 0; y < this.height; y++) {
            let cellRowElement = this.htmlElement.appendChild(document.createElement('div'));
            cellRowElement.classList.add('cell-row');

            for (let x = 0; x < this.width; x++) {
                let position = new Position(x, y);
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