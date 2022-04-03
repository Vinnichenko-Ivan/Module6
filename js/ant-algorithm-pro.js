import {updateCtx, updateExtraCtx1, updateExtraCtx2} from "./ant-algorithm-pro-extra1.js";

window.addEventListener("load", function onWindowLoad() {

    let MyCanvas = document.getElementById("myCanvas");
    let ctx = MyCanvas.getContext('2d');
    let ExtraCanvas1 = document.getElementById("extraCanvas1");
    let extraCtx1 = ExtraCanvas1.getContext('2d');
    let ExtraCanvas2 = document.getElementById("extraCanvas2");
    let extraCtx2 = ExtraCanvas2.getContext('2d');

    //САМАЯ ВАЖНАЯ ВЕЩЬ!!! ПОЗВОЛЯЕТ УВЕЛИЧИТЬ ФПС!!!
    let mapPixelScale = 10;//каждый i-ый пиксель хранит объект, остальные - лишь картинка
    let mapPheromoneScale = 10;//то же самое, но уже для феромонов

    //ANTS
    let antsNumber = 200;
    let antStepLength = 1.5;
    let firstStepLength = 2;
    let radiusOfAntsEyes = 5;
    let constForDistanceFromHome = 1000;

    //PHEROMONES
    let minPheromoneValue = 0.000001;
    let minDistanceToAnthill = 1;
    let pheromonesDrawingMode = 2;//1 - качественная отрисовка, 2 - количественная
    let pheromonesDecreasingCoefficient = 0.97;


    //HOW OFTEN
    let howOftenToRedrawPheromones = 5;
    let howOftenToUpdateAntsDirectionByPheromones = 10;
    let howOftenToLeavePheromones = 5;
    let howOftenToChooseGoodPath = 0.95;

    //MAIN
    let mainObjects = new Array(MyCanvas.width / mapPixelScale);
    let pheromones = new Array(MyCanvas.width / mapPheromoneScale);
    let somethingChanged = true;//делаем перерисовку фона только тогда, когда на нем что-то поменялось

    let ants = new Array(antsNumber);
    let anthill = {
        isBuilt: false,
        radius: 20,
        x: -1,
        y: -1,
        color: "#ff4f3f",
        borderColor: "black"
    }


    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~СТЕНЫ и ЕДА~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    for (let i = 0; i < mainObjects.length; i++) {
        mainObjects[i] = new Array(MyCanvas.height / mapPixelScale);
        for (let j = 0; j < mainObjects[i].length; j++)
            mainObjects[i][j] = {
                notEmpty: false,
                x: i * mapPixelScale,
                y: j * mapPixelScale,
                food: 0,
                wall: false,
                next: function () {
                    if (this.wall) {

                        //СТЕНА
                        extraCtx1.fillStyle = "gray";
                        extraCtx1.fillRect(this.x, this.y, mapPixelScale, mapPixelScale);

                    } else if (this.food > 0) {

                        //ЕДА
                        if (this.food < 16) {
                            extraCtx1.strokeStyle = `#000${(this.food).toString(16)}00`;
                            extraCtx1.fillStyle = `#000${(this.food).toString(16)}00`;
                        } else {
                            extraCtx1.strokeStyle = `#00${(this.food).toString(16)}00`;
                            extraCtx1.fillStyle = `#00${(this.food).toString(16)}00`;
                        }
                        extraCtx1.beginPath();
                        extraCtx1.arc(this.x + mapPixelScale / 2, this.y + mapPixelScale / 2, mapPixelScale / 2, 0, Math.PI * 2, false);
                        extraCtx1.closePath();
                        extraCtx1.fill();
                        extraCtx1.stroke();
                    }
                }
            }
    }
    for (let i = 0; i < mainObjects.length; i++) {
        mainObjects[i][0].notEmpty = true;
        mainObjects[i][0].wall = true;
        mainObjects[i][mainObjects[i].length - 1].notEmpty = true;
        mainObjects[i][mainObjects[i].length - 1].wall = true;
    }
    for (let i = 0; i < mainObjects[0].length; i++) {
        mainObjects[0][i].notEmpty = true;
        mainObjects[0][i].wall = true;
        mainObjects[mainObjects.length - 1][i].notEmpty = true;
        mainObjects[mainObjects.length - 1][i].wall = true;
    }


    //------------------------------------
    //------------------------------------
    //~~~~~~~~~~~~~~ФЕРОМОНЫ~~~~~~~~~~~~~~
    for (let i = 0; i < pheromones.length; i++) {
        pheromones[i] = new Array(MyCanvas.height / mapPheromoneScale);
        for (let j = 0; j < pheromones[i].length; j++) {
            pheromones[i][j] = {
                notEmpty: false,
                x: i * mapPheromoneScale,
                y: j * mapPheromoneScale,
                toHomePheromones: 0,
                toFoodPheromones: 0,
                next: function () {
                    if (this.notEmpty) {
                        this.toHomePheromones *= pheromonesDecreasingCoefficient;
                        this.toFoodPheromones *= pheromonesDecreasingCoefficient;

                        if (this.toHomePheromones < minPheromoneValue)
                            this.toHomePheromones = 0;
                        if (this.toFoodPheromones < minPheromoneValue)
                            this.toFoodPheromones = 0;

                        if (this.toFoodPheromones === 0 && this.toHomePheromones === 0)
                            this.notEmpty = false;
                    }
                }
            }
        }
    }


    //-------------------------------------------------------------
    //-------------------------------------------------------------
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~МУРАВЬИ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    function initAnts() {
        for (let i = 0; i < ants.length; i++) {
            let r1 = Math.random() * 2 - 1;
            let r2 = Math.random() * 2 - 1;
            ants[i] = {
                it: 0,
                distanceFromHome: 1,
                distanceFromFood: 1,
                chosenPheromoneI: -1,
                chosenPheromoneJ: -1,
                Vx: r1,
                Vy: r2,
                Food: 0,
                x: anthill.x + (r1 * (anthill.radius + firstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2)),
                y: anthill.y + (r2 * (anthill.radius + firstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2)),
                next: function () {

                    this.it = (this.it + 1) % 1000000;

                    //СИНУСОИДАЛЬНОЕ ДВИЖЕНИЕ
                    /*if(this.it%1 === 0) {
                        this.x += 0.5 * Math.sin(0.03*this.it) * Math.cos(90-Math.PI*(this.Vy/this.Vx));
                        this.y += 0.5 * Math.sin(0.03*this.it) * Math.sin(90-Math.PI*(this.Vy/this.Vx));
                    }*/


                    //УБИТЬ МУРАВЬЯ, ЕСЛИ ЗАЛЕЗ, КУДА НЕ НАДО
                    if (this.x < 0 || this.y < 0 || this.x > MyCanvas.offsetWidth || this.y > MyCanvas.offsetHeight || (Math.sqrt((this.x - anthill.x) ** 2 + (this.y - anthill.y) ** 2) - anthill.radius < 0)) {
                        let r1 = Math.random() * 2 - 1;
                        let r2 = Math.random() * 2 - 1;
                        this.it = 0;
                        this.distanceFromHome = 1;
                        this.distanceFromFood = 1;
                        this.chosenPheromoneI = -1;
                        this.chosenPheromoneJ = -1;
                        this.Vx = r1;
                        this.Vy = r2;
                        this.Food = 0;
                        this.x = anthill.x + (r1 * (anthill.radius + firstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2));
                        this.y = anthill.y + (r2 * (anthill.radius + firstStepLength)) / (Math.sqrt(r1 ** 2 + r2 ** 2));
                    }

                    //СТОЛКНОВЕНИЕ С МУРАВЕЙНИКОМ
                    if (Math.sqrt((this.x - anthill.x) ** 2 + (this.y - anthill.y) ** 2) - anthill.radius <= minDistanceToAnthill) {
                        this.Vx *= -1;
                        this.Vy *= -1;
                        if (this.Food) {
                            this.distanceFromHome = 1;
                            this.distanceFromFood = 1;
                            this.chosenPheromoneI = -1;
                            this.chosenPheromoneJ = -1;
                        }
                        this.x += (Math.random() - 0.5)/4 + (this.Vx * antStepLength * 2) / (Math.sqrt(this.Vx ** 2 + this.Vy ** 2));
                        this.y += (Math.random() - 0.5)/4 + (this.Vy * antStepLength * 2) / (Math.sqrt(this.Vx ** 2 + this.Vy ** 2));
                        this.Food = 0;
                    } else {

                        //КОРРЕКТИРОВКА НАПРАВЛЕНИЯ ДВИЖЕНИЯ
                        let x = this.x, y = this.y;
                        let i = Math.floor(x / mapPixelScale);
                        let j = Math.floor(y / mapPixelScale);
                        if (mainObjects[i][j].notEmpty) {

                            //ЕСЛИ ВРЕЗАЛСЯ В ЕДУ
                            if (mainObjects[i][j].food && this.Food === 0) {
                                this.distanceFromHome = 1;
                                this.distanceFromFood = 1;
                                this.chosenPheromoneI = -1;
                                this.chosenPheromoneJ = -1;
                                this.Food = mainObjects[i][j].food;
                                mainObjects[i][j].food = Math.max(0, mainObjects[i][j].food - 10);
                                if (mainObjects[i][j].food === 0)
                                    mainObjects[i][j].notEmpty = false;
                                somethingChanged = true;
                            }

                            //КОГДА ВО ЧТО-ТО ВРЕЗАЛСЯ, ТО ОТКЛОНИТЬСЯ В ПРАВИЛЬНУЮ СТОРОНУ
                            x += (this.Vx * (-1) * antStepLength) / (Math.sqrt(this.Vx ** 2 + this.Vy ** 2));
                            y += (this.Vy * antStepLength) / (Math.sqrt(this.Vx ** 2 + this.Vy ** 2));
                            i = Math.floor(x / mapPixelScale);
                            j = Math.floor(y / mapPixelScale);
                            if (i >= 0 && j >= 0 && !mainObjects[i][j].notEmpty)
                                this.Vx *= -1;
                            else {
                                x = this.x;
                                y = this.y;
                                x += (this.Vx * antStepLength) / (Math.sqrt(this.Vx ** 2 + this.Vy ** 2));
                                y += (this.Vy * (-1) * antStepLength) / (Math.sqrt(this.Vx ** 2 + this.Vy ** 2));
                                i = Math.floor(x / mapPixelScale);
                                j = Math.floor(y / mapPixelScale);
                                if (i >= 0 && j >= 0 && !mainObjects[i][j].notEmpty)
                                    this.Vy *= -1;
                                else {
                                    this.Vx *= -1;
                                    this.Vy *= -1;
                                }
                            }
                        } else {

                            //ПРОАНАЛИЗИРОВАТЬ БЛИЗЛЕЖАЩИЕ ФЕРОМОНЫ
                            //ВЫБРАТЬ ЛУЧШИЙ И С БОЛЬШОЙ ВЕРОЯТНОСТЬЮ ПОВЕРНУТЬСЯ К НЕМУ
                            if (this.it % howOftenToUpdateAntsDirectionByPheromones === 0) {
                                x = this.x;
                                y = this.y;
                                i = Math.floor(x / mapPheromoneScale);
                                j = Math.floor(y / mapPheromoneScale);

                                let iBestPheromone = -1, jBestPheromone = -1;
                                for (let ii = i - radiusOfAntsEyes; ii < i + radiusOfAntsEyes; ii++) {
                                    for (let jj = j - radiusOfAntsEyes; jj < j + radiusOfAntsEyes; jj++) {
                                        if (ii >= 0 && jj >= 0 && ii < pheromones.length && jj < pheromones[0].length && pheromones[ii][jj].notEmpty && ((this.Food && pheromones[i][j].toHomePheromones) || (!this.Food && pheromones[i][j].toFoodPheromones))) {
                                            if((Math.abs(this.Vx/this.Vy) > 1 && i*ii > 0)||(Math.abs(this.Vy/this.Vx) > 1 && j*jj > 0)) {//это проверка, чтобы не оборачивался муравей
                                                if (this.Food) {
                                                    if (iBestPheromone === -1 || (pheromones[ii][jj].toHomePheromones > pheromones[iBestPheromone][jBestPheromone].toHomePheromones)) {
                                                        iBestPheromone = ii;
                                                        jBestPheromone = jj;
                                                    }
                                                } else {
                                                    if (iBestPheromone === -1 || (pheromones[ii][jj].toFoodPheromones > pheromones[iBestPheromone][jBestPheromone].toFoodPheromones)) {
                                                        iBestPheromone = ii;
                                                        jBestPheromone = jj;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (iBestPheromone !== -1 && !(Math.abs(iBestPheromone - this.chosenPheromoneI)<5 && Math.abs(jBestPheromone - this.chosenPheromoneJ)<5)) {
                                    if (Math.random() < howOftenToChooseGoodPath) {
                                        this.Vx = (iBestPheromone + 1) * mapPheromoneScale - this.x;
                                        this.Vy = (jBestPheromone + 1) * mapPheromoneScale - this.y;
                                        this.chosenPheromoneI = iBestPheromone;
                                        this.chosenPheromoneJ = jBestPheromone;
                                    }
                                }

                                //ПРОВЕРКА, ВИДИТ ЛИ ОН УЖЕ МУРАВЕЙНИК
                                if (this.Food && (Math.sqrt((this.x - anthill.x) ** 2 + (this.y - anthill.y) ** 2) - anthill.radius < radiusOfAntsEyes * mapPixelScale)) {
                                    if (Math.random() < howOftenToChooseGoodPath) {
                                        this.Vx = anthill.x - this.x;
                                        this.Vy = anthill.y - this.y;
                                    }
                                }

                                //ПРОВЕРКА, ВИДИТ ЛИ ОН УЖЕ ЕДУ
                                if (!this.Food) {
                                    x = this.x;
                                    y = this.y;
                                    i = Math.floor(x / mapPixelScale);
                                    j = Math.floor(y / mapPixelScale);
                                    let iBestFood = -1, jBestFood = -1;
                                    for (let ii = i - radiusOfAntsEyes; ii < i + radiusOfAntsEyes; ii++) {
                                        for (let jj = j - radiusOfAntsEyes; jj < j + radiusOfAntsEyes; jj++) {
                                            if (ii >= 0 && jj >= 0 && ii < mainObjects.length && jj < mainObjects[0].length && mainObjects[ii][jj].Food) {
                                                if (iBestPheromone === -1 || (mainObjects[ii][jj].Food > mainObjects[iBestFood][jBestFood].Food)) {
                                                    iBestFood = ii;
                                                    jBestFood = jj;
                                                }
                                            }
                                        }
                                    }
                                    if (iBestFood !== -1) {
                                        if (Math.random() < howOftenToChooseGoodPath) {
                                            this.Vx = (iBestFood + 1) * mapPixelScale - this.x;
                                            this.Vy = (jBestFood + 1) * mapPixelScale - this.y;
                                        }
                                    }
                                }
                            }

                            if (this.it % howOftenToLeavePheromones === 0) {

                                //ОСТАВЛЕНИЕ ФЕРОМОНОВ
                                x = this.x;
                                y = this.y;
                                i = Math.floor(x / mapPheromoneScale);
                                j = Math.floor(y / mapPheromoneScale);

                                if (i >= 0 && j >= 0 && (!mainObjects[Math.floor(x / mapPixelScale) - 1][Math.floor(y / mapPixelScale) - 1].notEmpty) && ((this.Food && this.distanceFromFood > 0.000001) || (!this.Food && this.distanceFromHome > 0.000001))) {
                                    if (this.Food)
                                        pheromones[i][j].toFoodPheromones = Math.min(100000, pheromones[i][j].toFoodPheromones + 1.5 * (this.Food ** 2) * this.distanceFromFood);
                                    else
                                        pheromones[i][j].toHomePheromones = Math.min(100000, pheromones[i][j].toHomePheromones + 1.5 * constForDistanceFromHome * this.distanceFromHome);
                                    pheromones[i][j].notEmpty = true;

                                    //РЕГУЛИРОВАТЬ ИСПАРЕНИЕ ФЕРОМОНОВ
                                    if (this.Food) {
                                        this.distanceFromFood *= 0.95;
                                    } else {
                                        this.distanceFromHome *= 0.95;
                                    }
                                }
                            }
                        }
                    }

                    this.x += (Math.random() - 0.5)/4 + (this.Vx * antStepLength) / (Math.sqrt(this.Vx ** 2 + this.Vy ** 2));
                    this.y += (Math.random() - 0.5)/4+ (this.Vy * antStepLength) / (Math.sqrt(this.Vx ** 2 + this.Vy ** 2));
                }
            }
        }
    }


    let clearButton = document.getElementById("clear");
    let foodButton = document.getElementById("food");
    let wallsButton = document.getElementById("walls");
    let antsButton = document.getElementById("ants");
    let eraseButton = document.getElementById("erase");

    let brushWidth = document.getElementById("brushWidth");

    let drawingMode = new Array(4);//0 - еда, 1 - стены, 2 - муравьи, 3 - ластик


    //---------------------------------------------------------
    //---------------------------------------------------------
    //~~~~~~~~~~~~~~~~~~~ОБРАБОТЧИКИ НАЖАТИЙ~~~~~~~~~~~~~~~~~~~

    clearButton.onclick = function () {
        for (let i = 1; i < mainObjects.length - 1; i++) {
            for (let j = 1; j < mainObjects[i].length - 1; j++) {
                mainObjects[i][j].notEmpty = false;
                mainObjects[i][j].wall = false;
                mainObjects[i][j].food = 0;
            }
        }
        for (let i = 0; i < pheromones.length; i++) {
            for (let j = 0; j < pheromones[i].length; j++) {
                pheromones[i][j].notEmpty = false;
                pheromones[i][j].toHomePheromones = 0;
                pheromones[i][j].toFoodPheromones = 0;
            }
        }

        drawingMode[0] = false;
        drawingMode[1] = false;
        drawingMode[2] = false;
        drawingMode[3] = false;

        anthill.isBuilt = false;

        somethingChanged = true;
    }

    foodButton.onclick = function () {
        drawingMode[0] = true;
        drawingMode[1] = false;
        drawingMode[2] = false;
        drawingMode[3] = false;
    }
    wallsButton.onclick = function () {
        drawingMode[0] = false;
        drawingMode[1] = true;
        drawingMode[2] = false;
        drawingMode[3] = false;
    }
    antsButton.onclick = function () {
        drawingMode[0] = false;
        drawingMode[1] = false;
        drawingMode[2] = true;
        drawingMode[3] = false;
    }
    eraseButton.onclick = function () {
        drawingMode[0] = false;
        drawingMode[1] = false;
        drawingMode[2] = false;
        drawingMode[3] = true;
    }

    MyCanvas.onmousemove = function (e) {
        if (e.buttons > 0 && e.offsetX >= 0 && e.offsetY >= 0 && e.offsetX <= MyCanvas.width && e.offsetY <= MyCanvas.height) {
            if (drawingMode[0]) {

                //ЕДА!!!
                let x = Math.floor(e.offsetX / mapPixelScale);
                let y = Math.floor(e.offsetY / mapPixelScale);

                let width = brushWidth.value;

                for (let i = Math.max(0, x - Math.floor(width / mapPixelScale)); i < Math.min(MyCanvas.width / mapPixelScale, x + Math.floor(width / mapPixelScale)); i++) {
                    for (let j = Math.max(0, y - Math.floor(width / mapPixelScale)); j < Math.min(MyCanvas.height / mapPixelScale, y + Math.floor(width / mapPixelScale)); j++) {
                        if (!mainObjects[i][j].wall) {
                            mainObjects[i][j].food = Math.min(255, mainObjects[i][j].food + 6);
                            mainObjects[i][j].notEmpty = true;
                        }
                    }
                }
                somethingChanged = true;

            } else if (drawingMode[1]) {

                //СТЕНА!!!
                let x = Math.floor(e.offsetX / mapPixelScale);
                let y = Math.floor(e.offsetY / mapPixelScale);

                let width = brushWidth.value;

                for (let i = Math.max(0, x - Math.floor(width / mapPixelScale)); i < Math.min(MyCanvas.width / mapPixelScale, x + Math.floor(width / mapPixelScale)); i++) {
                    for (let j = Math.max(0, y - Math.floor(width / mapPixelScale)); j < Math.min(MyCanvas.height / mapPixelScale, y + Math.floor(width / mapPixelScale)); j++) {
                        mainObjects[i][j].wall = true;
                        mainObjects[i][j].food = 0;
                        mainObjects[i][j].toFoodPheromones = 0;
                        mainObjects[i][j].toHomePheromones = 0;
                        mainObjects[i][j].notEmpty = true;
                    }
                }
                somethingChanged = true;

            } else if (drawingMode[3]) {

                //ЛАСТИК!!!
                let x = Math.floor(e.offsetX / mapPixelScale);
                let y = Math.floor(e.offsetY / mapPixelScale);

                let width = brushWidth.value;

                for (let i = Math.max(0, x - Math.floor(width / mapPixelScale)); i < Math.min(MyCanvas.width / mapPixelScale, x + Math.floor(width / mapPixelScale)); i++) {
                    for (let j = Math.max(0, y - Math.floor(width / mapPixelScale)); j < Math.min(MyCanvas.height / mapPixelScale, y + Math.floor(width / mapPixelScale)); j++) {
                        if (i !== 0 && j !== 0 && i !== mainObjects.length - 1 && j !== mainObjects[0].length - 1) {
                            mainObjects[i][j].notEmpty = false;
                            mainObjects[i][j].wall = false;
                            mainObjects[i][j].food = 0;
                        }
                    }
                }
                somethingChanged = true;
            }
        }
    };


    MyCanvas.onmousedown = function (e) {
        if (drawingMode[2]) {

            //СПАВН КОЛОНИИ!!!
            if (!anthill.isBuilt && e.offsetX > anthill.radius * 2 && e.offsetY > anthill.radius * 2 && e.offsetX < MyCanvas.width - anthill.radius * 2 && e.offsetY < MyCanvas.height - anthill.radius * 2) {
                anthill.isBuilt = true;
                anthill.x = e.offsetX;
                anthill.y = e.offsetY;

                initAnts();
                somethingChanged = true;
            }
        }
    }


    //----------------------------------------------------
    //----------------------------------------------------
    //~~~~~~~~~~~~~~~ОТРИСОВКА И ПЕРЕРАСЧЕТ~~~~~~~~~~~~~~~
    let it = 0;
    setInterval(function () {

        it = (it + 1) % howOftenToRedrawPheromones;

        if (somethingChanged)
            updateExtraCtx1(MyCanvas, extraCtx1, mainObjects, anthill);
        somethingChanged = false;

        if (it === 0)
            updateExtraCtx2(MyCanvas, extraCtx2, pheromones, pheromonesDrawingMode);

        updateCtx(MyCanvas, ctx, anthill, ants, ExtraCanvas1, ExtraCanvas2);
    }, 0);
});