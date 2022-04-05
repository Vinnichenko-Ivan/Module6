import {Algorithm, AlgorithmHolder} from "./algorithm";
import {Dataset} from "../csv/csv";
import {Id3Tree} from "../classifier/classifier-id3";

export class BuildTreeID3Algorithm implements Algorithm {

    private readonly learnDataset: Dataset;

    constructor(learnDataset: Dataset) {
        this.learnDataset = learnDataset;
    }

    async run(holder: AlgorithmHolder): Promise<Id3Tree> {
        throw Error('Not implemented'); // TODO
    }
}