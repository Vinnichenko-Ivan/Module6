window.addEventListener("load", function onWindowLoad() {

    let MyCanvas = document.getElementById("myCanvas");
    let ctx = MyCanvas.getContext('2d');

    //САМАЯ ВАЖНАЯ ВЕЩЬ!!! ПОЗВОЛЯЕТ УВЕЛИЧИТЬ ФПС!!!
    let mapPixelScale = 10;//каждый i-ый пиксель хранит объект, остальные - лишь картинка

    let mainObjects = new Array(MyCanvas.width / mapPixelScale);
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
                        ctx.fillStyle = WallsColor;
                        ctx.fillRect(this.x, this.y, mapPixelScale, mapPixelScale);
                        /*ctx.strokeStyle = WallsColor;
                        ctx.fillStyle = WallsColor;
                        ctx.beginPath();
                        ctx.arc(this.x+mapPixelScale/2, this.y+mapPixelScale/2, mapPixelScale/2, 0, Math.PI * 2, false);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();*/
                    }else if(this.food > 0){

                        //ЕДА
                        if(this.food<16){
                            ctx.strokeStyle = `#000${(this.food).toString(16)}00`;
                            ctx.fillStyle = `#000${(this.food).toString(16)}00`;
                        }
                        else {
                            ctx.strokeStyle = `#00${(this.food).toString(16)}00`;
                            ctx.fillStyle = `#00${(this.food).toString(16)}00`;
                        }
                        ctx.beginPath();
                        ctx.arc(this.x+mapPixelScale/2, this.y+mapPixelScale/2, mapPixelScale/2, 0, Math.PI * 2, false);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
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

    const WallsColor = "gray";


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

                for(let i = Math.max(0, x-Math.floor(width/mapPixelScale)); i<Math.min(MyCanvas.width/mapPixelScale, x+Math.floor(width/mapPixelScale)); i++)
                {
                    for(let j = Math.max(0, y-Math.floor(width/mapPixelScale)); j<Math.min(MyCanvas.height/mapPixelScale, y+Math.floor(width/mapPixelScale)); j++)
                    {
                        mainObjects[i][j].food = Math.min(255, mainObjects[i][j].food+6);
                        mainObjects[i][j].notEmpty = true;
                    }
                }

            } else if (drawingMode[1]) {

                //СТЕНА!!!
                let x = Math.floor(e.offsetX / mapPixelScale);
                let y = Math.floor(e.offsetY / mapPixelScale);

                let width = brushWidth.value;

                for(let i = Math.max(0, x-Math.floor(width/mapPixelScale)); i<Math.min(MyCanvas.width/mapPixelScale, x+Math.floor(width/mapPixelScale)); i++)
                {
                    for(let j = Math.max(0, y-Math.floor(width/mapPixelScale)); j<Math.min(MyCanvas.height/mapPixelScale, y+Math.floor(width/mapPixelScale)); j++)
                    {
                        mainObjects[i][j].wall = true;
                        mainObjects[i][j].food = 0;
                        mainObjects[i][j].toFoodPheromones = 0;
                        mainObjects[i][j].toHomePheromones = 0;
                        mainObjects[i][j].notEmpty = true;
                    }
                }

            } else if (drawingMode[2]) {

                //СПАВН КОЛОНИИ!!!

            } else if (drawingMode[3]) {

                //ЛАСТИК!!!
                let x = Math.floor(e.offsetX / mapPixelScale);
                let y = Math.floor(e.offsetY / mapPixelScale);

                let width = brushWidth.value;

                for(let i = Math.max(0, x-Math.floor(width/mapPixelScale)); i<Math.min(MyCanvas.width/mapPixelScale, x+Math.floor(width/mapPixelScale)); i++)
                {
                    for(let j = Math.max(0, y-Math.floor(width/mapPixelScale)); j<Math.min(MyCanvas.height/mapPixelScale, y+Math.floor(width/mapPixelScale)); j++)
                    {
                        mainObjects[i][j].notEmpty = false;
                        mainObjects[i][j].wall = false;
                        mainObjects[i][j].food = 0;
                    }
                }
            }
        }
    };


    //----------------------------------------------------
    //----------------------------------------------------
    //~~~~~~~~~~~~~~~ОТРИСОВКА И ПЕРЕРАСЧЕТ~~~~~~~~~~~~~~~
    setInterval(function () {
        ctx.clearRect(0, 0, MyCanvas.width, MyCanvas.height);
        for (let i = 0; i < mainObjects.length; i++)
            for (let j = 0; j < mainObjects[i].length; j++)
                if (mainObjects[i][j].notEmpty)
                    mainObjects[i][j].next();
    }, 0);
});