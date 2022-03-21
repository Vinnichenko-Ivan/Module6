window.addEventListener("load", function onWindowLoad() {

    //ВАЖНЫЕ ФУНКЦИИ:

    //отрисовать города
    function drawTowns(color, radius) {
        for (let i = 0; i < List.x.length; i++) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 15;
            ctx.beginPath();
            ctx.arc(List.x[i], List.y[i], radius, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.stroke();
        }
    }

    //отрисовать пути
    function drawEdges(width, alpha, i, j, color) {
        ctx.lineWidth = width;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(List.x[i], List.y[i]);
        ctx.lineTo(List.x[j], List.y[j]);
        ctx.stroke();
        ctx.strokeStyle = 'black';
        ctx.globalAlpha = 1;
    }

    //случайное число
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
        //Максимум не включается, минимум включается
    }

    //функция отрисовки
    function redrawing(population, goodEdgesWidth, goodEdgesOpacity, goodEdgesColor, badEdgesWidth, badEdgesOpacity, badEdgesColor) {

    }

    //функция поиска приспособленности хромосомы
    function findPathLength(chromosome, mat) {

    }

    //------------------------------------------------------------------------------------------

    //ВАЖНЫЕ КОНСТАНТЫ
    const otherEdgesOpacity = 0.2;
    const otherEdgesColor = "#aaa";
    const otherEdgesWidth = 2;
    const townRadius = 5;
    const townColor = "black";
    const resultEdgesOpacity = 1;
    const resultEdgesColor = "green";
    const resultEdgesWidth = 4;
    const mainEdgesWidth = 4;
    const mainEdgesColor = "yellow";
    const mainEdgesOpacity = 1;
    const maxNumberOfCities = 50;

    //------------------------------------------------------------------------------------------


    let State = {
        preStart: 1,
        mapBuilding: 0,
        pathFinding: 0,
        next: function () {
            if (State.preStart) {
                State.preStart = 0;
                State.mapBuilding = 1;
                numberOfCities = 0;
                ctx.clearRect(0, 0, MyCanvas.width, MyCanvas.height);
                document.getElementById("towns").textContent = "";
                document.getElementById("mainButton").textContent = "Find Path";
            } else if (State.mapBuilding && List.x.length !== 0) {
                State.mapBuilding = 0;
                State.pathFinding = 1;
                document.getElementById("mainButton").textContent = "Break";


                //------------------------------------------------------------------------------------------
                //ВАЖНЫЕ КОНСТАНТЫ ПО АЛГОРИТМУ

                const NumberOfIterations = 1000;
                const MaxNumberOfWithoutResultIterations = 1000;

                //------------------------------------------------------------------------------------------



                //Создаем матрицу весов
                let mat = new Array(List.x.length);
                for (let i = 0; i < List.x.length; i++) {
                    mat[i] = new Array(List.x.length);
                    for (let j = 0; j < i; j++)
                        mat[i][j] = Math.sqrt(Math.pow(List.x[i] - List.x[j], 2) + Math.pow(List.y[i] - List.y[j], 2))
                    mat[i][i] = -Infinity;
                    for (let j = i + 1; j < List.x.length; j++)
                        mat[i][j] = Math.sqrt(Math.pow(List.x[i] - List.x[j], 2) + Math.pow(List.y[i] - List.y[j], 2))
                }


                //------------------------------------------------------------------------------------------
                //Дальнейшие действия повторяем несколько поколений в setInterval с анимацией
                let it = 0;
                let itOfWithoutResultGenerations = 0;
                let minPathLength = Infinity;

                let id = setInterval(function drawFrame() {
                    it++;
                    itOfWithoutResultGenerations++;

                    if (State.preStart || it > NumberOfIterations || itOfWithoutResultGenerations > MaxNumberOfWithoutResultIterations) {
                        //окончание работы алгоритма

                        State.pathFinding = 0;
                        State.preStart = 1;
                        document.getElementById("mainButton").textContent = "Start";
                        document.getElementById("towns").textContent = "";



                        List.x.splice(0, List.x.length);
                        List.y.splice(0, List.y.length);
                        clearInterval(id);
                    }
                    else {
                        //------------------------------------------------------------------------------------------
                        //САМ АЛГОРИТМ

                        //------------------------------------------------------------------------------------------
                    }
                }, 0);
            }
            else if (State.pathFinding) {
                State.pathFinding = 0;
                State.preStart = 1;
                document.getElementById("mainButton").textContent = "Start";
                document.getElementById("towns").textContent = "";
            }
        }
    }

    let MyCanvas = document.getElementById("myCanvas"),
        ctx = MyCanvas.getContext('2d');

    //создаем массивы с координатами точек
    let List = {
        x: [],
        y: []
    }
    let numberOfCities;

    // переменные для рисования
    ctx.lineCap = "round";

    //обработчик на кнопку
    document.getElementById("mainButton").onclick = function nextState() {
        State.next();
    };

    // На нажатие мыши по canvas будет выполняться эта функция
    MyCanvas.onmousedown = function newTown(e) {
        // в "e"  попадает экземпляр MouseEvent
        let x = e.offsetX;
        let y = e.offsetY;

        // Проверяем на нажатие мыши
        if (e.buttons === 1 && State.mapBuilding && x >= 0 && y >= 0 && x <= MyCanvas.width && y <= MyCanvas.height && numberOfCities < maxNumberOfCities) {
            let flag = 1;
            for (let i = 0; i < List.x.length; i++) {
                if (List.x[i] === x && List.y[i] === y) {
                    flag = 0;
                    break;
                }
            }
            if (flag) {
                numberOfCities++;
                //рисуем город
                ctx.strokeStyle = townColor;
                ctx.lineWidth = 15;
                ctx.beginPath();
                ctx.arc(x, y, townRadius, 0, Math.PI * 2, false);
                ctx.closePath();
                ctx.stroke();

                //рисуем пути
                ctx.lineWidth = otherEdgesWidth;
                for (let i = 0; i < List.x.length; i++) {
                    ctx.globalAlpha = otherEdgesOpacity;
                    ctx.beginPath();
                    ctx.moveTo(List.x[i], List.y[i]);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }

                //выводим на экран координаты
                document.getElementById("towns").textContent += `${List.x.length + 1}:\t${x}\t${y}\n`;

                List.x.push(x);
                List.y.push(y);
            }
        } else if (e.buttons === 1 && State.mapBuilding && x >= 0 && y >= 0 && x <= MyCanvas.width && y <= MyCanvas.height && numberOfCities >= maxNumberOfCities) {
            alert("Максимальное количество городов уже построено");
        }
    };
});