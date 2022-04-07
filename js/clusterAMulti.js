let drawCenters = true;
let drawLines = true;
let autoRun = true;
let autoRunDbscanFlag = true;
let weight;
let height;
let globalClusterCount = 4;
let colorIndex = [];
let defColor = 'white';
let repeatForKMeans = 5;

genRandColor(colorIndex, 100)

const checkBoxLineToCenter = document.getElementById('linesToCentres');
const checkBoxAutoRun = document.getElementById('autoRun');
const checkBoxClusterCentres = document.getElementById('clusterCenters');
const buttonClear = document.getElementById('clear');
const buttonRerun = document.getElementById('rerun');
const buttonIter = document.getElementById('iter');
const clusterCount = document.getElementById('clusterCount');

const autoRunDbscan = document.getElementById('autoRunDbscan');
const dbscanEps = document.getElementById('dbscanEps');
const dbscanMinPoint = document.getElementById('dbscanMinPoint');

const mainCanvas = document.getElementById('mainField');
const mainContext = mainCanvas.getContext('2d');
const canvas1 = document.getElementById('algo1');
const context1 =canvas1.getContext('2d');
const canvas2 = document.getElementById('algo2');
const context2 =canvas2.getContext('2d');
const canvas3 = document.getElementById('algo3');
const context3 =canvas3.getContext('2d');
const canvas4 = document.getElementById('algo4');
const context4 =canvas4.getContext('2d');

checkBoxAutoRun.checked = autoRun;
checkBoxClusterCentres.checked = drawCenters;
checkBoxLineToCenter.checked = drawLines;
autoRunDbscan.checked = autoRunDbscanFlag;


weight = mainCanvas.width;
height = mainCanvas.height;

let mainField = new Field();

let fieldAlgo1 = new Field();
let fieldAlgo2 = new Field();
let fieldAlgo3 = new Field();
let fieldAlgo4 = new Field();

function drawField(field, context, canvas, scale){
    context.clearRect(0, 0, canvas.width, canvas.height)
    field.points.forEach(function (point){
        context.fillStyle = point.color
        context.fillRect((point.x - 1) * scale, (point.y - 1) * scale, 2, 2);
    });

    if(drawCenters){
        field.clusterCenters.forEach(function (point, index){
            context.fillStyle = colorIndex[index]
            context.fillRect((point.x ) * scale - 2, (point.y) * scale - 2, 4, 4);
        });
    }

    if(drawLines){
        field.points.forEach(function (point){
            if(point.id >= 0)
            {
                context.strokeStyle = point.color;
                context.beginPath();
                context.moveTo((point.x) * scale, (point.y) * scale);
                context.lineTo((field.clusterCenters[point.id].x) * scale, (field.clusterCenters[point.id].y) * scale);
                context.stroke();
                context.closePath();
            }
        });
    }
}

function loop() {
    requestAnimationFrame(loop);
    drawField(mainField, mainContext, mainCanvas, 1);
    drawField(fieldAlgo1, context1, canvas1, 0.5);
    drawField(fieldAlgo2, context2, canvas2, 0.5);
    drawField(fieldAlgo3, context3, canvas3, 0.5);
    drawField(fieldAlgo4, context4, canvas4, 0.5);
    if(autoRun) {
        dataDist(mainField);
        newClusterCenters(mainField);
    }
    if(autoRunDbscanFlag){
        dbscan(fieldAlgo3, getReal(0, 600, true, dbscanEps.value), getReal(1, 100, false, dbscanMinPoint.value));
    }
}

clusterInit(globalClusterCount, mainField);
clusterInit(globalClusterCount, fieldAlgo1);
clusterInit(globalClusterCount, fieldAlgo2);
clusterInit(globalClusterCount, fieldAlgo3);
clusterInit(globalClusterCount, fieldAlgo4);

mainCanvas.addEventListener('mousedown', function (event) {
    const dx = this.offsetLeft;
    const dy = this.offsetTop;
    if (event.buttons === 1){
        mainField.addPoint(new Point(event.x - dx, event.y - dy));

    }

    if (event.buttons === 4){
        let arrayForDelete = []
        mainField.points.forEach(function (point, index){
            let p = new Point(event.x - dx, event.y - dy);
            console.log(lenBetweenPoints(p, point));
            if(lenBetweenPoints(p, point) < 25) {
                arrayForDelete.push(index);
            }
        });
        arrayForDelete.reverse()
        arrayForDelete.forEach(function (p){
            mainField.points.splice(p, 1);
        })
    }
    fieldAlgo1.copyFromFieldWithoutClusters(mainField)
    fieldAlgo2.copyFromFieldWithoutClusters(mainField)
    fieldAlgo3.copyFromFieldWithoutClusters(mainField)
    fieldAlgo4.copyFromFieldWithoutClusters(mainField)
});

checkBoxLineToCenter.addEventListener('change', function() {
    drawLines = this.checked;

});


checkBoxAutoRun.addEventListener('change', function() {
    autoRun = this.checked;
});


checkBoxClusterCentres.addEventListener('change', function() {
    drawCenters = this.checked;
});

autoRunDbscan.addEventListener('change', function() {
    autoRunDbscanFlag = this.checked;
});

buttonRerun.addEventListener('click', function() {
    mainField.rerun()
    fieldAlgo1.rerun()
    fieldAlgo2.rerun()
    fieldAlgo3.rerun()
    fieldAlgo4.rerun()
    clusterInit(globalClusterCount, mainField)
    clusterInit(globalClusterCount, fieldAlgo1)
    clusterInit(globalClusterCount, fieldAlgo2)
    clusterInit(globalClusterCount, fieldAlgo3)
    clusterInit(globalClusterCount, fieldAlgo4)
});

clusterCount.addEventListener('input', function() {
    globalClusterCount = getReal(1,100, false, clusterCount.value);
    mainField.rerun()
    fieldAlgo1.rerun()
    fieldAlgo2.rerun()
    fieldAlgo3.rerun()
    fieldAlgo4.rerun()
    clusterInit(globalClusterCount, mainField)
    clusterInit(globalClusterCount, fieldAlgo1)
    clusterInit(globalClusterCount, fieldAlgo2)
    clusterInit(globalClusterCount, fieldAlgo3)
    clusterInit(globalClusterCount, fieldAlgo4)
});

buttonClear.addEventListener('click', function() {
    mainField.clear()
});

buttonIter.addEventListener('click', function() {
    dataDist(mainField)
    newClusterCenters(mainField)

    graphGenClusterCenters(fieldAlgo1)
    newClusterCenters(fieldAlgo1)

    graphGenClusterCenters(fieldAlgo2)
    newClusterCenters(fieldAlgo2)
    for(let i = 0; i < repeatForKMeans; i++) {
        dataDist(fieldAlgo2)
        newClusterCenters(fieldAlgo2)
    }
    dbscan(fieldAlgo3, getReal(0, 600, true, dbscanEps.value), getReal(1, 100, false, dbscanMinPoint.value))
});

dbscanEps.addEventListener('input', function() {
    dbscan(fieldAlgo3, getReal(0, 600, true, dbscanEps.value), getReal(1, 100, false, dbscanMinPoint.value))
});

dbscanMinPoint.addEventListener('input', function() {
    dbscan(fieldAlgo3, getReal(0, 600, true, dbscanEps.value), getReal(1, 100, false, dbscanMinPoint.value))
});
requestAnimationFrame(loop);