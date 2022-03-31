window.addEventListener("load", function onWindowLoad() {

    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext('2d');


    let clearButton = document.getElementById("clear");
    let foodButton = document.getElementById("food");
    let wallsButton = document.getElementById("walls");
    let antsButton = document.getElementById("ants");
    let eraseButton = document.getElementById("erase");

    let drawingMode = new Array(4);//0 - еда, 1 - стены, 2 - муравьи, 3 - ластик

    clearButton.onclick = function (){
        //очистка всего

        drawingMode[0] = 0;
        drawingMode[1] = 0;
        drawingMode[2] = 0;
        drawingMode[3] = 0;
    }

    foodButton.onclick = function (){
        drawingMode[0] = 1;
        drawingMode[1] = 0;
        drawingMode[2] = 0;
        drawingMode[3] = 0;
    }
    wallsButton.onclick = function (){
        drawingMode[0] = 0;
        drawingMode[1] = 1;
        drawingMode[2] = 0;
        drawingMode[3] = 0;
    }
    antsButton.onclick = function (){
        drawingMode[0] = 0;
        drawingMode[1] = 0;
        drawingMode[2] = 1;
        drawingMode[3] = 0;
    }
    eraseButton.onclick = function (){
        drawingMode[0] = 0;
        drawingMode[1] = 0;
        drawingMode[2] = 0;
        drawingMode[3] = 1;
    }

    canvas.onmousedown = function (){
        canvas.onmousemove = function (){

        }
    }






});