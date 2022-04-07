window.addEventListener("load", function onWindowLoad() {

    let MyCanvas = document.getElementById("myCanvas"),
        ctx = MyCanvas.getContext('2d');


    //ВАЖНЫЕ ФУНКЦИИ:

    //отрисовать города
    function drawTowns(color, radius) {
        for (let i = 0; i < List.x.length; i++) {
            ctx.lineCap = "round";
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
    function redrawing(minPath, goodEdgesWidth, goodEdgesOpacity, goodEdgesColor, badEdgesWidth, badEdgesOpacity, badEdgesColor) {
        ctx.clearRect(0, 0, MyCanvas.width, MyCanvas.height);

        drawTowns(townColor, townRadius);

        //рисуем пути, создав сначала матрицу с цветами ребер
        let edgeColor = new Array(List.x.length);
        for (let i = 0; i < List.x.length; i++)
            edgeColor[i] = new Array(List.x.length)

        edgeColor[minPath[0]][minPath[minPath.length-1]] = "1";
        edgeColor[minPath[minPath.length-1]][minPath[0]] = "1";
        for (let i = 0; i < minPath.length - 1; i++)
            edgeColor[Math.min(minPath[i], minPath[i + 1])][Math.max(minPath[i], minPath[i + 1])] = "1";

        for (let i = 0; i < List.x.length; i++) {
            for (let j = i + 1; j < List.x.length; j++) {
                if (edgeColor[i][j] === "1")
                    drawEdges(goodEdgesWidth, goodEdgesOpacity, i, j, goodEdgesColor);
                else
                    drawEdges(badEdgesWidth, badEdgesOpacity, i, j, badEdgesColor);
            }
        }
    }

    //------------------------------------------------------------------------------------------

    //ВАЖНЫЕ КОНСТАНТЫ
    let otherEdgesOpacity = 0.15;
    let otherEdgesColor = "#999";
    let otherEdgesWidth = 2;
    let townRadius = 7;
    let townColor = "black";
    let resultEdgesOpacity = 1;
    let resultEdgesColor = "green";
    let resultEdgesWidth = 4;
    let mainEdgesWidth = 4;
    let mainEdgesColor = "yellow";
    let mainEdgesOpacity = 1;
    let maxNumberOfCities = 50;

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
                document.getElementById("mainButton").textContent = "Найти путь";
                vertexNumberOutput.textContent = "Вершины";
                bestPathOutput.textContent = "Длина";
                iterationOutput.textContent = "Итерация";
            } else if (State.mapBuilding && List.x.length !== 0) {
                State.mapBuilding = 0;
                State.pathFinding = 1;
                document.getElementById("mainButton").textContent = "Прервать";


                //------------------------------------------------------------------------------------------
                //ВАЖНЫЕ КОНСТАНТЫ ПО АЛГОРИТМУ

                const NumberOfIterations = 10000;//максимальное количество итераций
                const MaxNumberOfWithoutResultIterations = Math.min(Math.pow(List.x.length, 1), 200);//максимальное количество бессмысленных итераций

                const NumberOfAnts = Math.min(Math.pow(List.x.length, 2), 1000);//количество муравьев
                const InitialNumberOfPheromones = 0.2;//начальное кол-во феромонов

                const Alfa = 1;//показатель степени феромонов
                const Beta = 1.5;//показатель степени длины маршрута

                const PathLengthConst = 10;//эту константу делим на расстояние между городами
                const PheromoneConst = 10;//эту константу делим на длину дороги между городами и прибавляем столько феромонов на данную дорогу
                const RemainingPheromones = 0.6;//какая часть феромонов остается после испарения

                //------------------------------------------------------------------------------------------


                //Матрица весов с длиной маршрутов
                let lengthMatrix = new Array(List.x.length);
                for (let i = 0; i < List.x.length; i++) {
                    lengthMatrix[i] = new Array(List.x.length);
                    for (let j = 0; j < i; j++)
                        lengthMatrix[i][j] = Math.sqrt(Math.pow(List.x[i] - List.x[j], 2) + Math.pow(List.y[i] - List.y[j], 2))
                    lengthMatrix[i][i] = -Infinity;
                    for (let j = i + 1; j < List.x.length; j++)
                        lengthMatrix[i][j] = Math.sqrt(Math.pow(List.x[i] - List.x[j], 2) + Math.pow(List.y[i] - List.y[j], 2))
                }

                //Матрица весов с количеством феромонов на путях
                let pheromoneMatrix = new Array(List.x.length);
                for (let i = 0; i < List.x.length; i++) {
                    pheromoneMatrix[i] = new Array(List.x.length);
                    for (let j = 0; j < List.x.length; j++)
                        pheromoneMatrix[i][j] = InitialNumberOfPheromones;
                }

                //Матрица, в которой будут храниться новые феромоны
                let extraPheromones = new Array(List.x.length);
                for (let i = 0; i < List.x.length; i++) {
                    extraPheromones[i] = new Array(List.x.length);
                    for(let j = 0; j < List.x.length; j++)
                        extraPheromones[i][j] = 0;
                }


                //------------------------------------------------------------------------------------------
                //Дальнейшие действия повторяем несколько поколений в setInterval с анимацией
                let it = 0;
                let itOfWithoutResultGenerations = 0;
                let minPathLength = Infinity;
                let newMinPathLength;
                let minPath;
                let newMinPath;

                let id = setInterval(function drawFrame() {
                    it++;
                    itOfWithoutResultGenerations++;
                    newMinPathLength = Infinity;

                    if (State.preStart || it > NumberOfIterations || itOfWithoutResultGenerations > MaxNumberOfWithoutResultIterations) {
                        //окончание работы алгоритма

                        State.pathFinding = 0;
                        State.preStart = 1;
                        document.getElementById("mainButton").textContent = "Начать";

                        redrawing(minPath, resultEdgesWidth, resultEdgesOpacity, resultEdgesColor, otherEdgesWidth, otherEdgesOpacity, otherEdgesColor);

                        List.x.splice(0, List.x.length);
                        List.y.splice(0, List.y.length);
                        clearInterval(id);
                    } else {
                        //------------------------------------------------------------------------------------------
                        //******************************************************************************************
                        //САМ АЛГОРИТМ

                        //Обнуляем муравьев
                        let unvisitedCitiesArray = [];
                        for (let i = 0; i < List.x.length; i++)
                            unvisitedCitiesArray.push(i);
                        let ants = [];
                        for (let i = 0; i < NumberOfAnts; i++)
                            ants.push({
                                path: [],
                                pathLength: 0,
                                unvisitedCities: unvisitedCitiesArray.slice(0, unvisitedCitiesArray.length)
                            });

                        //обнуляем матрицу с добавочными феромонами
                        for(let i1 = 0; i1 < extraPheromones.length; i1++)
                            for(let i2 = 0; i2 < extraPheromones.length; i2++)
                                extraPheromones[i1][i2] = 0;

                        newMinPathLength = Infinity;

                        //Каждый муравей делает один проход
                        for (let i = 0; i < ants.length; i++) {
                            //начало пути
                            ants[i].path.push(getRandomInt(0, ants[i].unvisitedCities.length));
                            ants[i].unvisitedCities.splice(ants[i].unvisitedCities.indexOf(ants[i].path[0]), 1);

                            //сам путь
                            while (ants[i].unvisitedCities.length > 0) {
                                let probabilities = [];
                                let probability;
                                let probabilitySum = 0;
                                for (let j = 0; j < ants[i].unvisitedCities.length; j++) {
                                    probability = Math.pow(pheromoneMatrix[ants[i].path[ants[i].path.length - 1]][ants[i].unvisitedCities[j]], Alfa);
                                    probability *= Math.pow(PathLengthConst / lengthMatrix[ants[i].path[ants[i].path.length - 1]][ants[i].unvisitedCities[j]], Beta);
                                    probabilitySum += probability;
                                    probabilities.push(probability);
                                }
                                for (let j = 0; j < probabilities.length; j++)
                                    probabilities[j] /= probabilitySum;
                                for (let j = 1; j < probabilities.length; j++)
                                    probabilities[j] += probabilities[j - 1];

                                let r = Math.random();
                                let selectedTown;
                                for (let j = 0; j < probabilities.length; j++) {
                                    if (probabilities[j] > r) {
                                        selectedTown = ants[i].unvisitedCities[j];
                                        break;
                                    }
                                }

                                extraPheromones[ants[i].path[ants[i].path.length - 1]][selectedTown] += PheromoneConst/lengthMatrix[ants[i].path[ants[i].path.length - 1]][selectedTown];
                                extraPheromones[selectedTown][ants[i].path[ants[i].path.length - 1]] += PheromoneConst/lengthMatrix[ants[i].path[ants[i].path.length - 1]][selectedTown];
                                ants[i].pathLength += lengthMatrix[ants[i].path[ants[i].path.length - 1]][selectedTown];
                                ants[i].path.push(selectedTown);
                                ants[i].unvisitedCities.splice(ants[i].unvisitedCities.indexOf(selectedTown), 1);
                            }

                            //возвращение в начало
                            extraPheromones[ants[i].path[ants[i].path.length - 1]][ants[i].path[0]] += PheromoneConst/lengthMatrix[ants[i].path[ants[i].path.length - 1]][ants[i].path[0]];
                            extraPheromones[ants[i].path[0]][ants[i].path[ants[i].path.length - 1]] += PheromoneConst/lengthMatrix[ants[i].path[ants[i].path.length - 1]][ants[i].path[0]];
                            ants[i].pathLength += lengthMatrix[ants[i].path[ants[i].path.length - 1]][ants[i].path[0]];
                            ants[i].path.push(ants[i].path[0]);

                            if(ants[i].pathLength < newMinPathLength) {
                                newMinPathLength = ants[i].pathLength;
                                newMinPath = ants[i].path.slice(0, ants[i].path.length);
                            }
                        }

                        //Испаряем старые феромоны и добавляем новые
                        for(let i = 0; i < pheromoneMatrix.length; i++)
                            for(let j = 0; j < pheromoneMatrix.length; j++)
                                pheromoneMatrix[i][j] = pheromoneMatrix[i][j]*RemainingPheromones+extraPheromones[i][j];

                        //Рисуем, если нашелся хороший маршрут
                        if(newMinPathLength < minPathLength)
                        {
                            itOfWithoutResultGenerations = 0;
                            minPathLength = newMinPathLength;
                            minPath = newMinPath.slice(0, newMinPath.length);
                            redrawing(newMinPath, mainEdgesWidth, mainEdgesOpacity, mainEdgesColor, otherEdgesWidth, otherEdgesOpacity, otherEdgesColor);
                            bestPathOutput.textContent = Math.floor(minPathLength).toString();
                            iterationOutput.textContent = it.toString();
                        }

                        //******************************************************************************************
                        //------------------------------------------------------------------------------------------
                    }
                }, 0);
            } else if (State.pathFinding) {
                State.pathFinding = 0;
                State.preStart = 1;
                document.getElementById("mainButton").textContent = "Начать";
            }
        }
    }




    //создаем массивы с координатами точек
    let List = {
        x: [],
        y: []
    }
    let numberOfCities;

    //обработчик на кнопки
    document.getElementById("mainButton").onclick = function nextState() {
        State.next();
    };
    let vertexNumberOutput = document.getElementById("vertexNumberId");
    let bestPathOutput = document.getElementById("bestPathId");
    let iterationOutput = document.getElementById("iterationId");

    document.getElementById("showSettingsModalWindow").onclick = function (){
        document.getElementById("maxCitiesNumberInputId").value = maxNumberOfCities;
        document.getElementById("maxCitiesNumberOutputId").value = maxNumberOfCities;
        window.location.href='#shadowSettings';
    }
    document.getElementById("saveSettings").onclick = function (){
        maxNumberOfCities = document.getElementById("maxCitiesNumberInputId").value;
        window.location.href='#';
    }

    // На нажатие мыши по canvas будет выполняться эта функция
    MyCanvas.onmousedown = function newTown(e) {
        // в "e"  попадает экземпляр MouseEvent
        let x = e.offsetX;
        let y = e.offsetY;

        // Проверяем на нажатие мыши
        if (e.buttons === 1 && State.mapBuilding && x >= 0 && y >= 0 && x <= MyCanvas.width && y <= MyCanvas.height) {
            if(numberOfCities < maxNumberOfCities) {
                let flag = 1;
                for (let i = 0; i < List.x.length; i++) {
                    if (List.x[i] === x && List.y[i] === y) {
                        flag = 0;
                        break;
                    }
                }
                if (flag) {
                    numberOfCities++;
                    vertexNumberOutput.textContent = numberOfCities.toString();

                    //рисуем город
                    ctx.lineCap = "round";
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
                        ctx.strokeStyle = otherEdgesColor;
                        ctx.beginPath();
                        ctx.moveTo(List.x[i], List.y[i]);
                        ctx.lineTo(x, y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }

                    List.x.push(x);
                    List.y.push(y);
                }
            }
            else
                alert("Максимальное количество городов уже построено");
        }
    };
});