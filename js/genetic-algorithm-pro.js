window.addEventListener("load", function onWindowLoad() {


    let mainButton = document.getElementById("mainButton");
    let mainText = document.getElementById("mainText");

    // Algorithm Modes:
    // 1 - генерируемый код создает массив из numberOfFibonacciNumbers первых чисел Фибоначчи
    // 2 - генерируемый код возвращает число, близкое к заданному пользователем n-ому числу Фибоначчи
    let algorithmMode = 1;

    let algorithmIsWorking = 0;

    mainButton.onclick = function () {
        if(algorithmIsWorking === 0) {
            mainButton.textContent = "Break";
            algorithmIsWorking = 1;
            algorithm();
        }
        else
            algorithmIsWorking = 0;
    }


    //------------------------------------------------------------------------------------------

    //ВАЖНЫЕ КОНСТАНТЫ ПО АЛГОРИТМУ
    const N = 200;//размер популяции
    const MutationPercent = 0.8;//процент мутаций
    const NumberOfGenerations = 1000;//количество поколений
    const MaxNumberOfWithoutResultGenerations = 100;
    const NumberOfDescendants = N;
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


        //----------------------------------------------------
        //~~~~~~~~~~~~~~~~~~~~НАБОР КОМАНД~~~~~~~~~~~~~~~~~~~~
        //----------------------------------------------------

        let numberOfFibonacciNumbers = 10;

        let functionsArray = [];
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

        let FibonacciNumbers = [];
        for (let a = 0, b = 1, i = 0; i < numberOfFibonacciNumbers; i++, [a, b] = [b, a + b])
            FibonacciNumbers[i] = a;


        //----------------------------------------------------
        //~~~~~~~НАХОЖДЕНИЕ ПРИСПОСОБЛЕННОСТИ ХРОМОСОМЫ~~~~~~~
        //----------------------------------------------------
        function findFitness(chromosome) {

            let arr = new Array(numberOfFibonacciNumbers);
            for (let i = 0; i < arr.length; i++)
                arr[i] = 0;

            let s = "";

            for (let i = 0; i < chromosome.arr.length; i++)
                s += functionsArray[chromosome.arr[i]];

            try {
                eval(s);
                let sum = 0;
                for (let i = 0; i < numberOfFibonacciNumbers; i++)
                    sum += Math.abs(FibonacciNumbers[i] - arr[i]);
                chromosome.fitness = sum;
            } catch {
                chromosome.fitness = Infinity;
            }

            s = `let numberOfFibonacciNumbers = ${numberOfFibonacciNumbers};\n` +
                "let arr = new Array(numberOfFibonacciNumbers);\n" +
                "for(let i = 0; i < arr.length; i++)\n" +
                "  arr[i] = 0;\n\n" +
                s +
                "\nfor(let i = 0; i < arr.length; i++)\n" +
                "  console.log(arr[i])";

            return s;
        }


        //--------------------------------------------------------------------------------------------------------
        //НАЧАЛО АЛГОРИТМА
        //--------------------------------------------------------------------------------------------------------


        //------------------------------------------------------------------------------------------
        //Генерация начальной популяции - создаем случайные начальные хромосомы

        let chromosome;
        let population = [];

        for (let i = 0; i < N; i++) {
            chromosome = {
                arr: new Array(getRandomInt(ChromosomeMinLength, ChromosomeMaxLength)),
                fitness: Infinity
            };
            for (let i = 0; i < chromosome.arr.length; i++)
                chromosome.arr[i] = getRandomInt(0, functionsArray.length);

            findFitness(chromosome);

            population.push({arr: chromosome.arr.slice(0, chromosome.arr.length), fitness: chromosome.fitness});
        }
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

            //Создаем потомков в количестве NumberOfDescendants:

            for (let createdDescendants = 0; createdDescendants < NumberOfDescendants; createdDescendants += 2) {
                //Берем 2 случайных хромосомы(a, b) из популяции и скрещиваем их, получая потомков(descendant1,2)
                let v1 = getRandomInt(0, population.length);
                let v2 = getRandomInt(0, population.length);


                //ВНИМАНИЕ!!!!!!!!!!!!!!!
                //НЕ ЗАБЫТЬ ДОБАВИТЬ РАЗНЫЕ РЕЖИМЫ РАЗРЕЗА ХРОМОСОМЫ!!!!!!!!!!


                //Случайное место разреза хромосомы
                let cut1 = getRandomInt(0, Math.min(population[v1].arr.length, population[v2].arr.length));
                let cut2 = getRandomInt(0, Math.min(population[v1].arr.length, population[v2].arr.length));

                let descendant1 = {
                    arr: population[v1].arr.slice(0, cut1 + 1).concat(population[v2].arr.slice(cut1 + 1, cut2 + 1).concat(population[v1].arr.slice(cut2 + 1, population[v1].arr.length))),
                    fitness: Infinity
                }
                let descendant2 = {
                    arr: population[v2].arr.slice(0, cut1 + 1).concat(population[v1].arr.slice(cut1 + 1, cut2 + 1).concat(population[v2].arr.slice(cut2 + 1, population[v2].arr.length))),
                    fitness: Infinity
                }


                //ВНИМАНИЕ!!!!!!!!!!!!!!!
                //НЕ ЗАБЫТЬ ДОБАВИТЬ РАЗНЫЕ РЕЖИМЫ МУТАЦИИ!!!!!!!!!!


                //------------------------------------------------------------------------------------------
                //Мутация
                if (Math.random() < MutationPercent) {
                    descendant1.arr[getRandomInt(0, descendant1.arr.length)] = getRandomInt(0, functionsArray.length);
                }
                if (Math.random() < MutationPercent) {
                    descendant2.arr[getRandomInt(0, descendant2.arr.length)] = getRandomInt(0, functionsArray.length);
                }
                //------------------------------------------------------------------------------------------

                //посчитаем приспособленность полученных потомков
                findFitness(descendant1);
                findFitness(descendant2);

                population.push({
                    arr: descendant1.arr.slice(0, descendant1.arr.length),
                    fitness: descendant1.fitness
                });
                population.push({
                    arr: descendant2.arr.slice(0, descendant1.arr.length),
                    fitness: descendant2.fitness
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
                mainText.textContent = it.toString();
                mainText.textContent += ' ' + population[0].fitness;
                mainText.textContent += '\n\n' + bestCode;
                bestFitness = population[0].fitness;
                bestCode = findFitness(population[0]);
            }
        }, 0)
    }
});