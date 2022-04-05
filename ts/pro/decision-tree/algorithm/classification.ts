import {Algorithm, AlgorithmHolder} from "./algorithm";
import {Dataset} from "../csv/csv";

export class ClassificationAlgorithm implements Algorithm {

    private readonly testDataset: Dataset;

    constructor(dataset: Dataset) {
        this.testDataset = dataset;
    }

    async run(holder: AlgorithmHolder): Promise<any> {
        throw Error('Not implemented'); // TODO
    }
}