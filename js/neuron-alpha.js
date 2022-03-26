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
        for(let i = 0; i < this.weightsCount; i++)
        {
            total += this.weights[i] + input[i].output;
        }
        total += this.b;
        this.output = sigmoid(total)
        //return sigmoid(total);
    }

}

class NeuronFullNet{

    inputLayersSize = 0
    inputLayers = []

    invisibleLayersCount = 0;
    invisibleLayersSize = []
    invisibleLayers = [[]]

    outputLayerSize = 0
    outputLayer = []

    setSizes(inputLayersSize, invisibleLayersCount, invisibleLayersSize, outputLayerSize){
        this.inputLayerseSize = inputLayersSize;
        this.invisibleLayersCount = invisibleLayersCount;
        this.invisibleLayersSize = invisibleLayersSize;
        this.outputLayerSize = outputLayerSize;
    }

    genNeurons(){
        this.inputLayers = [];
        this.invisibleLayers = [[]]
        this.outputLayer = []
        for(let i = 0; i < this.inputLayersSize; i++){
            this.inputLayers.push(new Neuron());
        }
        for(let i = 0; i < this.invisibleLayersCount; i++){
            this.invisibleLayers.push([]);
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                this.invisibleLayers[i].push(new Neuron());
            }
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer.push(new Neuron());
        }
    }

    genRandParam(){
        for(let i = 0; i < this.invisibleLayersCount; i++){
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                if(i === 0) {
                    this.invisibleLayers[i][j].setWeights(this.inputLayersSize, randParams(this.inputLayersSize), randParam());
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

    setInput(input){
        for(let i = 0; i < this.inputLayersSize; i++){
            this.inputLayers[i].output = input[i];
        }
    }

    genOutput(){
        for(let i = 0; i < this.invisibleLayersCount; i++){
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                if(i === 0) {
                    this.invisibleLayers[i][j].result(this.inputLayers);
                }
                else{
                    this.invisibleLayers[i][j].result(this.invisibleLayers[i - 1]);
                }
            }
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].result(this.invisibleLayers[this.invisibleLayersCount - 1]);
        }
    }

    printOutput(){
        for(let i = 0; i < this.outputLayerSize; i++){
            console.log(this.outputLayer[i].output)
            console.log("\n")
        }
    }
}


let inputLayersSize = 25
let invisibleLayersCount = 5
let invisibleLayersSize = [25, 25, 25, 25, 25]
let outputLayerSize = 10

input = [0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0]

let neuroNet = new NeuronFullNet();
neuroNet.setSizes(inputLayersSize, invisibleLayersCount, invisibleLayersSize, outputLayerSize);
neuroNet.genNeurons()
neuroNet.genRandParam()
neuroNet.setInput(input)
neuroNet.genOutput()
neuroNet.printOutput()



