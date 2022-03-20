window.addEventListener("load", function onWindowLoad() {

    //ВАЖНЫЕ ФУНКЦИИ:

    //отрисовать города
    function drawTowns(col, rad) {
        for (let i = 0; i < List.x.length; i++) {
            ctx.strokeStyle = col;
            ctx.lineWidth = 15;
            ctx.beginPath();
            ctx.arc(List.x[i], List.y[i], rad, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.stroke();
        }
    }

    //отрисовать пути
    function drawEdges(wid, alpha, i, j, col) {
        ctx.lineWidth = wid;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = col;
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

        document.getElementById("Towns").textContent = `Path: 0 `;
        for (let i = 0; i < population[0].arr.length; i++)
            document.getElementById("Towns").textContent += `${population[0].arr[i]} `;
        document.getElementById("Towns").textContent += ` 0`;

        //заново все рисуем

        ctx.clearRect(0, 0, MyCanvas.width, MyCanvas.height);
        //рисуем города
        drawTowns(townColor, townRadius);

        //рисуем пути, создав сначала матрицу с цветами ребер
        let edgeColor = new Array(List.x.length);
        for (let i = 0; i < List.x.length; i++)
            edgeColor[i] = new Array(List.x.length)

        edgeColor[0][population[0].arr[0]] = "1";
        edgeColor[0][population[0].arr[population[0].arr.length - 1]] = "1";
        for (let i = 0; i < population[0].arr.length - 1; i++)
            edgeColor[Math.min(population[0].arr[i], population[0].arr[i + 1])][Math.max(population[0].arr[i], population[0].arr[i + 1])] = "1";

        for (let i = 0; i < List.x.length; i++) {
            for (let j = i + 1; j < List.x.length; j++) {
                if (edgeColor[i][j] === "1")
                    drawEdges(goodEdgesWidth, goodEdgesOpacity, i, j, goodEdgesColor);
                else
                    drawEdges(badEdgesWidth, badEdgesOpacity, i, j, badEdgesColor);
            }
        }
    }

    //функция поиска приспособленности хромосомы
    function findPathLength(chromosome, mat) {
        for (let i = 0; i < chromosome.arr.length; i++) {
            if (i === 0 && chromosome.arr.length !== 1)
                chromosome.pathLength += mat[0][chromosome.arr[0]];
            if (i === chromosome.arr.length - 1 && chromosome.arr.length !== 1)
                chromosome.pathLength += mat[chromosome.arr[chromosome.arr.length - 1]][0];
            else if (chromosome.arr.length !== 1)
                chromosome.pathLength += mat[chromosome.arr[i]][chromosome.arr[i + 1]];
        }
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
                document.getElementById("Towns").textContent = "";
                document.getElementById("mainButton").textContent = "Find Path";
            } else if (State.mapBuilding && List.x.length !== 0) {
                State.mapBuilding = 0;
                State.pathFinding = 1;
                document.getElementById("mainButton").textContent = "Break";


                //------------------------------------------------------------------------------------------

                //ВАЖНЫЕ КОНСТАНТЫ ПО АЛГОРИТМУ
                const N = Math.pow(List.x.length, 2);//размер популяции
                const MutationPercent = 0.7;//процент мутаций
                const NumberOfGenerations = 100000;//количество популяций
                const MaxNumberOfWithoutResultGenerations = Math.pow(List.x.length, 3);
                const NumberOfPermutation = N;
                const MutationMod = 2;//Режимы мутации: 1 - поменять местами гены в хромосоме, 2 - развернуть участок хромосомы. По моим наблюдениям 2 работает лучше
                const NumberOfDescendants = N;

                //------------------------------------------------------------------------------------------


                //Реализуем ген алгоритм с показом

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
                //Генерация начальной популяции - создаем случайные начальные маршруты

                let chromosome = {
                    arr: new Array(List.x.length - 1),
                    pathLength: 0
                };
                for (let i = 0; i < chromosome.arr.length; i++)
                    chromosome.arr[i] = i + 1;
                findPathLength(chromosome, mat);

                let population = [{
                    arr: chromosome.arr.slice(0, chromosome.arr.length),
                    pathLength: chromosome.pathLength
                }];

                for (let i = 1; i < N; i++) {
                    for (let j = 0; j < NumberOfPermutation; j++) {
                        let a = getRandomInt(0, chromosome.arr.length);
                        let b = getRandomInt(0, chromosome.arr.length);
                        [chromosome.arr[a], chromosome.arr[b]] = [chromosome.arr[b], chromosome.arr[a]];
                    }
                    chromosome.pathLength = 0;
                    findPathLength(chromosome, mat);
                    population.push({
                        arr: chromosome.arr.slice(0, chromosome.arr.length),
                        pathLength: chromosome.pathLength
                    });
                }
                //------------------------------------------------------------------------------------------


                //------------------------------------------------------------------------------------------
                //Дальнейшие действия повторяем несколько поколений в setInterval с анимацией
                let it = 0;
                let itOfWithoutResultGenerations = 0;
                let minPathLength = Infinity;

                let id = setInterval(function drawFrame() {
                    it++;
                    itOfWithoutResultGenerations++;

                    if (State.preStart || it > NumberOfGenerations || itOfWithoutResultGenerations > MaxNumberOfWithoutResultGenerations) {
                        //окончание работы алгоритма

                        State.pathFinding = 0;
                        State.preStart = 1;
                        document.getElementById("mainButton").textContent = "Start";
                        document.getElementById("Towns").textContent = "";

                        //отрисовка
                        redrawing(population, resultEdgesWidth, resultEdgesOpacity, resultEdgesColor, otherEdgesWidth, otherEdgesOpacity, otherEdgesColor);

                        List.x.splice(0, List.x.length);
                        List.y.splice(0, List.y.length);
                        clearInterval(id);
                    } else {
                        //создаем потомков в количестве NumberOfDescendants
                        for (let createdDescendants = 0; createdDescendants < NumberOfDescendants; createdDescendants += 2) {
                            //Берем 2 случайных хромосомы(a, b) из популяции и скрещиваем их, получая потомков(descendant1,2)
                            let v = getRandomInt(0, population.length);
                            let a = {
                                arr: population[v].arr.slice(0, population[v].arr.length),
                                pathLength: population[v].pathLength
                            }
                            v = getRandomInt(0, population.length);
                            let b = {
                                arr: population[v].arr.slice(0, population[v].arr.length),
                                pathLength: population[v].pathLength
                            }

                            //случайное место разреза хромосомы
                            v = getRandomInt(0, a.arr.length);

                            let descendant1 = {
                                arr: new Array(a.arr.length),
                                pathLength: 0
                            }
                            let descendant2 = {
                                arr: new Array(a.arr.length),
                                pathLength: 0
                            }

                            let x = 0, y = 0;//сколько днк хромосом потомков уже вставлено
                            for (let i = 0; i < v; i++) {
                                descendant1.arr[x++] = a.arr[i];
                                descendant2.arr[y++] = b.arr[i];
                            }
                            for (let i = v; i < a.arr.length; i++) {
                                if (!descendant1.arr.includes(b.arr[i]))
                                    descendant1.arr[x++] = b.arr[i];
                                if (!descendant2.arr.includes(a.arr[i]))
                                    descendant2.arr[y++] = a.arr[i];
                            }
                            for (let i = v; i < a.arr.length; i++) {
                                if (!descendant1.arr.includes(a.arr[i]))
                                    descendant1.arr[x++] = a.arr[i];
                                if (!descendant2.arr.includes(b.arr[i]))
                                    descendant2.arr[y++] = b.arr[i];
                            }


                            //------------------------------------------------------------------------------------------
                            //Мутация
                            if (Math.random() < MutationPercent) {
                                let v1 = getRandomInt(0, descendant1.arr.length);
                                let v2 = getRandomInt(0, descendant1.arr.length);
                                if (MutationMod === 1)
                                    [descendant1.arr[v1], descendant1.arr[v2]] = [descendant1.arr[v2], descendant1.arr[v1]];
                                else if (MutationMod === 2)
                                    descendant1.arr = (descendant1.arr.slice(0, Math.min(v1, v2)).concat(descendant1.arr.slice(Math.min(v1, v2), Math.max(v1, v2) + 1).reverse(), descendant1.arr.slice(Math.max(v1, v2) + 1, descendant1.arr.length)));
                            }
                            if (Math.random() < MutationPercent) {
                                let v1 = getRandomInt(0, descendant2.arr.length);
                                let v2 = getRandomInt(0, descendant2.arr.length);
                                if (MutationMod === 1)
                                    [descendant2.arr[v1], descendant2.arr[v2]] = [descendant2.arr[v2], descendant2.arr[v1]];
                                else if (MutationMod === 2)
                                    descendant2.arr = (descendant2.arr.slice(0, Math.min(v1, v2)).concat(descendant2.arr.slice(Math.min(v1, v2), Math.max(v1, v2) + 1).reverse(), descendant2.arr.slice(Math.max(v1, v2) + 1, descendant2.arr.length)));
                            }
                            //------------------------------------------------------------------------------------------


                            //посчитаем длину полученных маршрутов потомков
                            findPathLength(descendant1, mat);
                            findPathLength(descendant2, mat);

                            population.push({
                                arr: descendant1.arr.slice(0, descendant1.arr.length),
                                pathLength: descendant1.pathLength
                            });
                            population.push({
                                arr: descendant2.arr.slice(0, descendant1.arr.length),
                                pathLength: descendant2.pathLength
                            });

                        }

                        //Естественный отбор - оставляем только лучших особей популяции

                        let f = function compare(a, b) {
                            return a.pathLength - b.pathLength;
                        }


                        //------------------------------

                        //здесь надо как-то оптимально избавиться от повторов в массиве population

                        //------------------------------


                        population.sort(f)
                        population = population.slice(0, N);

                        if (population[0].pathLength < minPathLength) {
                            minPathLength = population[0].pathLength;
                            itOfWithoutResultGenerations = 0;
                        }

                        //отрисовка
                        redrawing(population, mainEdgesWidth, mainEdgesOpacity, mainEdgesColor, otherEdgesWidth, otherEdgesOpacity, otherEdgesColor);
                    }
                }, 0);
            } else if (State.pathFinding) {
                State.pathFinding = 0;
                State.preStart = 1;
                document.getElementById("mainButton").textContent = "Start";
                document.getElementById("Towns").textContent = "";
            }
        }
    }

    let MyCanvas = document.getElementById("MyCanvas"),
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
                document.getElementById("Towns").textContent += `${List.x.length + 1}:\t${x}\t${y}\n`;

                List.x.push(x);
                List.y.push(y);
            }
        } else if (e.buttons === 1 && State.mapBuilding && x >= 0 && y >= 0 && x <= MyCanvas.width && y <= MyCanvas.height && numberOfCities >= maxNumberOfCities) {
            alert("Максимальное количество городов уже построено");
        }
    };
});