/**
 * Класс 2D позиции
 * @author Аникушин Роман
 */
export class Position {

    readonly x: number;

    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(x: number, y: number): Position {
        return new Position(this.x + x, this.y + y);
    }

    addX(x: number): Position {
        return new Position(this.x + x, this.y);
    }

    addY(y: number): Position {
        return new Position(this.x, this.y + y);
    }

    sub(x: number, y: number): Position {
        return new Position(this.x - x, this.y - y);
    }

    subX(x: number): Position {
        return new Position(this.x - x, this.y);
    }

    subY(y: number): Position {
        return new Position(this.x, this.y - y);
    }

    abs(): Position {
        return new Position(Math.abs(this.x), Math.abs(this.y));
    }

    equals(other: any): boolean {
        if (other instanceof Position) {
            return other.x == this.x && other.y == this.y;
        }
        return false;
    }
}
