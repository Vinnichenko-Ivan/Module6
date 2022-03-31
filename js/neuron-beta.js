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
        let maxim = - 100000000000000
        this.outputLayer.forEach(function (i) {
            maxim = Math.max(maxim,i.output)
        })
        this.outputLayer.forEach(function (i) {
            total += Math.exp(i.output - maxim );
        })
        this.outputLayer.forEach(function (i, index) {
            i.output = Math.exp(i.output - maxim )/total;
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
            for(let j = 0; j < this.invisibleLayersSize[this.invisibleLayersCount - 1]; j++){
                let newWeight = this.newWeight(this.outputLayer[i], j);
                this.invisibleLayers[this.invisibleLayersCount - 1][j].error += this.outputLayer[i].weights[j] * this.t1(this.outputLayer[i], j);
                this.outputLayer[i].weights[j] = newWeight;
            }
        }

        for(let i = this.invisibleLayersCount - 1; i > 0; i--){
            for(let j = 0; j < this.invisibleLayersSize[i]; j++){
                for(let l = 0; l < this.invisibleLayersSize[i - 1]; l++){
                    let newWeight = this.newWeight(this.invisibleLayers[i][j], l);
                    this.invisibleLayers[i - 1][l].error += this.invisibleLayers[i][j].weights[l] * this.t1(this.invisibleLayers[i][j], l)
                    this.invisibleLayers[i][j].weights[l] = newWeight;
                }
            }
        }
        for(let j = 0; j < this.invisibleLayersSize[0]; j++){
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
let invisibleLayersSize = [25]
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



const run = document.getElementById('run');
const canvas = document.getElementById('drawer');
const context = canvas.getContext('2d');
const addButton = document.getElementById('add')
const saveButton = document.getElementById('save')
const answerInput = document.getElementById('answerInput');
const getButton = document.getElementById('get');
const form = document.getElementById('getter');

let weightCanvas = canvas.width;
let heightCanvas = canvas.height;
let weightCount = 5
let heightCount = 5

let inputNoLine = []
inputNoLine.push([1, 1, 1, 0, 1])
inputNoLine.push([1, 1, 0, 0, 0])
inputNoLine.push([0, 0, 1, 0, 0])
inputNoLine.push([0, 0, 0, 1, 0])
inputNoLine.push([0, 0, 0, 0, 1])

function drawLine(x1, y1, x2, y2){
    context.strokeStyle = 'white'
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

class Test{
    input
    answer = 0
}

let tests = []

function loop() {
    requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height)
    let dx = weightCanvas / weightCount;
    let dy = heightCanvas / heightCount;
    for(let i = 0; i < weightCount; i++){
        drawLine(dx * i, 0, dx * i, heightCanvas);
    }
    for(let j = 0; j < heightCount; j++){
        drawLine(0, j * dy, weightCanvas, j * dy);
    }
    for(let i = 0; i < weightCount; i++){
        for(let j = 0; j < heightCount; j++){
            if(inputNoLine[i][j] === 1) {
                context.fillStyle = 'white';
                context.fillRect(dx * j,dy * i , dx, dy);
            }
        }
    }
}

canvas.addEventListener('mousedown', function (event) {
    let x = event.x - this.offsetLeft;
    let y = event.y - this.offsetTop;
    let dx = weightCanvas / weightCount;
    let dy = heightCanvas / heightCount;
    if (event.buttons === 1){
        for(let i = 0; i < heightCount; i++){
            for(let j = 0; j < weightCount; j++){
                let sx = dx * i;
                let ex = dx * i + dx;
                let sy = dy * j;
                let ey = dy * j + dy;
                if(sx < x && ex > x && sy < y && ey > y) {
                    if(inputNoLine[j][i] === 1){
                        inputNoLine[j][i] = 0;
                    }
                    else{
                        inputNoLine[j][i] = 1;
                    }
                }
            }
        }
    }

    neuroNet.setInput(matrixToLineMatrix(inputNoLine))
    neuroNet.genOutput()
    console.log(neuroNet.out());

});

addButton.addEventListener('click', function() {
    let temp = new Test;
    temp.input =  JSON.parse(JSON.stringify(inputNoLine))
    temp.answer = answerInput.value;
    tests.push(temp)
});

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}


saveButton.addEventListener('click', function() {
    download( JSON.stringify(tests), 'json.txt', 'text/plain');
});

getButton.addEventListener('click', function() {

    var data = require(form.value);
    tests = JSON.parse(data)
});


run.addEventListener('click', function() {
    for(let e = 0; e < 10000; e++)
    {
        let i = Math.floor(Math.random() * tests.length);
        neuroNet.setInput(matrixToLineMatrix(tests[i].input))
        neuroNet.genOutput()
        //neuroNet.printOutput()
        let a = "";
        a += i;
        a += " ";
        a += neuroNet.out();
        //console.log(a)
        console.log(neuroNet.teach(Number(tests[i].answer)))

    }
});


form.addEventListener("change", handleFiles, false);
function handleFiles() {
    const fileList = this.files;
    let reader = new FileReader();
    // reader.readAsDataURL(file);
    reader.onload = function(e) {
        console.log( e.target.result) ;
        tests = JSON.parse(e.target.result);
    };
    reader.readAsText(fileList[0]);
    console.log(reader.result)

    console.log(fileList[0][3])

}
requestAnimationFrame(loop);

