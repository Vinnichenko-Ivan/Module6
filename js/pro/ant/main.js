import {updateCtx, updateExtraCtx1, updateExtraCtx2} from "./draw.js";
import {initAnts, initMainObjects, initPheromones} from "./inits.js";
import {vars} from "./vars.js";

window.addEventListener("load", function onWindowLoad() {

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
        for (let i = 1; i < vars.mainObjects.length - 1; i++) {
            for (let j = 1; j < vars.mainObjects[i].length - 1; j++) {
                vars.mainObjects[i][j].notEmpty = false;
                vars.mainObjects[i][j].wall = false;
                vars.mainObjects[i][j].food = 0;
            }
        }
        for (let i = 0; i < vars.pheromones.length; i++) {
            for (let j = 0; j < vars.pheromones[i].length; j++) {
                vars.pheromones[i][j].notEmpty = false;
                vars.pheromones[i][j].toHomePheromones = 0;
                vars.pheromones[i][j].toFoodPheromones = 0;
            }
        }

        drawingMode[0] = false;
        drawingMode[1] = false;
        drawingMode[2] = false;
        drawingMode[3] = false;

        vars.anthill.isBuilt = false;

        vars.somethingChanged = true;
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

    vars.MyCanvas.onmousemove = function (e) {
        if (e.buttons > 0 && e.offsetX >= 0 && e.offsetY >= 0 && e.offsetX <= vars.MyCanvas.width && e.offsetY <= vars.MyCanvas.height) {
            if (drawingMode[0]) {

                //ЕДА!!!
                let x = Math.floor(e.offsetX / vars.mapPixelScale);
                let y = Math.floor(e.offsetY / vars.mapPixelScale);

                let width = brushWidth.value;

                for (let i = Math.max(0, x - Math.floor(width / vars.mapPixelScale)); i < Math.min(vars.MyCanvas.width / vars.mapPixelScale, x + Math.floor(width / vars.mapPixelScale)); i++) {
                    for (let j = Math.max(0, y - Math.floor(width / vars.mapPixelScale)); j < Math.min(vars.MyCanvas.height / vars.mapPixelScale, y + Math.floor(width / vars.mapPixelScale)); j++) {
                        if (!vars.mainObjects[i][j].wall) {
                            vars.mainObjects[i][j].food = Math.min(255, vars.mainObjects[i][j].food + 6);
                            vars.mainObjects[i][j].notEmpty = true;
                        }
                    }
                }
                vars.somethingChanged = true;

            } else if (drawingMode[1]) {

                //СТЕНА!!!
                let x = Math.floor(e.offsetX / vars.mapPixelScale);
                let y = Math.floor(e.offsetY / vars.mapPixelScale);

                let width = brushWidth.value;

                for (let i = Math.max(0, x - Math.floor(width / vars.mapPixelScale)); i < Math.min(vars.MyCanvas.width / vars.mapPixelScale, x + Math.floor(width / vars.mapPixelScale)); i++) {
                    for (let j = Math.max(0, y - Math.floor(width / vars.mapPixelScale)); j < Math.min(vars.MyCanvas.height / vars.mapPixelScale, y + Math.floor(width / vars.mapPixelScale)); j++) {
                        vars.mainObjects[i][j].wall = true;
                        vars.mainObjects[i][j].food = 0;
                        vars.mainObjects[i][j].toFoodPheromones = 0;
                        vars.mainObjects[i][j].toHomePheromones = 0;
                        vars.mainObjects[i][j].notEmpty = true;
                    }
                }
                vars.somethingChanged = true;

            } else if (drawingMode[3]) {

                //ЛАСТИК!!!
                let x = Math.floor(e.offsetX / vars.mapPixelScale);
                let y = Math.floor(e.offsetY / vars.mapPixelScale);

                let width = brushWidth.value;

                for (let i = Math.max(0, x - Math.floor(width / vars.mapPixelScale)); i < Math.min(vars.MyCanvas.width / vars.mapPixelScale, x + Math.floor(width / vars.mapPixelScale)); i++) {
                    for (let j = Math.max(0, y - Math.floor(width / vars.mapPixelScale)); j < Math.min(vars.MyCanvas.height / vars.mapPixelScale, y + Math.floor(width / vars.mapPixelScale)); j++) {
                        if (i !== 0 && j !== 0 && i !== vars.mainObjects.length - 1 && j !== vars.mainObjects[0].length - 1) {
                            vars.mainObjects[i][j].notEmpty = false;
                            vars.mainObjects[i][j].wall = false;
                            vars.mainObjects[i][j].food = 0;
                        }
                    }
                }
                vars.somethingChanged = true;
            }
        }
    };


    vars.MyCanvas.onmousedown = function (e) {
        if (drawingMode[2]) {

            //СПАВН КОЛОНИИ!!!
            if (!vars.anthill.isBuilt && e.offsetX > vars.anthill.radius * 2 && e.offsetY > vars.anthill.radius * 2 && e.offsetX < vars.MyCanvas.width - vars.anthill.radius * 2 && e.offsetY < vars.MyCanvas.height - vars.anthill.radius * 2) {
                vars.anthill.isBuilt = true;
                vars.anthill.x = e.offsetX;
                vars.anthill.y = e.offsetY;

                initAnts();
                vars.somethingChanged = true;
            }
        }
    }


    //----------------------------------------------------
    //----------------------------------------------------
    //~~~~~~~~~~~~~~~ОТРИСОВКА И ПЕРЕРАСЧЕТ~~~~~~~~~~~~~~~
    let it = 0;
    setInterval(function () {

        it = (it + 1) % vars.howOftenToRedrawPheromones;

        if (vars.somethingChanged)
            updateExtraCtx1();
        vars.somethingChanged = false;

        if (it === 0)
            updateExtraCtx2();

        updateCtx();
    }, 0);
});