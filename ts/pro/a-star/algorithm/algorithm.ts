/**
 * @author Аникушин Роман
 */
export interface Algorithm {

    run(holder: AlgorithmHolder): Promise<any>;

}

/**
 * @author Аникушин Роман
 */
export class AlgorithmHolder {

    private _algorithm: Algorithm;

    private _iterationDelay: number;

    private _isRunning: boolean = false;

    private _isCompleted: boolean = false;

    private _promise: Promise<any>;

    constructor(iterationDelay?: number) {
        this._iterationDelay = iterationDelay == undefined ? 0 : iterationDelay;
    }

    get running(): boolean {
        return this._isRunning;
    }

    get iterationDelay(): number {
        return this._iterationDelay;
    }

    set iterationDelay(delay: number) {
        this._iterationDelay = delay;
    }

    get algorithm() {
        return this._algorithm;
    }

    set algorithm(algorithm: Algorithm) {
        this._algorithm = algorithm;
    }

    async start(): Promise<any> {
        this._isRunning = true;
        this._isCompleted = false;
        this._promise = this.algorithm.run(this);
        let result = await this._promise;
        this.complete();
        return result;
    }

    async stop() {
        this._isRunning = false;
        await this._promise;
    }

    delay(): Promise<any> {
        return new Promise(resolve => {
            if (this.running) {
                setTimeout(resolve, this._iterationDelay)
            }
        })
    }

    private complete() {
        this._isRunning = false;
        this._isCompleted = true;
    }
}