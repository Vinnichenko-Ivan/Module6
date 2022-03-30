window.addEventListener("load", function onWindowLoad() {


    let mainButton = document.getElementById("mainButton");
    let mainText = document.getElementById("mainText");

    // Algorithm Modes:
    // 1 - генерируемый код создает массив из numberOfFibonacciNumbers первых чисел Фибоначчи
    // 2 - генерируемый код возвращает число, близкое к заданному пользователем n-ому числу Фибоначчи
    let algorithmMode = 2;

    let algorithmIsWorking = 0;

    mainButton.onclick = function () {
        if (algorithmIsWorking === 0) {
            mainButton.textContent = "Break";
            algorithmIsWorking = 1;
            algorithm();
        } else
            algorithmIsWorking = 0;
    }


    //------------------------------------------------------------------------------------------

    //ВАЖНЫЕ КОНСТАНТЫ ПО АЛГОРИТМУ

    const N = 100;//размер популяции
    const MutationPercent = 0.7;//процент мутаций
    const NumberOfGenerations = 4000;//количество поколений
    const MaxNumberOfWithoutResultGenerations = 500;
    const NumberOfDescendants = N * 2;
    const ChromosomeMinLength = 1;
    const ChromosomeMaxLength = 70;

    //------------------------------------------------------------------------------------------


    //случайное число
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
        //Максимум не включается, минимум включается
    }


    //--------------------------------------------------------------------------------------------------------
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~АЛГОРИТМ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //--------------------------------------------------------------------------------------------------------


    function algorithm() {

        const numberOfFibonacciNumbers = 10;
        const numberOfMutationModes = 3;
        const numberOfCutModes = 2;

        let FibonacciNumbers = [];
        for (let a = 0, b = 1, i = 0; i < numberOfFibonacciNumbers; i++, [a, b] = [b, a + b])
            FibonacciNumbers.push(a);


        //----------------------------------------------------
        //~~~~~~~~~~~~~~~~~~~~НАБОР КОМАНД~~~~~~~~~~~~~~~~~~~~
        //----------------------------------------------------


        let functionsArray = [];
        if (algorithmMode === 1) {
            for (let i = 0; i < numberOfFibonacciNumbers; i++) {
                //Экзотическое:

                //Разные условия:
                functionsArray.push(`if(arr[${i}] === arr[${getRandomInt(0, numberOfFibonacciNumbers)}])\n  arr[${i}]++;\n`);
                functionsArray.push(`if(arr[${i}] >= arr[${getRandomInt(0, numberOfFibonacciNumbers)}])\n  arr[${i}]--;\n`);

                //Простые операции:
                functionsArray.push(`arr[${i}]=arr[${getRandomInt(0, numberOfFibonacciNumbers)}];\n`);
                functionsArray.push(`arr[${i}]+=arr[${getRandomInt(0, numberOfFibonacciNumbers)}];\n`);
                functionsArray.push(`arr[${i}]-=arr[${getRandomInt(0, numberOfFibonacciNumbers)}];\n`);
                functionsArray.push(`arr[${i}]++;\n`);
                functionsArray.push(`arr[${i}]+=2;\n`);
                functionsArray.push(`arr[${i}]+=3;\n`);
                functionsArray.push(`arr[${i}]--;\n`);
                functionsArray.push(`arr[${i}]-=2;\n`);
                functionsArray.push(`arr[${i}]-=3;\n`);
            }
        } else {
            for (let i = 0; i < 4; i++) {
                functionsArray.push(`a++;\n`);
                functionsArray.push(`a--;\n`);
                functionsArray.push(`b++;\n`);
                functionsArray.push(`b--;\n`);
                functionsArray.push(`c++;\n`);
                functionsArray.push(`c--;\n`);
                functionsArray.push(`[a, b] = [b, a+b];\n`);
                functionsArray.push(`[b, c] = [c, a+b];\n`);
                functionsArray.push(`[b, c] = [a, a+b];\n`);
                functionsArray.push(`[a, b] = [c, a+b];\n`);
                functionsArray.push(`[a, b] = [b-a, a];\n`);
                functionsArray.push(`[a, c] = [c, a];\n`);
                functionsArray.push(`for(let j = ${getRandomInt(0, numberOfFibonacciNumbers)}; j < n; j++)\n  [a, b] = [b, a+b];\n`);
                functionsArray.push(`for(let j = ${getRandomInt(0, numberOfFibonacciNumbers)}; j < n; j++)\n  [a, b] = [b, a+b];\n`);
                functionsArray.push(`for(let j = ${getRandomInt(0, numberOfFibonacciNumbers)}; j < n; j++)\n  [a, c] = [c, a+b];\n`);
                functionsArray.push(`for(let j = ${getRandomInt(0, numberOfFibonacciNumbers)}; j < n; j++)\n  [a, b] = [b, c+b];\n`);
            }
        }


        //----------------------------------------------------
        //~~~~~~~НАХОЖДЕНИЕ ПРИСПОСОБЛЕННОСТИ ХРОМОСОМЫ~~~~~~~
        //----------------------------------------------------
        function findFitness(chromosome) {

            if (algorithmMode === 1) {
                let arr = new Array(numberOfFibonacciNumbers);
                for (let i = 0; i < arr.length; i++)
                    arr[i] = 0;

                let str = "";

                for (let i = 0; i < chromosome.arr.length; i++)
                    str += functionsArray[chromosome.arr[i]];

                try {
                    eval(str);
                    let sum = 0;
                    for (let i = 0; i < numberOfFibonacciNumbers; i++)
                        sum += Math.abs(FibonacciNumbers[i] - arr[i]);
                    chromosome.fitness = sum;
                } catch {
                    chromosome.fitness = Infinity;
                }

                str = `let numberOfFibonacciNumbers = ${numberOfFibonacciNumbers};\n` +
                    "let arr = new Array(numberOfFibonacciNumbers);\n" +
                    "for(let i = 0; i < arr.length; i++)\n" +
                    "  arr[i] = 0;\n\n" +
                    str +
                    "\nfor(let i = 0; i < arr.length; i++)\n" +
                    "  console.log(arr[i])";

                chromosome.code = str;
            } else {
                let strWithFunctions = "";
                let strWithFullAlgo = "";

                for (let i = 0; i < chromosome.arr.length; i++)
                    strWithFunctions += functionsArray[chromosome.arr[i]];

                try {
                    let n = 0, a = 0, b = 0, c = 1, res = 0, sum = 0;
                    for (let i = 0; i < numberOfFibonacciNumbers; i++) {
                        strWithFullAlgo = `n = ${i + 1};\na = 0;\nb = 0;\nc = 1;\nres = 0;\n` + strWithFunctions + 'res = a + b;\n';
                        eval(strWithFullAlgo);
                        sum += Math.abs(FibonacciNumbers[i] - res);
                    }
                    chromosome.fitness = sum;
                } catch {
                    chromosome.fitness = Infinity;
                }

                strWithFullAlgo = `let n = ${numberOfFibonacciNumbers}, a = 0, b = 0, c = 1;\n` +
                    strWithFunctions +
                    "let res = a + b;\n" +
                    "console.log(res)";

                chromosome.code = strWithFullAlgo;
            }
        }


        //--------------------------------------------------------------------------------------------------------
        //НАЧАЛО АЛГОРИТМА
        //--------------------------------------------------------------------------------------------------------


        //------------------------------------------------------------------------------------------
        //Генерация начальной популяции - создаем случайные начальные хромосомы

        let chromosome;
        let population = [];

        function randChromosomes(k) {
            for (let i = 0; i < k; i++) {
                chromosome = {
                    arr: new Array(getRandomInt(ChromosomeMinLength, ChromosomeMaxLength)),
                    fitness: Infinity,
                    code: ""
                };
                for (let i = 0; i < chromosome.arr.length; i++)
                    chromosome.arr[i] = getRandomInt(0, functionsArray.length);

                findFitness(chromosome);

                population.push({arr: chromosome.arr.slice(0, chromosome.arr.length), fitness: chromosome.fitness, code: chromosome.code});
            }
        }

        randChromosomes(N);
        //------------------------------------------------------------------------------------------


        //------------------------------------------------------------------------------------------
        //ДАЛЬШЕ ИТЕРАЦИИ
        //------------------------------------------------------------------------------------------

        let it = 0;
        let withoutResultIterations = 0;
        let bestFitness = Infinity;
        let bestCode = "";

        let id = setInterval(function () {

            if (it >= NumberOfGenerations || withoutResultIterations >= MaxNumberOfWithoutResultGenerations || bestFitness === 0 || !algorithmIsWorking) {
                mainButton.textContent = "Start";
                algorithmIsWorking = 0;
                clearInterval(id);
            }

            it++;
            withoutResultIterations++;


            //Немного случайных потомков, занесенных с другой планеты:
            randChromosomes(5);


            //Создаем потомков в количестве NumberOfDescendants:

            for (let createdDescendants = 0; createdDescendants < NumberOfDescendants; createdDescendants += 2) {
                //Берем 2 случайных хромосомы(a, b) из популяции и скрещиваем их, получая потомков(descendant1,2)
                let v1 = getRandomInt(0, population.length);
                let v2 = getRandomInt(0, population.length);

                //Случайное место разреза хромосомы
                //------------------------------------------------------------------------------------------
                let randCutMode = getRandomInt(0, numberOfCutModes);
                let descendant1, descendant2;

                if (randCutMode === 0) {
                    let cut1 = getRandomInt(0, Math.min(population[v1].arr.length, population[v2].arr.length));
                    let cut2 = getRandomInt(0, Math.min(population[v1].arr.length, population[v2].arr.length));

                    descendant1 = {
                        arr: population[v1].arr.slice(0, cut1 + 1).concat(population[v2].arr.slice(cut1 + 1, cut2 + 1).concat(population[v1].arr.slice(cut2 + 1, population[v1].arr.length))),
                        fitness: Infinity,
                        code: ""
                    }
                    descendant2 = {
                        arr: population[v2].arr.slice(0, cut1 + 1).concat(population[v1].arr.slice(cut1 + 1, cut2 + 1).concat(population[v2].arr.slice(cut2 + 1, population[v2].arr.length))),
                        fitness: Infinity,
                        code: ""
                    }
                }
                if (randCutMode === 1) {
                    let cut = getRandomInt(0, Math.min(population[v1].arr.length, population[v2].arr.length));
                    descendant1 = {
                        arr: population[v1].arr.slice(0, cut + 1).concat(population[v2].arr.slice(cut + 1, population[v1].arr.length)),
                        fitness: Infinity,
                        code: ""
                    }
                    descendant2 = {
                        arr: population[v2].arr.slice(0, cut + 1).concat(population[v1].arr.slice(cut + 1, population[v2].arr.length)),
                        fitness: Infinity,
                        code: ""
                    }
                }
                //------------------------------------------------------------------------------------------


                //------------------------------------------------------------------------------------------
                //Мутация
                if (Math.random() < MutationPercent) {
                    let r = getRandomInt(0, numberOfMutationModes);
                    if (r === 0) {
                        let r1 = getRandomInt(0, descendant1.arr.length), r2 = getRandomInt(0, descendant1.arr.length);
                        [r1, r2] = [Math.min(r1, r2), Math.max(r1, r2)];
                        for (let h = r1; h <= r2; h++)
                            descendant1.arr[h] = getRandomInt(0, functionsArray.length);
                    }
                    if (r === 1) {
                        let r1 = getRandomInt(0, descendant1.arr.length), r2 = getRandomInt(0, descendant1.arr.length);
                        [r1, r2] = [Math.min(r1, r2), Math.max(r1, r2)];
                        descendant1.arr = descendant1.arr.slice(r1, r2);
                    }
                    if (r === 2) {
                        let r1 = getRandomInt(0, descendant1.arr.length), r2 = getRandomInt(0, descendant1.arr.length);
                        [r1, r2] = [Math.min(r1, r2), Math.max(r1, r2)];
                        descendant1.arr.splice(r1, r2);
                    }
                }
                if (Math.random() < MutationPercent) {
                    let r = getRandomInt(0, numberOfMutationModes);
                    if (r === 0)
                        descendant2.arr[getRandomInt(0, descendant2.arr.length)] = getRandomInt(0, functionsArray.length);
                    if (r === 1) {
                        let r1 = getRandomInt(0, descendant2.arr.length), r2 = getRandomInt(0, descendant2.arr.length);
                        [r1, r2] = [Math.min(r1, r2), Math.max(r1, r2)];
                        descendant2.arr = descendant2.arr.slice(r1, r2);
                    }
                    if (r === 2) {
                        let r1 = getRandomInt(0, descendant2.arr.length), r2 = getRandomInt(0, descendant2.arr.length);
                        [r1, r2] = [Math.min(r1, r2), Math.max(r1, r2)];
                        descendant2.arr = descendant2.arr.splice(r1, r2);
                    }
                }
                //------------------------------------------------------------------------------------------

                //посчитаем приспособленность полученных потомков
                findFitness(descendant1);
                findFitness(descendant2);

                population.push({
                    arr: descendant1.arr.slice(0, descendant1.arr.length),
                    fitness: descendant1.fitness,
                    code: descendant1.code
                });
                population.push({
                    arr: descendant2.arr.slice(0, descendant1.arr.length),
                    fitness: descendant2.fitness,
                    code: descendant2.code
                });
            }

            //Естественный отбор - оставляем только лучших особей популяции

            function compare(a, b) {
                return a.fitness - b.fitness;
            }

            population.sort(compare);
            population = population.slice(0, N);

            //Вывод нового лучшего результата
            if (population[0].fitness < bestFitness) {
                withoutResultIterations = 0;
                bestCode = population[0].code;
                bestFitness = population[0].fitness;
                mainText.textContent = it.toString();
                mainText.textContent += ' ' + population[0].fitness;
                mainText.textContent += '\n\n' + bestCode;
            }
        }, 0)
    }
});