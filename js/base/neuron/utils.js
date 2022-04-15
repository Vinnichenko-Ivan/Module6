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

/**
 * Функция рисовки линии
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param context
 */
function drawLine(x1, y1, x2, y2, context){
    context.strokeStyle = 'white'
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

/**
 * Промежуточный класс потребный для загрузки и выгрузки коффициентов из нейросети.
 */

class SaveOBJ{
    invisibleLayers = []
    outputLayer = []
}

/**
 * Класс теста
 */

class Test{
    input
    answer = 0
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