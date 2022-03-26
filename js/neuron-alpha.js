//https://proglib.io/p/pishem-neyroset-na-python-s-nulya-2020-10-07
function sigmoid(x){
    return 1 / (1 + Math.exp(-x));
}

function randParam(){
    return Math.random();
}

function randParams(size){
    let answer = []
    for(let i = 0; i < size; i++){
        answer.push(randParam());
    }
    return answer;
}

class Neuron{
    weightsCount = 0
    weights = []
    b = 0
    output = 0
    setWeights(weightsCount, weights, b){
        this.weightsCount = weightsCount;
        this.weights = weights;
        this.b = b;
    }

    result(input){
        let total = 0
        for(let i = 0; i < this.weightsSize; i++)
        {
            total += this.weights[i] + input[i];
        }
        total += this.b;
        this.output = sigmoid(total)
        //return sigmoid(total);
    }

}

class NeuronFullNet{
    inputSliceSize = 0
    inputSlice = []

    invisibleLayersCount = 0;
    invisibleLayersSize = []
    invisibleLayers = [[]]

    outputLayerSize = 0
    outputLayer = []

    setSizes(inputSliceSize, invisibleLayersCount, invisibleLayersSize, outputLayerSize){
        this.inputSliceSize = inputSliceSize;
        this.invisibleLayersCount = invisibleLayersCount;
        this.invisibleLayersSize = invisibleLayersSize;
        this.outputLayerSize = outputLayerSize;
    }

    genNeurons(){
        this.inputSlice = [];
        this.invisibleLayers = [[]]
        this.outputLayer = []
        for(let i = 0; i < this.inputSliceSize; i++){
            this.inputSlice.push(new Neuron);
        }
        for(let i = 0; i < this.invisibleLayersCount; i++){
            this.invisibleLayers.push([]);
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                this.invisibleLayers[i].push(new Neuron);
            }
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer.push(new Neuron);
        }
    }

    genRandParam(){
        for(let i = 0; i < this.inputSliceSize; i++){

        }
        for(let i = 0; i < this.invisibleLayersCount; i++){
            this.invisibleLayers.push([]);
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                if(i === 0) {
                    this.invisibleLayers[i][j].setWeights(this.inputSliceSize, randParams(this.inputSliceSize), randParam());
                }
                else{
                    this.invisibleLayers[i][j].setWeights(this.invisibleLayersSize[i - 1], randParams(this.invisibleLayersSize[i - 1]), randParam());
                }
            }
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].setWeights(this.invisibleLayersSize[this.invisibleLayersCount - 1], randParams(this.invisibleLayersSize[this.invisibleLayersCount - 1]), randParam());
        }
    }
}


