var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AlgorithmHolder = void 0;
    class AlgorithmHolder {
        constructor(iterationDelay) {
            this._isRunning = false;
            this._isCompleted = false;
            this._iterationDelay = iterationDelay == undefined ? 0 : iterationDelay;
        }
        get running() {
            return this._isRunning;
        }
        get iterationDelay() {
            return this._iterationDelay;
        }
        set iterationDelay(delay) {
            this._iterationDelay = delay;
        }
        get algorithm() {
            return this._algorithm;
        }
        set algorithm(algorithm) {
            this._algorithm = algorithm;
        }
        start() {
            return __awaiter(this, void 0, void 0, function* () {
                this._isRunning = true;
                this._isCompleted = false;
                this._promise = this.algorithm.run(this);
                let result = yield this._promise;
                this.complete();
                return result;
            });
        }
        stop() {
            return __awaiter(this, void 0, void 0, function* () {
                this._isRunning = false;
                yield this._promise;
            });
        }
        delay() {
            return new Promise(resolve => {
                if (this.running) {
                    setTimeout(resolve, this._iterationDelay);
                }
            });
        }
        complete() {
            this._isRunning = false;
            this._isCompleted = true;
        }
    }
    exports.AlgorithmHolder = AlgorithmHolder;
});
//# sourceMappingURL=algorithm.js.map