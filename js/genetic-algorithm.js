window.addEventListener("load", function onWindowLoad()
{
    let State = {
        preStart: 1,
        mapBuilding: 0,
        pathFinding: 0,
        showingResult: 0,
        next: function()
        {
            if(State.preStart)
            {
                State.preStart = 0;
                State.mapBuilding = 1;
                document.getElementById("Towns").textContent = "";
                document.getElementById("mainButton").textContent = "Find Path";
            }
            else if(State.mapBuilding)
            {
                State.mapBuilding = 0;
                State.pathFinding = 1;
                document.getElementById("mainButton").textContent = "Show Result";

                //
                //реализуем ген алгоритм с показом
                //

                //ВАЖНЫЕ КОНСТАНТЫ:
                const N = List.x.length/2+1;//размер популяции
                const MutationPercent = 0.3;//процент мутаций
                const NumberOfGenerations = 10*N;//количество популяций

                /*
                хромосома - маршрут
                популяция - множество маршрутов
                особь - кратчайший маршрут
                скрещивание - соединение маршрутов
                мутация - случайное изменение позиций городов в маршруте
                 */

                //1. создаем матрицу весов
                let mat = new Array(List.x.length);
                for(let i = 0;i<List.x.length; i++)
                {
                    mat[i] = new Array(List.x.length);
                    for(let j = 0; j < i; j++)
                        mat[i][j] = Math.sqrt(Math.pow(List.x[i]-List.x[j], 2)+Math.pow(List.y[i]-List.y[j], 2))
                    mat[i][i] = -Infinity;
                    for(let j = i+1; j < List.x.length; j++)
                        mat[i][j] = Math.sqrt(Math.pow(List.x[i]-List.x[j], 2)+Math.pow(List.y[i]-List.y[j], 2))
                }

                //2. Генерация начальной популяции - создаем случайные начальные маршруты

                function getRandomInt(min, max) {
                    min = Math.ceil(min);
                    max = Math.floor(max);
                    return Math.floor(Math.random() * (max - min)) + min;
                    //Максимум не включается, минимум включается
                }

                let chromosome = {
                    arr: new Array(List.x.length),
                    pathLength: 0
                };
                for(let i = 0; i < List.x.length; i++)
                {
                    chromosome.arr[i] = i;
                    if(i === 0)
                        chromosome.pathLength += mat[0][List.x.length-1];
                    else
                        chromosome.pathLength += mat[chromosome.arr[i]][chromosome.arr[i-1]];
                }

                let population = [];
                population.push(chromosome);

                for(let i = 1; i < N; i++)
                {
                    for(let j = 0; j < List.x.length; j++)
                    {
                        let a = getRandomInt(0, List.x.length);
                        let b = getRandomInt(0, List.x.length);
                        [chromosome.arr[a], chromosome.arr[b]] = [chromosome.arr[b], chromosome.arr[a]];
                    }
                    chromosome.pathLength = 0;
                    for(let i = 0; i < chromosome.arr.length; i++)
                    {
                        if(i === 0)
                            chromosome.pathLength += mat[chromosome.arr[0]][chromosome.arr[chromosome.arr.length-1]];
                        else
                            chromosome.pathLength += mat[chromosome.arr[i]][chromosome.arr[i-1]];
                    }
                    population.push(chromosome);
                }

                //-------------------------------------------------
                //Дальнейшие действия повторяем несколько поколений

                for(let it = 0; it < NumberOfGenerations; it++) {

                    //3. Берем 2 случайных маршрута из популяции и скрещиваем их

                    let v = getRandomInt(0, N);
                    let a = {
                        arr: population[v].arr,
                        pathLength: population[v].pathLength
                    }
                    v = getRandomInt(0, N);
                    let b = {
                        arr: population[v].arr,
                        pathLength: population[v].pathLength
                    }

                    //случайное место разреза хромосомы
                    v = getRandomInt(0, List.x.length);

                    let descendant1 = {
                        arr: new Array(List.x.length),
                        pathLength: 0
                    }
                    let descendant2 = {
                        arr: new Array(List.x.length),
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

                    //4. Мутация
                    if (Math.random() < MutationPercent) {
                        let v1 = getRandomInt(0, descendant1.arr.length);
                        let v2 = getRandomInt(0, descendant1.arr.length);
                        [descendant1.arr[v1], descendant1.arr[v2]] = [descendant1.arr[v2], descendant1.arr[v1]];
                    }
                    if (Math.random() < MutationPercent) {
                        let v1 = getRandomInt(0, descendant2.arr.length);
                        let v2 = getRandomInt(0, descendant2.arr.length);
                        [descendant2.arr[v1], descendant2.arr[v2]] = [descendant2.arr[v2], descendant2.arr[v1]];
                    }

                    //посчитаем длину полученных маршрутов потомков
                    for (let i = 0; i < descendant1.arr.length; i++) {
                        if (i === 0)
                            descendant1.pathLength += mat[descendant1.arr[0]][descendant1.arr[descendant1.arr.length - 1]];
                        else
                            descendant1.pathLength += mat[descendant1.arr[i]][descendant1.arr[i - 1]];
                        if (i === 0)
                            descendant2.pathLength += mat[descendant2.arr[0]][descendant2.arr[descendant2.arr.length - 1]];
                        else
                            descendant2.pathLength += mat[descendant2.arr[i]][descendant2.arr[i - 1]];
                    }

                    population.push(descendant1);
                    population.push(descendant2);

                    //5. Естественный отбор - оставляем только лучших особей популяции

                    let f = function compare(a, b) {
                        if (a.pathLength < b.pathLength) {
                            return -1;
                        }
                        if (a.pathLength > b.pathLength) {
                            return 1;
                        }
                        // a должно быть равным b
                        return 0;
                    }

                    population.sort(f)

                    population.pop();
                    population.pop();
                }
                document.getElementById("Towns").textContent = `Path: `;
                for(let i = 0; i < population[0].arr.length; i++)
                    document.getElementById("Towns").textContent += `${population[0].arr[i]} `;


                //заново все рисуем
                ctx.clearRect(0, 0, MyCanvas.width, MyCanvas.height);

                //рисуем города
                for(let i = 0; i < List.x.length; i++)
                {
                    //города
                    ctx.beginPath();
                    ctx.arc(List.x[i], List.y[i], 5, 0, Math.PI*2, false);
                    ctx.closePath();
                    ctx.stroke();
                }

                //рисуем пути, создав сначала матрицу с цветами ребер

                let edgeColor = new Array(List.x.length);
                for(let i = 0; i < List.x.length; i++)
                    edgeColor[i] = new Array(List.x.length)

                for(let i = 0; i < List.x.length; i++)
                {
                    if(i===0)
                    {
                        edgeColor[Math.min(population[0].arr[0], population[0].arr[List.x.length-1])][Math.max(population[0].arr[0], population[0].arr[List.x.length-1])] = "Green";
                    }
                    else
                        edgeColor[Math.min(population[0].arr[i], population[0].arr[i-1])][Math.max(population[0].arr[i], population[0].arr[i-1])] = "Green";
                }

                ctx.lineWidth = 3;
                for(let i = 0; i < List.x.length; i++)
                {
                    for(let j = i+1; j < List.x.length; j++)
                    {
                        if(edgeColor[i][j] === "Green")
                        {
                            ctx.strokeStyle = 'green'
                            ctx.beginPath();
                            ctx.moveTo(List.x[i], List.y[i]);
                            ctx.lineTo(List.x[j], List.y[j]);
                            ctx.stroke();
                            ctx.strokeStyle = 'black';
                        }
                        else
                        {
                            ctx.beginPath();
                            ctx.moveTo(List.x[i], List.y[i]);
                            ctx.lineTo(List.x[j], List.y[j]);
                            ctx.stroke();
                        }
                    }
                }
                ctx.lineWidth = 15;
            }
            else if(State.pathFinding)
            {
                State.pathFinding = 0;
                State.showingResult = 1;
                document.getElementById("mainButton").textContent = "Break";
            }
            else if(State.showingResult)
            {
                State.showingResult = 0;
                State.preStart = 1;
                ctx.clearRect(0, 0, MyCanvas.width, MyCanvas.height);
                document.getElementById("mainButton").textContent = "Start";
                document.getElementById("Towns").textContent = "Here You will see your Towns";
                List.x.splice(0, List.x.length);
                List.y.splice(0, List.y.length);
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

    // переменные для рисования
    ctx.lineCap = "round";
    ctx.lineWidth = 15;

    //обработчик на кнопку
    document.getElementById("mainButton").onclick = function nextState() {
        State.next();
    };

    // На нажатие мыши по canvas будет выполняться эта функция
    MyCanvas.onmousedown = function newTown (e) {
        // в "e"  попадает экземпляр MouseEvent
        let x = e.offsetX;
        let y = e.offsetY;

        // Проверяем на нажатие мыши
        if (e.buttons === 1 && State.mapBuilding && x>=0 && y>=0 && x<=MyCanvas.width && y <=MyCanvas.height)
        {
            //рисуем город
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI*2, false);
            ctx.closePath();
            ctx.stroke();

            //рисуем пути
            ctx.lineWidth = 3;
            for(let i = 0; i < List.x.length; i++)
            {
                ctx.beginPath();
                ctx.moveTo(List.x[i], List.y[i]);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            ctx.lineWidth = 15;

            //выводим на экран координаты
            document.getElementById("Towns").textContent += `${List.x.length+1}:\t${x}\t${y}\n`;

            //добавляем координаты города в массивы
            List.x.push(x);
            List.y.push(y);
        }
    };
});
