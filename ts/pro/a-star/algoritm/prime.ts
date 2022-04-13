import {CellMark, CellState, Field} from "../field";
import {Position} from "../utils";
import {Algorithm, AlgorithmHolder} from "./algorithm";

enum Direction {
    NORTH,
    SOUTH,
    EAST,
    WEST
}

export class PrimeAlgorithm implements Algorithm {

    readonly field: Field;

    constructor(field: Field) {
        this.field = field;
    }

    /**
     * Функция генерации лабиринта с помощью рандомизированного алгоритм Прима
     */
    async run(holder: AlgorithmHolder) {
        // Делаем все клетки стенами
        this.field.fillType(CellState.WALL)

        // Выбираем случайно первую клетку
        let x = ((Math.random() * (this.field.width / 2))|0) * 2 + 1;
        let y = ((Math.random() * (this.field.height / 2))|0) * 2 + 1;
        let position = new Position(x, y);

        // Делаем её пустой
        this.field.setType(position, CellState.EMPTY);

        // Добавляем в очередь соседние клетки
        let queue: Position[] = [];
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

        // Пока очередь не пуста
        while (queue.length && holder.running) {
            // Выбираем случайно клетку из очереди
            let index = (Math.random() * queue.length)|0;
            let position = queue[index];
            queue.splice(index, 1);

            // Делаем её пустой
            this.field.setType(position, CellState.EMPTY);

            // Закрашиваем клетки между предыдущей и текущей
            let directions = [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST];
            while (directions.length) {
                let directionIndex = (Math.random() * directions.length)|0
                switch (directions[directionIndex]) {
                    case Direction.NORTH:
                        if (position.y - 2 >= 0
                            && this.field.getType(position.subY(2)) == CellState.EMPTY) {
                            this.field.setType(position.subY(1), CellState.EMPTY);
                            directions = [];
                        }
                        break;
                    case Direction.SOUTH:
                        if (position.y + 2 < this.field.height
                            && this.field.getType(position.addY(2)) == CellState.EMPTY) {
                            this.field.setType(position.addY(1), CellState.EMPTY);
                            directions = [];
                        }
                        break;
                    case Direction.EAST:
                        if (position.x - 2 >= 0
                            && this.field.getType(position.subX(2)) == CellState.EMPTY) {
                            this.field.setType(position.subX(1), CellState.EMPTY);
                            directions = [];
                        }
                        break;
                    case Direction.WEST:
                        if (position.x + 2 < this.field.width
                            && this.field.getType(position.addX(2)) == CellState.EMPTY) {
                            this.field.setType(position.addX(1), CellState.EMPTY);
                            directions = [];
                        }
                        break;
                }
                directions.splice(directionIndex, 1);
            }

            // Добавляем в очередь соседние клетки
            if (position.y - 2 >= 0
                && this.field.getType(position.subY(2)) == CellState.WALL
                && !contains(queue, position.subY(2))) {
                queue.push(position.subY(2));
            }
            if (position.y + 2 < this.field.height
                && this.field.getType(position.addY(2)) == CellState.WALL
                && !contains(queue, position.addY(2))) {
                queue.push(position.addY(2));
            }
            if (position.x - 2 >= 0
                && this.field.getType(position.subX(2)) == CellState.WALL
                && !contains(queue, position.subX(2))) {
                queue.push(position.subX(2));
            }
            if (position.x + 2 < this.field.width
                && this.field.getType(position.addX(2)) == CellState.WALL
                && !contains(queue, position.addX(2))) {
                queue.push(position.addX(2));
            }

            await holder.delay();
        }

        // Добавляем точки начала и конца
        this.setRandomCell(CellMark.START);
        this.setRandomCell(CellMark.END);
    }

    private setRandomCell(mark: CellMark) {
        let size = this.field.width * this.field.height;
        let random = (Math.random() * size)|0;

        for (let index = random; index !== random - 1; index = (index + 1) % size) {
            let x = index % this.field.height;
            let y = (index / this.field.height)|0;

            if (this.field.getType(new Position(x, y)) == CellState.EMPTY) {
                this.field.setMark(new Position(x, y), mark);
                return;
            }
        }

        let x = random % this.field.height;
        let y = (random / this.field.height)|0;

        this.field.setMark(new Position(x, y), mark);
    }
}


/**
 * Проверить, содержит ли массив в себе координаты
 *
 * @param array массив координат
 * @param position координаты
 * @returns boolean true, если содержит
 */
function contains(array: Position[], position: Position): boolean {
    for (const element of array) {
        if (position.equals(element)) {
            return true;
        }
    }
    return false;
}