export class Variables {

    // ЭЛЕМЕНТИКИ
    MyCanvas = document.getElementById("myCanvas");
    ctx = this.MyCanvas.getContext('2d');
    ExtraCanvasForMainObjects = document.getElementById("extraCanvas1");
    extraCtxForMainObjects = this.ExtraCanvasForMainObjects.getContext('2d');
    ExtraCanvasForPheromones = document.getElementById("extraCanvas2");
    extraCtxForPheromones = this.ExtraCanvasForPheromones.getContext('2d');

    // САМАЯ ВАЖНАЯ ВЕЩЬ!!! ПОЗВОЛЯЕТ УВЕЛИЧИТЬ ФПС!!!
    mapPixelScale = 10;//каждый i-ый пиксель хранит объект, остальные - лишь картинка
    mapPheromoneScale = 10;//то же самое, но уже для феромонов

    //MODAL WINDOW
    modalWindowMode = false;//false - не открыто, true - открыто

    //ANTS
    antsNumber = 300;
    antsRadius = 4;
    antStepLength = 1.5;
    firstStepLength = 2;
    radiusOfAntsEyes = 10;
    constForDistanceFromHome = 1000;
    antsColor = '#ff0000';
    ants = [];
    anthill = {
        isBuilt: false,
        radius: 20,
        x: -1,
        y: -1,
        color: '#ff4411',
        borderColor: '#161712'
    }

    //PHEROMONES
    pheromonesRadius = 3;
    minPheromoneValue = 0.000001;
    minPheromoneValueForDrawing = 300;
    minDistanceToAnthill = 1;
    pheromonesDrawingMode = 0;//1 - качественная отрисовка, 2 - количественная
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
