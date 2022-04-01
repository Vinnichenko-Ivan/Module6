window.addEventListener("load", function onWindowLoad() {

    let MyCanvas = document.getElementById("myCanvas");
    let ctx = MyCanvas.getContext('2d');
    let ExtraCanvas = document.getElementById("extraCanvas");
    let extraCtx = ExtraCanvas.getContext('2d');

    //САМАЯ ВАЖНАЯ ВЕЩЬ!!! ПОЗВОЛЯЕТ УВЕЛИЧИТЬ ФПС!!!
    let mapPixelScale = 10;//каждый i-ый пиксель хранит объект, остальные - лишь картинка

    let somethingChanged = false;//делаем перерисовку фона только тогда, когда на нем что-то поменялось

    let antStepLength = 1;

    let mainObjects = new Array(MyCanvas.width / mapPixelScale);
    let ants = new Array(100);
    let anthill = {
        isBuilt: false,
        radius: 25,
        x: -1,
        y: -1,
        color: "#ff5f6f",
        borderColor: "#af3f4f"
    }


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
                        extraCtx.fillStyle = "gray";
                        extraCtx.fillRect(this.x, this.y, mapPixelScale, mapPixelScale);
                        /*ctx.strokeStyle = WallsColor;
                        ctx.fillStyle = WallsColor;
                        ctx.beginPath();
                        ctx.arc(this.x+mapPixelScale/2, this.y+mapPixelScale/2, mapPixelScale/2, 0, Math.PI * 2, false);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();*/
                    } else if (this.food > 0) {

                        //ЕДА
                        if (this.food < 16) {
                            extraCtx.strokeStyle = `#000${(this.food).toString(16)}00`;
                            extraCtx.fillStyle = `#000${(this.food).toString(16)}00`;
                        } else {
                            extraCtx.strokeStyle = `#00${(this.food).toString(16)}00`;
                            extraCtx.fillStyle = `#00${(this.food).toString(16)}00`;
                        }
                        extraCtx.beginPath();
                        extraCtx.arc(this.x + mapPixelScale / 2, this.y + mapPixelScale / 2, mapPixelScale / 2, 0, Math.PI * 2, false);
                        extraCtx.closePath();
                        extraCtx.fill();
                        extraCtx.stroke();
                    }
                }
            }
    }


    //-------------------------------------------------------------
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~МУРАВЬИ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    function initAnts() {
        for (let i = 0; i < ants.length; i++) {
            let r1 = Math.random() * 2 - 1;
            let r2 = Math.random() * 2 - 1;
            ants[i] = {
                Vx: r1,
                Vy: r2,
                x: anthill.x + (r1 * anthill.radius) / (Math.sqrt(r1 ** 2 + r2 ** 2)),
                y: anthill.y + (r2 * anthill.radius) / (Math.sqrt(r1 ** 2 + r2 ** 2)),
                next: function () {
                    this.x+=(this.Vx * antStepLength) / (Math.sqrt(this.Vx ** 2 + this.Vy ** 2));
                    this.y+=(this.Vy * antStepLength) / (Math.sqrt(this.Vx ** 2 + this.Vy ** 2));
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
        for (let i = 0; i < mainObjects.length; i++) {
            for (let j = 0; j < mainObjects[i].length; j++) {
                mainObjects[i][j].notEmpty = false;
                mainObjects[i][j].wall = false;
                mainObjects[i][j].food = 0;
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
                        mainObjects[i][j].food = Math.min(255, mainObjects[i][j].food + 6);
                        mainObjects[i][j].notEmpty = true;
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
                        mainObjects[i][j].notEmpty = false;
                        mainObjects[i][j].wall = false;
                        mainObjects[i][j].food = 0;
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


    function drawAnts() {
        for (let i = 0; i < ants.length; i++) {
            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.strokeStyle = "black";
            ctx.arc(ants[i].x, ants[i].y, 2, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }


    //---------------------------------
    //---------------------------------
    //ОТРИСОВКА ВСПОМОГАТЕЛЬНОГО CANVAS
    function updateExtraCtx() {
        extraCtx.clearRect(0, 0, MyCanvas.width, MyCanvas.height);
        for (let i = 0; i < mainObjects.length; i++)
            for (let j = 0; j < mainObjects[i].length; j++)
                if (mainObjects[i][j].notEmpty)
                    mainObjects[i][j].next();

        if (anthill.isBuilt) {
            extraCtx.beginPath();
            extraCtx.fillStyle = anthill.color;
            extraCtx.strokeStyle = anthill.borderColor;
            extraCtx.arc(anthill.x, anthill.y, anthill.radius, 0, Math.PI * 2, false);
            extraCtx.closePath();
            extraCtx.fill();
            extraCtx.stroke();
        }
    }

    //----------------------------------------------------
    //----------------------------------------------------
    //~~~~~~~~~~~~~~~ОТРИСОВКА И ПЕРЕРАСЧЕТ~~~~~~~~~~~~~~~
    setInterval(function () {

        //перерисовка фона, если на нем что-то поменялось
        if (somethingChanged)
            updateExtraCtx();

        somethingChanged = false;

        ctx.clearRect(0, 0, MyCanvas.width, MyCanvas.height);
        ctx.drawImage(ExtraCanvas, 0, 0);

        if (anthill.isBuilt) {
            for (let i = 0; i < ants.length; i++)
                ants[i].next();
            drawAnts();
        }

    }, 0);
});