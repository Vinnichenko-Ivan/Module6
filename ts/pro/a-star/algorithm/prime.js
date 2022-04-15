var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../field", "../utils"], function (require, exports, field_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PrimeAlgorithm = void 0;
    var Direction;
    (function (Direction) {
        Direction[Direction["NORTH"] = 0] = "NORTH";
        Direction[Direction["SOUTH"] = 1] = "SOUTH";
        Direction[Direction["EAST"] = 2] = "EAST";
        Direction[Direction["WEST"] = 3] = "WEST";
    })(Direction || (Direction = {}));
    class PrimeAlgorithm {
        constructor(field) {
            this.field = field;
        }
        run(holder) {
            return __awaiter(this, void 0, void 0, function* () {
                this.field.fillType(field_1.CellState.WALL);
                let x = ((Math.random() * (this.field.width / 2)) | 0) * 2 + 1;
                let y = ((Math.random() * (this.field.height / 2)) | 0) * 2 + 1;
                let position = new utils_1.Position(x, y);
                this.field.setType(position, field_1.CellState.EMPTY);
                let queue = [];
                if (y - 2 >= 0) {
                    queue.push(position.subY(2));
                }
                if (y + 2 < this.field.height) {
                    queue.push(position.addY(2));
                }
                if (x - 2 >= 0) {
                    queue.push(position.subX(2));
                }
                if (x + 2 < this.field.width) {
                    queue.push(position.addX(2));
                }
                while (queue.length && holder.running) {
                    let index = (Math.random() * queue.length) | 0;
                    let position = queue[index];
                    queue.splice(index, 1);
                    this.field.setType(position, field_1.CellState.EMPTY);
                    let directions = [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST];
                    while (directions.length) {
                        let directionIndex = (Math.random() * directions.length) | 0;
                        switch (directions[directionIndex]) {
                            case Direction.NORTH:
                                if (position.y - 2 >= 0
                                    && this.field.getType(position.subY(2)) == field_1.CellState.EMPTY) {
                                    this.field.setType(position.subY(1), field_1.CellState.EMPTY);
                                    directions = [];
                                }
                                break;
                            case Direction.SOUTH:
                                if (position.y + 2 < this.field.height
                                    && this.field.getType(position.addY(2)) == field_1.CellState.EMPTY) {
                                    this.field.setType(position.addY(1), field_1.CellState.EMPTY);
                                    directions = [];
                                }
                                break;
                            case Direction.EAST:
                                if (position.x - 2 >= 0
                                    && this.field.getType(position.subX(2)) == field_1.CellState.EMPTY) {
                                    this.field.setType(position.subX(1), field_1.CellState.EMPTY);
                                    directions = [];
                                }
                                break;
                            case Direction.WEST:
                                if (position.x + 2 < this.field.width
                                    && this.field.getType(position.addX(2)) == field_1.CellState.EMPTY) {
                                    this.field.setType(position.addX(1), field_1.CellState.EMPTY);
                                    directions = [];
                                }
                                break;
                        }
                        directions.splice(directionIndex, 1);
                    }
                    if (position.y - 2 >= 0
                        && this.field.getType(position.subY(2)) == field_1.CellState.WALL
                        && !contains(queue, position.subY(2))) {
                        queue.push(position.subY(2));
                    }
                    if (position.y + 2 < this.field.height
                        && this.field.getType(position.addY(2)) == field_1.CellState.WALL
                        && !contains(queue, position.addY(2))) {
                        queue.push(position.addY(2));
                    }
                    if (position.x - 2 >= 0
                        && this.field.getType(position.subX(2)) == field_1.CellState.WALL
                        && !contains(queue, position.subX(2))) {
                        queue.push(position.subX(2));
                    }
                    if (position.x + 2 < this.field.width
                        && this.field.getType(position.addX(2)) == field_1.CellState.WALL
                        && !contains(queue, position.addX(2))) {
                        queue.push(position.addX(2));
                    }
                    yield holder.delay();
                }
                this.setRandomCell(field_1.CellMark.START);
                this.setRandomCell(field_1.CellMark.END);
            });
        }
        setRandomCell(mark) {
            let size = this.field.width * this.field.height;
            let random = (Math.random() * size) | 0;
            for (let index = random; index !== random - 1; index = (index + 1) % size) {
                let x = index % this.field.height;
                let y = (index / this.field.height) | 0;
                if (this.field.getType(new utils_1.Position(x, y)) == field_1.CellState.EMPTY) {
                    this.field.setMark(new utils_1.Position(x, y), mark);
                    return;
                }
            }
            let x = random % this.field.height;
            let y = (random / this.field.height) | 0;
            this.field.setMark(new utils_1.Position(x, y), mark);
        }
    }
    exports.PrimeAlgorithm = PrimeAlgorithm;
    function contains(array, position) {
        for (const element of array) {
            if (position.equals(element)) {
                return true;
            }
        }
        return false;
    }
});
//# sourceMappingURL=prime.js.map