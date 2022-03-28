//https://proglib.io/p/pishem-neyroset-na-python-s-nulya-2020-10-07
function sigmoid(x){
    //return 1 / (1 + Math.exp(-x));
    return Math.max(0, x);
}

function derivSigmoid(x){
    if(x < 0){
        return 0;
    }
    return 1;
    // let fx = sigmoid(x);
    // return fx * (1 - fx);
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
    t1 = 0
    output = 0;
    error = 0;
    weights = [];
    weightsCount = 0;
    input = [];

    b = 0;

    total = 0
    setWeights(weightsCount, weights, b){
        this.weightsCount = weightsCount;
        for(let i = 0; i < weightsCount; i++){
            this.weights.push(weights[i]);
            this.input.push(0);
        }

        //this.b = b;
    }

    result(input){
        //this.input = input;
        let total = 0;
        for(let i = 0; i < this.weightsCount; i++)
        {
            this.input[i] = input[i].output;
            total += this.weights[i] * input[i].output;
        }
        //total += this.b;
        this.total = total
        this.output = sigmoid(total)
        //return sigmoid(total);
    }

}

class NeuronFullNet{
    learningRate = 0.04

    inputLayersSize = 0
    inputLayers = []

    invisibleLayersCount = 0;
    invisibleLayersSize = []
    invisibleLayers = [[]]

    outputLayerSize = 0
    outputLayer = []

    setSizes(inputLayersSize, invisibleLayersCount, invisibleLayersSize, outputLayerSize){
        this.inputLayersSize = inputLayersSize;
        this.invisibleLayersCount = invisibleLayersCount;
        this.invisibleLayersSize = invisibleLayersSize;
        this.outputLayerSize = outputLayerSize;
    }

    genNeurons(){
        this.inputLayers = [];
        this.invisibleLayers = []
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

    softMax(){
        let total = 0
        this.outputLayer.forEach(function (i) {
            total += Math.exp(i.output);
        })
        this.outputLayer.forEach(function (i, index) {
            i.output = Math.exp(i.output)/total;
        })
    }

    crossEntropyForTen(answer){
        let p = [0,0,0,0,0,0,0,0,0,0]
        let q = [0,0,0,0,0,0,0,0,0,0]
        p[answer] = 1;
        for(let i = 0; i < 10; i++){
            q[i] = this.outputLayer[i].output;
        }
        let error = 0;
        for(let i = 0; i < 10; i++){
            error -= p[i] * Math.log(q[i]);
        }
        return error
    }

    countDError(answer){
        let p = [0,0,0,0,0,0,0,0,0,0]
        let q = [0,0,0,0,0,0,0,0,0,0]
        p[answer] = 1;
        for(let i = 0; i < 10; i++){
            q[i] = this.outputLayer[i].output;
        }
        for(let i = 0; i < 10; i++){
            q[i] -= p[i];
        }
        return q;
    }

    doubleError(answer, output){
        return (answer - output);
    }



    out(){
        let answer = 0;
        let answerIni = 0;
        for(let i = 0; i < 10; i++){
            if(this.outputLayer[i].output > answerIni){
                answerIni = this.outputLayer[i].output;
                answer = i;
            }
        }
        return answer;
    }

    setZeroErrors(){
        for(let i = 0; i < this.invisibleLayersCount; i++){
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                this.invisibleLayers[i][j].error = 0;
            }
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].error = 0;
        }
    }

    t1(n, l){
        return n.error * derivSigmoid(n.total);
    }

    newWeight(n, l){
        let t1 = n.error * derivSigmoid(n.total);
        // let temp1 = n.input[l] * derivSigmoid(n.total);
        // let temp2 = n.output * this.learningRate;
        let temp = n.weights[l] - t1 * this.learningRate * n.input[l];
        return temp;
    }

    teach(answer){
        this.setZeroErrors()
        this.softMax()
        let loss = this.crossEntropyForTen(answer)

        let dOutput = this.countDError(answer)

        for(let i = 0; i < 10; i++){
            this.outputLayer[i].error = dOutput[i];
        }



        for(let i = 0; i < 10; i++){
            // let a = derivSigmoid(this.outputLayer[i].total);
            // let temp = derivSigmoid(this.outputLayer[i].total) * dOutput[i];
            //
            // let deltas = []
            //deltas.push(temp *  dOutput[i])
            for(let j = 0; j < this.invisibleLayersSize[this.invisibleLayersCount - 1]; j++){
                let newWeight = this.newWeight(this.outputLayer[i], j);
                this.invisibleLayers[this.invisibleLayersCount - 1][j].error += this.outputLayer[i].weights[j] * this.t1(this.outputLayer[i], j);
                this.outputLayer[i].weights[j] = newWeight;
            }
        }

        for(let i = this.invisibleLayersCount - 1; i > 0; i--){
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                //let temp = derivSigmoid(this.invisibleLayers[i][j].total) * this.invisibleLayers[i][j].error;
                for(let l = 0; l < this.invisibleLayersSize[i - 1]; l++){
                    let newWeight = this.newWeight(this.invisibleLayers[i][j], l);
                    this.invisibleLayers[i - 1][l].error += this.invisibleLayers[i][j].weights[l] * this.t1(this.invisibleLayers[i][j], l)
                    this.invisibleLayers[i][j].weights[l] = newWeight;
                }
            }
        }
        for(let j = 0; j < this.invisibleLayersSize[0]; j++){
            // let temp = derivSigmoid(this.invisibleLayers[0][j].total) * this.invisibleLayers[0][j].error;
            for(let l = 0; l < this.inputLayersSize; l++){
                let newWeight =  this.newWeight(this.invisibleLayers[0][j], l);
                this.invisibleLayers[0][j].weights[l] = newWeight;
            }
        }
        return loss;
    }
}


let inputLayersSize = 25
let invisibleLayersCount = 1
let invisibleLayersSize = [10]
let outputLayerSize = 10

function matrixToLineMatrix(matrix){
    let lineMatrix = []
    for(let i = 0; i < matrix.length; i++){
        for(let j = 0; j < matrix[i].length; j++){
            lineMatrix.push(matrix[i][j]);
        }
    }
    return lineMatrix;
}

let inputs = []
{
    let inputNoLine = []
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 1, 0, 1, 0])
    inputNoLine.push([0, 1, 0, 1, 0])
    inputNoLine.push([0, 1, 0, 1, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    let input = matrixToLineMatrix(inputNoLine)
    inputs.push(input)

    inputNoLine = []
    inputNoLine.push([0, 0, 1, 0, 0])
    inputNoLine.push([0, 0, 1, 0, 0])
    inputNoLine.push([0, 0, 1, 0, 0])
    inputNoLine.push([0, 0, 1, 0, 0])
    inputNoLine.push([0, 0, 1, 0, 0])
    input = matrixToLineMatrix(inputNoLine)
    inputs.push(input)

    inputNoLine = []
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 0, 0, 1, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 1, 0, 0, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    input = matrixToLineMatrix(inputNoLine)
    inputs.push(input)

    inputNoLine = []
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 0, 0, 1, 0])
    inputNoLine.push([0, 0, 1, 1, 0])
    inputNoLine.push([0, 0, 0, 1, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    input = matrixToLineMatrix(inputNoLine)
    inputs.push(input)

    inputNoLine = []
    inputNoLine.push([0, 1, 0, 1, 0])
    inputNoLine.push([0, 1, 0, 1, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 0, 0, 1, 0])
    inputNoLine.push([0, 0, 0, 1, 0])
    input = matrixToLineMatrix(inputNoLine)
    inputs.push(input)

    inputNoLine = []
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 1, 0, 0, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 0, 0, 1, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    input = matrixToLineMatrix(inputNoLine)
    inputs.push(input)

    inputNoLine = []
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 1, 0, 0, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 1, 0, 1, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    input = matrixToLineMatrix(inputNoLine)
    inputs.push(input)

    inputNoLine = []
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 0, 0, 1, 0])
    inputNoLine.push([0, 0, 0, 1, 0])
    inputNoLine.push([0, 0, 0, 1, 0])
    inputNoLine.push([0, 0, 0, 1, 0])
    input = matrixToLineMatrix(inputNoLine)
    inputs.push(input)

    inputNoLine = []
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 1, 0, 1, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 1, 0, 1, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    input = matrixToLineMatrix(inputNoLine)
    inputs.push(input)

    inputNoLine = []
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 1, 0, 1, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    inputNoLine.push([0, 0, 0, 1, 0])
    inputNoLine.push([0, 1, 1, 1, 0])
    input = matrixToLineMatrix(inputNoLine)
    inputs.push(input)
}

let neuroNet = new NeuronFullNet();
neuroNet.setSizes(inputLayersSize, invisibleLayersCount, invisibleLayersSize, outputLayerSize);
neuroNet.genNeurons()
neuroNet.genRandParam()

while(true)
{
    let i = Math.floor(Math.random() * 10);
    neuroNet.setInput(inputs[i])
    neuroNet.genOutput()
    //neuroNet.printOutput()
    let a = "";
    a += i;
    a += " ";
    a += neuroNet.out();
    //console.log(a)
    console.log(neuroNet.teach(i))

}


