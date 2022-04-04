import {updateCtx, updateExtraCtx1, updateExtraCtx2} from "./draw.js";
import {initAnts, initMainObjects, initPheromones} from "./inits.js";
import {vars} from "./vars.js";

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
    //~~~~~~~~~~~~~~~~СТЕНЫ и ЕДА~~~~~~~~~~~~~~~~
    initMainObjects();

    //------------------------------------
    //~~~~~~~~~~~~~~ФЕРОМОНЫ~~~~~~~~~~~~~~
    initPheromones();

    //-------------------------------------------------------------
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~МУРАВЬИ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    initAnts();


    //---------------------------------------------------------
    //---------------------------------------------------------
    //~~~~~~~~~~~~~~~~~~~ОБРАБОТЧИКИ НАЖАТИЙ~~~~~~~~~~~~~~~~~~~
    let clearButton = document.getElementById("clear");
    let foodButton = document.getElementById("food");
    let wallsButton = document.getElementById("walls");
    let antsButton = document.getElementById("ants");
    let eraseButton = document.getElementById("erase");

    let brushWidth = document.getElementById("brushWidth");

    let drawingMode = new Array(4);//0 - еда, 1 - стены, 2 - муравьи, 3 - ластик

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