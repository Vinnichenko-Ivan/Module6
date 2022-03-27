window.addEventListener("load", function onWindowLoad() {


    let mainButton = document.getElementById("mainButton");
    let mainText = document.getElementById("mainText");

    mainButton.onclick = function () {
            algorithm();
    }


    //~~~~~~~~~~~~~~~~~~~~НАБОР КОМАНД~~~~~~~~~~~~~~~~~~~~
    let functionsArray = [];
    functionsArray.push("a++;");
    functionsArray.push("a--;");
    functionsArray.push("b++;");
    functionsArray.push("b--;");
    functionsArray.push("c++;");
    functionsArray.push("c--;");
    functionsArray.push("d++;");
    functionsArray.push("d--;");
    functionsArray.push("e++;");
    functionsArray.push("e--;");
    functionsArray.push("f++;");
    functionsArray.push("f--;");
    functionsArray.push("g++;");
    functionsArray.push("g--;");


    //нахождение приспособленности хромосомы
    function findFitness(chromosome) {

        //0 1 1 2 3 5 8 13 21 34
        let a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0;

        let s = "";

        for (let i = 0; i < chromosome.arr.length; i++)
            s += functionsArray[chromosome.arr[i]];

        try {
            eval(s);
            chromosome.fitness = Math.abs(a) + Math.abs(b - 1) + Math.abs(c - 1) + Math.abs(d - 2) + Math.abs(e - 3) + Math.abs(f - 5) + Math.abs(g - 8);
        } catch {
            chromosome.fitness = Infinity;
        }

        return s;
    }

    //случайное число
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
        //Максимум не включается, минимум включается
    }

    function algorithm() {

        //------------------------------------------------------------------------------------------

        //ВАЖНЫЕ КОНСТАНТЫ ПО АЛГОРИТМУ
        const N = 40;//размер популяции
        const MutationPercent = 0.5;//процент мутаций
        const NumberOfGenerations = 100;//количество популяций
        //const MaxNumberOfWithoutResultGenerations = ...;
        const NumberOfDescendants = N * 2;
        const ChromosomeMinLength = 1;
        const ChromosomeMaxLength = 40;

        //------------------------------------------------------------------------------------------


        //------------------------------------------------------------------------------------------
        //Генерация начальной популяции - создаем случайные начальные хромосомы

        let chromosome = {
            arr: new Array(getRandomInt(ChromosomeMinLength, ChromosomeMaxLength)),
            fitness: Infinity
        };
        for (let i = 0; i < chromosome.arr.length; i++)
            chromosome.arr[i] = getRandomInt(0, functionsArray.length);
        chromosome.arr.sort(function (a, b) {
            return a - b
        });
        findFitness(chromosome);

        let population = [{
            arr: chromosome.arr.slice(0, chromosome.arr.length),
            fitness: chromosome.fitness
        }];

        for (let i = 1; i < N; i++) {
            chromosome = {
                arr: new Array(getRandomInt(ChromosomeMinLength, ChromosomeMaxLength)),
                fitness: Infinity
            };
            for (let i = 0; i < chromosome.arr.length; i++)
                chromosome.arr[i] = getRandomInt(0, functionsArray.length);
            chromosome.arr.sort(function (a, b) {
                return a - b
            });
            findFitness(chromosome);

            population.push({arr: chromosome.arr.slice(0, chromosome.arr.length), fitness: chromosome.fitness});
        }
        //------------------------------------------------------------------------------------------


        //Дальше сам алгоритм
        let it = 0;
        let bestFitness = Infinity;
        let bestCode = "";

        while (it < NumberOfGenerations) {
            it++;

            //создаем потомков в количестве NumberOfDescendants:

            for (let createdDescendants = 0; createdDescendants < NumberOfDescendants; createdDescendants += 2) {
                //Берем 2 случайных хромосомы(a, b) из популяции и скрещиваем их, получая потомков(descendant1,2)
                let v1 = getRandomInt(0, population.length);
                let v2 = getRandomInt(0, population.length);





                //ВНИМАНИЕ!!!!!!!!!!!!!!!
                //НЕ ЗАБЫТЬ ДОБАВИТЬ РАЗНЫЕ РЕЖИМА РАЗРЕЗА ХРОМОСОМЫ!!!!!!!!!!





                //случайное место разреза хромосомы
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


                //------------------------------------------------------------------------------------------
                //Мутация
                if (Math.random() < MutationPercent) {
                    descendant1.arr[getRandomInt(0, descendant1.arr.length)] = getRandomInt(0, functionsArray.length);
                }
                if (Math.random() < MutationPercent) {
                    descendant2.arr[getRandomInt(0, descendant2.arr.length)] = getRandomInt(0, functionsArray.length);
                }
                //------------------------------------------------------------------------------------------

                descendant1.arr.sort(function (a, b) {
                    return a - b
                });
                descendant2.arr.sort(function (a, b) {
                    return a - b
                });

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

            //вывод нового лучшего результата
            if (population[0].fitness < bestFitness) {
                bestFitness = population[0].fitness;
                bestCode = findFitness(population[0]);
                mainText.textContent = it.toString();
                mainText.textContent += ' ' + population[0].fitness;
                mainText.textContent += ' ' + bestCode;
            }
        }
    }
});