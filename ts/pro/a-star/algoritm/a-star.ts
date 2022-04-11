import {Position} from "../utils";
import {CellState, Field} from "../field";
import {Algorithm, AlgorithmHolder} from "./algorithm";

class Node {

    readonly position: Position;

    readonly distance: number;

    readonly heuristic: number;

    parent: Node;

    constructor(position: Position, distance: number, heuristic: number) {
        this.position = position;
        this.distance = distance;
        this.heuristic = heuristic;
    }

    get weight(): number {
        return this.distance + this.heuristic;
    }
}

/**
 * @author Аникушин Роман
 */
export class AStarAlgorithm implements Algorithm {

    private readonly field: Field

    private readonly startPosition: Position;

    private readonly endPosition: Position;

    constructor(field: Field,
                startPosition: Position,
                endPosition: Position) {
        this.field = field;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
    }

    /**
     * Алгоритм A* (асинхронно)
     *
     * @returns {Promise<null|*[]>} массив найденных узлов для пути
     * @see <a href="https://www.gabrielgambetta.com/generic-search.html"> A* algorithm
     */
    async run(holder: AlgorithmHolder): Promise<Position[]> {
        let reachable = [this.newNode(this.startPosition, 0)];
        let explored = [];

        while (reachable.length && holder.running) {
            // Выбор узла
            let node = findMin(reachable);

            // Если мы достигли конца
            if (this.endPosition.equals(node.position)) {
                let path = []

                while (node) {
                    path.push(node.position)
                    node = node.parent;
                }

                return path;
            }

            reachable.splice(reachable.indexOf(node), 1);
            explored.push(node);

            this.field.getCell(node.position).explored = true;

            // Проходимся по смежным узлам, если они
            for (const adjacent of this.adjacentNodes(node)) {
                if (!contains(explored, adjacent.position)) {
                    let previous = find(reachable, adjacent.position);

                    if (previous != undefined) {
                        if (previous.weight < adjacent.weight) {
                            continue;
                        }
                        // Если весы нового путя меньше, чем старого, то будем рассматривать новый путь
                        reachable.splice(reachable.indexOf(previous), 1);
                    }

                    adjacent.parent = node;
                    reachable.push(adjacent);

                    this.field.getCell(adjacent.position).reachable = true;
                }
            }

            // Задержка
            await holder.delay();
        }

        return [];
    }

    /**
     * Функция создания узла для алгоритма A*
     *
     * @param position координаты узла (клетки)
     * @param distance пройденная дистанция от начальной клетки
     * @returns Node узел
     */
    private newNode(position: Position, distance: number): Node {
        return new Node(position, distance, manhattan(position.sub(this.endPosition.x, this.endPosition.y).abs()));
    }

    /**
     * Функция поиска смежных узлов
     *
     * @param node узел
     * @private Node[] смежные узлы
     */
    private adjacentNodes(node: Node): Node[] {
        let distance = node.distance;
        let position = node.position;

        let nodes = [];

        //
        if (position.x > 0
            && this.field.getType(position.subX(1)) == CellState.EMPTY) {
            nodes.push(this.newNode(position.subX(1), distance + 1));
        }
        if (position.x < this.field.width - 1
            && this.field.getType(position.addX(1)) == CellState.EMPTY) {
            nodes.push(this.newNode(position.addX(1), distance + 1));
        }
        if (position.y > 0
            && this.field.getType(position.subY(1)) == CellState.EMPTY) {
            nodes.push(this.newNode(position.subY(1), distance + 1));
        }
        if (position.y < this.field.height - 1
            && this.field.getType(position.addY(1)) == CellState.EMPTY) {
            nodes.push(this.newNode(position.addY(1), distance + 1));
        }

        //
        if (position.x > 0 && position.y > 0
            && this.field.getType(position.sub(1, 1)) == CellState.EMPTY
            && (this.field.getType(position.subX(1)) == CellState.EMPTY
                || this.field.getType(position.subY(1)) == CellState.EMPTY)) {
            nodes.push(this.newNode(position.sub(1, 1), distance + Math.SQRT2));
        }
        if (position.x < this.field.width - 1 && position.y > 0
            && this.field.getType(position.add(1, -1)) == CellState.EMPTY
            && (this.field.getType(position.addX(1, )) == CellState.EMPTY
                || this.field.getType(position.subY(1)) == CellState.EMPTY)) {
            nodes.push(this.newNode(position.add(1, -1), distance + Math.SQRT2));
        }
        if (position.x > 0 && position.y < this.field.height - 1
            && this.field.getType(position.add(-1, 1)) == CellState.EMPTY
            && (this.field.getType(position.subX(1)) == CellState.EMPTY
                || this.field.getType(position.addY(1)) == CellState.EMPTY)) {
            nodes.push(this.newNode(position.add(-1, 1), distance + Math.SQRT2));
        }
        if (position.x < this.field.width - 1 && position.y < this.field.height - 1
            && this.field.getType(position.add(1, 1)) == CellState.EMPTY
            && (this.field.getType(position.addX(1)) == CellState.EMPTY
                || this.field.getType(position.addY(1)) == CellState.EMPTY)) {
            nodes.push(this.newNode(position.add(1, 1), distance + Math.SQRT2));
        }

        return nodes;
    }
}

/**
 * Найти элемент с минимальным весом в массиве
 *
 * @param array массив элементов с весами
 * @returns Node минимальный узел
 */
function findMin(array: Node[]): Node {
    let min = array[0];

    for (let i = 1; i < array.length; i++) {
        if (array[i].weight < min.weight) {
            min = array[i];
        }
    }

    return min;
}

/**
 * Найти элемент по координатам
 *
 * @param array массив элементов с весами
 * @param position координаты
 * @returns Node узел
 */
function find(array: Node[], position: Position) {
    for (const element of array) {
        if (position.equals(element.position)) {
            return element;
        }
    }
    return null;
}

/**
 * Проверить, содержит ли массив в себе координаты
 *
 * @param array массив координат
 * @param position координаты
 * @returns boolean true, если содержит
 */
function contains(array: Node[], position: Position): boolean {
    for (const element of array) {
        if (position.equals(element.position)) {
            return true;
        }
    }
    return false;
}

function manhattan(position: Position): number {
    return position.x + position.y;
}