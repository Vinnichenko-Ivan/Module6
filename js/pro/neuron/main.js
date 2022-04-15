//https://proglib.io/p/pishem-neyroset-na-python-s-nulya-2020-10-07
let a = 1.6733
let b = 1.0507

/**
 * Лру функция
 * @param x - входное значение
 * @returns {number} - выходное значение
 */
function LRU(x){
    if(x > 0){
        return b * x;
    }
    return a*b*(Math.exp(x) - 1);
}

/**
 * производная Лру функции
 * @param x - входное значение
 * @returns {number} - выходное значение
 */
function derivLRU(x){
    if(x < 0){
        return a * b * Math.exp(x);
    }
    return b;
}

/**
 * Функция генерации рандомного веса
 * @returns {number}
 */
function randParam(){
    return Math.random() / 10;
}

/**
 * Функция генерации списка рандомных весов
 * @param size - размер списка
 * @returns {*[]} - список с рандомными весами
 */
function randParams(size){
    let answer = []
    for(let i = 0; i < size; i++){
        answer.push(randParam());
    }
    return answer;
}

/**
 * класс нейрона
 */
class Neuron{
    output = 0;
    error = 0;
    weights = [];
    weightsCount = 0;
    input = [];
    total = 0

    /**
     * функция задающяя веса нейронам
     * @param weightsCount - количество весов
     * @param weights - сами веса
     * @param b - bias(более не используется)
     */
    setWeights(weightsCount, weights, b){
        this.weightsCount = weightsCount;
        for(let i = 0; i < weightsCount; i++){
            this.weights.push(weights[i]);
            this.input.push(0);
        }
    }

    /**
     * функция высчитывующая выходное значение нейрона
     * @param input - слой нейронов чьим потомком является наш нейрон
     */
    result(input){
        let total = 0;
        for(let i = 0; i < this.weightsCount; i++)
        {
            this.input[i] = input[i].output;
            total += this.weights[i] * input[i].output;
        }
        this.total = total
        this.output = LRU(total)
    }
}

class SaveOBJ{
    invisibleLayers = []
    outputLayer = []
}

class NeuronFullNet{
    learningRate = 0.001

    inputLayersSize = 0
    inputLayers = []

    outputLayerSize = 0
    outputLayer = []

    /**
     * Функция задающая конфигурацию нейросети
     * @param inputLayersSize
     * @param outputLayerSize
     */
    setSizes(inputLayersSize, outputLayerSize){
        this.inputLayersSize = inputLayersSize;
        this.outputLayerSize = outputLayerSize;
    }

    /**
     * Функция генерирующая нейроны
     */
    genNeurons(){
        this.inputLayers = [];
        this.outputLayer = []
        for(let i = 0; i < this.inputLayersSize; i++){
            this.inputLayers.push(new Neuron());
        }
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer.push(new Neuron());
        }
    }

    /**
     * Функция задающая рандомные веса связям в нейросети
     */
    genRandParam(){
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].setWeights(2500, randParams(2500), randParam());
        }
    }

    /**
     * Функция создающая обьект для сохранения весов нейросети
     * @returns {SaveOBJ} обьект с весами
     */
    toSaveObj(){
        let saveObj = new SaveOBJ;
        for(let i = 0; i < this.outputLayerSize; i++){
            saveObj.outputLayer.push(JSON.parse(JSON.stringify(this.outputLayer[i].weights)))
        }
        return saveObj;
    }

    /**
     * Функция загружающяя веса из обьекта
     * @param saveObj - обьект с весами
     */
    fromSaveObj(saveObj) {
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].setWeights(2500, (JSON.parse(JSON.stringify(saveObj.outputLayer[i]))), randParam());
        }
    }

    /**
     * Функция задающая output входному слою.
     * @param input - значения
     */
    setInput(input){
        for(let i = 0; i < this.inputLayersSize; i++){
            this.inputLayers[i].output = input[i];
        }
    }

    /**
     * Функция вычисляющая результат работы нейросети
     */
    genOutput(){
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].result(this.inputLayers);
        }
    }

    /**
     * Тестовая функция печатающая результат работы выходных нейронов
     */
    printOutput(){
        for(let i = 0; i < this.outputLayerSize; i++){
            console.log(this.outputLayer[i].output)
            console.log("\n")
        }
    }

    /**
     * Софтмакс функция. Обрабатывает значения выходных нейронов и приводит их к правильному значению
     */
    softMax(){
        let total = 0
        let maxim = -Infinity
        this.outputLayer.forEach(function (i) {
            maxim = Math.max(maxim,i.output)
        })
        this.outputLayer.forEach(function (i) {
            total += Math.exp(i.output - maxim );
        })
        this.outputLayer.forEach(function (i, index) {
            i.output = Math.exp(i.output - maxim ) / total + 0.000000001;
        })
    }

    /**
     * Функция кросс етропии
     * @param answer правильный ответ
     * @returns {number} значение кросс ентропии
     */
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

    /**
     * Вычисление ошибки выходного слоя
     * @param answer правильный ответ
     * @returns {number[]} массив значений ошибок
     */
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

    /**
     * Тестовая функция вычисления ошибки. Более не используется.
     * @param answer
     * @param output
     * @returns {number}
     */
    doubleError(answer, output){
        return (answer - output);
    }

    /**
     * Функция выдающая итоговый ответ нейросети
     * @returns {number} - ответ
     */
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

    /**
     * Функция обнуляющая ошибку у нейронов
     */
    setZeroErrors(){
        for(let i = 0; i < this.outputLayerSize; i++){
            this.outputLayer[i].error = 0;
        }
    }

    /**
     * Функция вычисляющая t1 нейрона
     * @param n нейрон
     * @param l номер нейрона предыдущего слоя с которым сохраняется связь
     * @returns {number} Значение t1
     */
    t1(n, l){
        return n.error * derivLRU(n.total);
    }

    /**
     * Функция вычисляющая новый вес нейрона
     * @param n нейрон
     * @param l номер нейрона предыдущего слоя с которым сохраняется связь
     * @returns {number} значение нового веса нейрона
     */
    newWeight(n, l){
        let t1 = n.error * derivLRU(n.total);
        let temp = n.weights[l] - t1 * this.learningRate * n.input[l];
        return temp;
    }

    /**
     * Функция обучение нейросети
     * @param answer Верный ответ
     * @returns {number} Ентропия(loss)
     */
    teach(answer){
        this.setZeroErrors()
        this.softMax()
        let loss = this.crossEntropyForTen(answer)

        let dOutput = this.countDError(answer)

        for(let i = 0; i < 10; i++){
            this.outputLayer[i].error = dOutput[i];
        }

        for(let i = 0; i < 10; i++){
            for(let j = 0; j < 2500; j++){
                let newWeight = this.newWeight(this.outputLayer[i], j);
                this.outputLayer[i].weights[j] = newWeight;
            }
        }

        return loss;
    }
}


let inputLayersSize = 2500
let outputLayerSize = 10

/**
 * Преобразование двумерной матрицы в одномерную
 * @param matrix двумерная матрица
 * @returns {*[]} одномерная матрица
 */
function matrixToLineMatrix(matrix){
    let lineMatrix = []
    for(let i = 0; i < matrix.length; i++){
        for(let j = 0; j < matrix[i].length; j++){
            lineMatrix.push(matrix[i][j]);
        }
    }
    return lineMatrix;
}

/**
 * Преобразование одномерной матрицы в двумерную.
 * @param lineMatrix одномерная матрица
 * @param n размер двумерной матрицы
 * @returns {*[]} двумерная матрица
 */
function lineMatrixToMatrix(lineMatrix, n){
    let matrix = new Array(n).fill(new Array(n).fill(0));
    matrix = JSON.parse(JSON.stringify(matrix));
    let max = -Infinity;
    for(let i = 0; i < n; i++)
    {
        for(let j = 0; j < n; j++)
        {
            matrix[i][j] = lineMatrix[i * n + j];
            max = Math.max(max, matrix[i][j]);
        }
    }
    for(let i = 0; i < n; i++)
    {
        for(let j = 0; j < n; j++)
        {
            matrix[i][j] /= max;
        }
    }
    return matrix;
}

let neuroNet = new NeuronFullNet();
neuroNet.setSizes(inputLayersSize, outputLayerSize);
neuroNet.genNeurons()
// neuroNet.genRandParam()

neuroNet.fromSaveObj(JSON.parse(oldKF))

const iter = document.getElementById('iter');
const clearButton = document.getElementById('clear');
const run = document.getElementById('run');
const canvas = document.getElementById('drawer');
const context = canvas.getContext('2d');
const addButton = document.getElementById('add');
const saveButton = document.getElementById('save');
const saveKButton = document.getElementById('saveK');
const answerInput = document.getElementById('answerInput');
const answer = document.getElementById('answer');
const getButton = document.getElementById('get');
const form = document.getElementById('getter');

const canvasLetter0 = document.getElementById('letter0');
const contextLetter0 = canvasLetter0.getContext('2d');

const canvasLetter1 = document.getElementById('letter1');
const contextLetter1 = canvasLetter1.getContext('2d');

const canvasLetter2 = document.getElementById('letter2');
const contextLetter2 = canvasLetter2.getContext('2d');

const canvasLetter3 = document.getElementById('letter3');
const contextLetter3 = canvasLetter3.getContext('2d');

const canvasLetter4 = document.getElementById('letter4');
const contextLetter4 = canvasLetter4.getContext('2d');

const canvasLetter5 = document.getElementById('letter5');
const contextLetter5 = canvasLetter5.getContext('2d');

const canvasLetter6 = document.getElementById('letter6');
const contextLetter6 = canvasLetter6.getContext('2d');

const canvasLetter7 = document.getElementById('letter7');
const contextLetter7 = canvasLetter7.getContext('2d');

const canvasLetter8 = document.getElementById('letter8');
const contextLetter8 = canvasLetter8.getContext('2d');

const canvasLetter9 = document.getElementById('letter9');
const contextLetter9 = canvasLetter9.getContext('2d');

drawNeuron(neuroNet.outputLayer[0], contextLetter0, 50);
drawNeuron(neuroNet.outputLayer[1], contextLetter1, 50);
drawNeuron(neuroNet.outputLayer[2], contextLetter2, 50);
drawNeuron(neuroNet.outputLayer[3], contextLetter3, 50);
drawNeuron(neuroNet.outputLayer[4], contextLetter4, 50);
drawNeuron(neuroNet.outputLayer[5], contextLetter5, 50);
drawNeuron(neuroNet.outputLayer[6], contextLetter6, 50);
drawNeuron(neuroNet.outputLayer[7], contextLetter7, 50);
drawNeuron(neuroNet.outputLayer[8], contextLetter8, 50);
drawNeuron(neuroNet.outputLayer[9], contextLetter9, 50);

let weightCanvas = canvas.width;
let heightCanvas = canvas.height;
let weightCount = 50
let heightCount = 50

let inputNoLine =  new Array(heightCount).fill(0).map( () => new Array(weightCount).fill(0))

class Test{
    input
    answer = 0
}

let tests = []

/**
 * Функция отрисовки связей для наглядности работы.
 * @param neuron нейрон
 * @param context контент для рисования
 * @param n размер двумерной матрицы связей
 */
function drawNeuron(neuron, context, n){
    context.clearRect(0, 0, n, n)
    let input = lineMatrixToMatrix(neuron.weights, n)
    let dx = 1;
    let dy = 1;
    for(let i = 0; i < n; i++){
        for(let j = 0; j < n; j++){
            let temp = input[i][j] * 255;
            if(input[i][j] > 0) {
                context.fillStyle = 'rgb(' + temp + "," + 0 + "," + 0 + ")";
            }
            if(input[i][j] < 0) {
                context.fillStyle = 'rgb(' + 0 + "," + 0 + "," + -temp + ")";
            }
            context.fillRect(dx * j, dy * i , dx, dy);
        }
    }
}

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
            let temp = inputNoLine[i][j] * 255;

            context.fillStyle = 'rgb(' + temp + "," + temp + "," + temp + ")";
            context.fillRect(dx * j,dy * i , dx, dy);

        }
    }

}

canvas.onmousemove = function drawIfPressed (event) {
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
                    inputNoLine[j][i] = Math.min(inputNoLine[j][i] + 0.2, 1);
                }
                if(Math.abs((sx + ex) / 2 - x) < 15 && Math.abs((sy + ey) / 2 - y) < 15){
                    inputNoLine[j][i] = Math.min(inputNoLine[j][i] + 0.2, 1);
                }
                if(Math.abs((sx + ex) / 2 - x) < 25 && Math.abs((sy + ey) / 2 - y) < 25){
                    inputNoLine[j][i] = Math.min(inputNoLine[j][i] + 0.2, 1);
                }
            }
        }
    }
    if (event.buttons === 4){
        for(let i = 0; i < heightCount; i++){
            for(let j = 0; j < weightCount; j++){
                let sx = dx * i;
                let ex = dx * i + dx;
                let sy = dy * j;
                let ey = dy * j + dy;

                if(sx < x && ex > x && sy < y && ey > y) {
                    inputNoLine[j][i] = Math.max(inputNoLine[j][i] - 0.2, 0);
                }
                if(Math.abs((sx + ex) / 2 - x) < 15 && Math.abs((sy + ey) / 2 - y) < 15){
                    inputNoLine[j][i] = Math.max(inputNoLine[j][i] - 0.2, 0);
                }
                if(Math.abs((sx + ex) / 2 - x) < 25 && Math.abs((sy + ey) / 2 - y) < 25){
                    inputNoLine[j][i] = Math.max(inputNoLine[j][i] - 0.2, 0);
                }
            }
        }
    }
};

addButton.addEventListener('click', function() {
    let temp = new Test;
    temp.input =  JSON.parse(JSON.stringify(inputNoLine))
    temp.answer = answerInput.value;
    tests.push(temp)
});

clearButton.addEventListener('click', function() {
    inputNoLine =  new Array(heightCount).fill(0).map( () => new Array(weightCount).fill(0))
});

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

saveKButton.addEventListener('click', function() {
    download( JSON.stringify(neuroNet.toSaveObj()), 'json.txt', 'text/plain');
});

saveButton.addEventListener('click', function() {
    download( JSON.stringify(tests), 'json.txt', 'text/plain');
});

iter.addEventListener('click', function() {
    neuroNet.setInput(matrixToLineMatrix(inputNoLine))
    neuroNet.genOutput()
    let a = neuroNet.out();
    answer.innerHTML = a;
    console.log(a);
});

getButton.addEventListener('click', function() {

    var data = require(form.value);
    tests = JSON.parse(data)
});

let all = 0;
let good = 0;
run.addEventListener('click', function() {
    for(let e = 0; e < 1000; e++)
    {
        all ++;
        let i = Math.floor(Math.random() * tests.length);
        neuroNet.setInput(matrixToLineMatrix(tests[i].input))
        neuroNet.genOutput()
        let a = "";
        a += i;
        a += " ";
        a += neuroNet.out();
        if(tests[i].answer === neuroNet.out()){
            good ++;
        }
        console.log("--------")
        console.log(good / all)
        console.log(neuroNet.teach(Number(tests[i].answer)))

    }
    drawNeuron(neuroNet.outputLayer[0], contextLetter0, 50);
    drawNeuron(neuroNet.outputLayer[1], contextLetter1, 50);
    drawNeuron(neuroNet.outputLayer[2], contextLetter2, 50);
    drawNeuron(neuroNet.outputLayer[3], contextLetter3, 50);
    drawNeuron(neuroNet.outputLayer[4], contextLetter4, 50);
    drawNeuron(neuroNet.outputLayer[5], contextLetter5, 50);
    drawNeuron(neuroNet.outputLayer[6], contextLetter6, 50);
    drawNeuron(neuroNet.outputLayer[7], contextLetter7, 50);
    drawNeuron(neuroNet.outputLayer[8], contextLetter8, 50);
    drawNeuron(neuroNet.outputLayer[9], contextLetter9, 50);
});


form.addEventListener("change", handleFiles, false);
function handleFiles() {
    const fileList = this.files;
    let reader = new FileReader();
    reader.onload = function(e) {
        console.log( e.target.result) ;
        tests = JSON.parse(e.target.result);
    };
    reader.readAsText(fileList[0]);
    console.log(reader.result)

    console.log(fileList[0][3])

}
requestAnimationFrame(loop);

