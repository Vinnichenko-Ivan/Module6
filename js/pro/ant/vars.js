export class Variables {

    // ЭЛЕМЕНТИКИ
    MyCanvas = document.getElementById("myCanvas");
    ctx = this.MyCanvas.getContext('2d');
    ExtraCanvas1 = document.getElementById("extraCanvas1");
    extraCtx1 = this.ExtraCanvas1.getContext('2d');
    ExtraCanvas2 = document.getElementById("extraCanvas2");
    extraCtx2 = this.ExtraCanvas2.getContext('2d');

    // САМАЯ ВАЖНАЯ ВЕЩЬ!!! ПОЗВОЛЯЕТ УВЕЛИЧИТЬ ФПС!!!
    mapPixelScale = 10;//каждый i-ый пиксель хранит объект, остальные - лишь картинка
    mapPheromoneScale = 10;//то же самое, но уже для феромонов

    //MODAL WINDOW
    modalWindowMode = false;//false - не открыто, true - открыто

    //ANTS
    antsNumber = 200;
    antStepLength = 1.5;
    firstStepLength = 2;
    radiusOfAntsEyes = 5;
    constForDistanceFromHome = 1000;
    ants = new Array(this.antsNumber);
    anthill = {
        isBuilt: false,
        radius: 20,
        x: -1,
        y: -1,
        color: "#ff4f3f",
        borderColor: "black"
    }

    //PHEROMONES
    minPheromoneValue = 0.000001;
    minPheromoneValueForDrawing = 300;
    minDistanceToAnthill = 1;
    pheromonesDrawingMode = 1;//1 - качественная отрисовка, 2 - количественная
    pheromonesDecreasingCoefficient = 0.97;

    //HOW OFTEN
    howOftenToRedrawPheromones = 5;
    howOftenToUpdateAntsDirectionByPheromones = 10;
    howOftenToLeavePheromones = 5;
    howOftenToChooseGoodPath = 0.95;

    //MAIN
    mainObjects;
    pheromones;
    somethingChanged = true;//делаем перерисовку фона только тогда, когда на нем что-то поменялось

    constructor() {
        this.mainObjects = new Array(this.MyCanvas.width / this.mapPixelScale);
        this.pheromones = new Array(this.MyCanvas.width / this.mapPheromoneScale);
    }
}

export const vars = new Variables();
