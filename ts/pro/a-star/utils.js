define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Position = void 0;
    class Position {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        add(x, y) {
            return new Position(this.x + x, this.y + y);
        }
        addX(x) {
            return new Position(this.x + x, this.y);
        }
        addY(y) {
            return new Position(this.x, this.y + y);
        }
        sub(x, y) {
            return new Position(this.x - x, this.y - y);
        }
        subX(x) {
            return new Position(this.x - x, this.y);
        }
        subY(y) {
            return new Position(this.x, this.y - y);
        }
        abs() {
            return new Position(Math.abs(this.x), Math.abs(this.y));
        }
        equals(other) {
            if (other instanceof Position) {
                return other.x == this.x && other.y == this.y;
            }
            return false;
        }
    }
    exports.Position = Position;
});
//# sourceMappingURL=utils.js.map