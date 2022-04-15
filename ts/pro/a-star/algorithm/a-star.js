var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../field"], function (require, exports, field_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AStarAlgorithm = void 0;
    class Node {
        constructor(position, distance, heuristic) {
            this.position = position;
            this.distance = distance;
            this.heuristic = heuristic;
        }
        get weight() {
            return this.distance + this.heuristic;
        }
    }
    class AStarAlgorithm {
        constructor(field, startPosition, endPosition) {
            this.field = field;
            this.startPosition = startPosition;
            this.endPosition = endPosition;
        }
        run(holder) {
            return __awaiter(this, void 0, void 0, function* () {
                let reachable = [this.newNode(this.startPosition, 0)];
                let explored = [];
                while (reachable.length && holder.running) {
                    let node = findMin(reachable);
                    if (this.endPosition.equals(node.position)) {
                        let path = [];
                        while (node) {
                            path.push(node.position);
                            node = node.parent;
                        }
                        return path;
                    }
                    reachable.splice(reachable.indexOf(node), 1);
                    explored.push(node);
                    this.field.getCell(node.position).explored = true;
                    for (const adjacent of this.adjacentNodes(node)) {
                        if (!contains(explored, adjacent.position)) {
                            let previous = find(reachable, adjacent.position);
                            if (previous != undefined) {
                                if (previous.weight < adjacent.weight) {
                                    continue;
                                }
                                reachable.splice(reachable.indexOf(previous), 1);
                            }
                            adjacent.parent = node;
                            reachable.push(adjacent);
                            this.field.getCell(adjacent.position).reachable = true;
                        }
                    }
                    yield holder.delay();
                }
                return [];
            });
        }
        newNode(position, distance) {
            return new Node(position, distance, manhattan(position.sub(this.endPosition.x, this.endPosition.y).abs()));
        }
        adjacentNodes(node) {
            let distance = node.distance;
            let position = node.position;
            let nodes = [];
            if (position.x > 0
                && this.field.getType(position.subX(1)) == field_1.CellState.EMPTY) {
                nodes.push(this.newNode(position.subX(1), distance + 1));
            }
            if (position.x < this.field.width - 1
                && this.field.getType(position.addX(1)) == field_1.CellState.EMPTY) {
                nodes.push(this.newNode(position.addX(1), distance + 1));
            }
            if (position.y > 0
                && this.field.getType(position.subY(1)) == field_1.CellState.EMPTY) {
                nodes.push(this.newNode(position.subY(1), distance + 1));
            }
            if (position.y < this.field.height - 1
                && this.field.getType(position.addY(1)) == field_1.CellState.EMPTY) {
                nodes.push(this.newNode(position.addY(1), distance + 1));
            }
            if (position.x > 0 && position.y > 0
                && this.field.getType(position.sub(1, 1)) == field_1.CellState.EMPTY
                && (this.field.getType(position.subX(1)) == field_1.CellState.EMPTY
                    || this.field.getType(position.subY(1)) == field_1.CellState.EMPTY)) {
                nodes.push(this.newNode(position.sub(1, 1), distance + Math.SQRT2));
            }
            if (position.x < this.field.width - 1 && position.y > 0
                && this.field.getType(position.add(1, -1)) == field_1.CellState.EMPTY
                && (this.field.getType(position.addX(1)) == field_1.CellState.EMPTY
                    || this.field.getType(position.subY(1)) == field_1.CellState.EMPTY)) {
                nodes.push(this.newNode(position.add(1, -1), distance + Math.SQRT2));
            }
            if (position.x > 0 && position.y < this.field.height - 1
                && this.field.getType(position.add(-1, 1)) == field_1.CellState.EMPTY
                && (this.field.getType(position.subX(1)) == field_1.CellState.EMPTY
                    || this.field.getType(position.addY(1)) == field_1.CellState.EMPTY)) {
                nodes.push(this.newNode(position.add(-1, 1), distance + Math.SQRT2));
            }
            if (position.x < this.field.width - 1 && position.y < this.field.height - 1
                && this.field.getType(position.add(1, 1)) == field_1.CellState.EMPTY
                && (this.field.getType(position.addX(1)) == field_1.CellState.EMPTY
                    || this.field.getType(position.addY(1)) == field_1.CellState.EMPTY)) {
                nodes.push(this.newNode(position.add(1, 1), distance + Math.SQRT2));
            }
            return nodes;
        }
    }
    exports.AStarAlgorithm = AStarAlgorithm;
    function findMin(array) {
        let min = array[0];
        for (let i = 1; i < array.length; i++) {
            if (array[i].weight < min.weight) {
                min = array[i];
            }
        }
        return min;
    }
    function find(array, position) {
        for (const element of array) {
            if (position.equals(element.position)) {
                return element;
            }
        }
        return null;
    }
    function contains(array, position) {
        for (const element of array) {
            if (position.equals(element.position)) {
                return true;
            }
        }
        return false;
    }
    function manhattan(position) {
        return position.x + position.y;
    }
});
//# sourceMappingURL=a-star.js.map