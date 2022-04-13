let drawCenters = true;

let drawLines = true

let autoRun = true

let weight = 400;
let height = 400;

let globalClusterCount = 4;

let colorIndex = [];
colorIndex.push('red')
colorIndex.push('yellow')
colorIndex.push('green')
colorIndex.push('blue')
colorIndex.push('brown')

let defColor = 'white'

//https://habr.com/ru/post/585034/
class Point{
    x = 0.0;
    y = 0.0;
    id = -1;
    color = defColor;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function lenBetweenPoints(a, b){
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y))
}

class Field{
    points = [];
    clusterCount = 0;
    clusterCenters = []
    addPoint(point){
        this.points.push(point)
    }

    rerun(){
        this.clusterCenters = []
        this.clusterCount = 0
        this.points.forEach(function (point){
            point.color = defColor
            point.id = -1;
        });
    }

    clear(){
        this.points = []
    }
}

function randDouble(min, max){
    return Math.random() * (max - min)
}

function dataDist(area){
    area.points.forEach(function (point, j){
        let minD = 1000000;
        let index = 0
        area.clusterCenters.forEach(function (cl, i){
            if(lenBetweenPoints(cl, point) < minD){
                index = i;
                minD = lenBetweenPoints(cl, point)
            }
        })
        area.points[j].color = colorIndex[index]
        area.points[j].id = index
    })
}

function newClusterCenters(area){
    let clusterCentersCopy = []
    let newClusterCentersCounts = []
    for (let i = 0; i < area.clusterCount; i++)
    {
        clusterCentersCopy.push(new Point(area.clusterCenters[i].x,  area.clusterCenters[i].y))
        area.clusterCenters[i].x = 0
        area.clusterCenters[i].y = 0
        newClusterCentersCounts.push(0);

    }
    area.points.forEach(function (point){
        area.clusterCenters[point.id].x += point.x;
        area.clusterCenters[point.id].y += point.y;
        newClusterCentersCounts[point.id]++;
    })
    for (let i = 0; i < area.clusterCount; i++)
    {
        if(newClusterCentersCounts[i] === 0) {
            area.clusterCenters[i].x = clusterCentersCopy[i].x;
            area.clusterCenters[i].y = clusterCentersCopy[i].y;
        }
        else {
            area.clusterCenters[i].x /= newClusterCentersCounts[i];
            area.clusterCenters[i].y /= newClusterCentersCounts[i];
        }
    }

}

function clusterInit(clusterCount, area){
    area.clusterCount = clusterCount
    for (let i = 0; i < clusterCount; i++) {
        area.clusterCenters.push(new Point(randDouble(0, weight), randDouble(0, height)));
    }
}

const checkBoxLineToCenter = document.getElementById('linesToCentres')
const checkBoxAutoRun = document.getElementById('autoRun')
const checkBoxClusterCentres = document.getElementById('clusterCenters')
const buttonClear = document.getElementById('clear')
const buttonRerun = document.getElementById('rerun')
const buttonIter = document.getElementById('iter')
const clusterCount = document.getElementById('CCount');
const canvas = document.getElementById('mainField');
const context =canvas.getContext('2d');

checkBoxAutoRun.checked = autoRun
checkBoxClusterCentres.checked = drawCenters
checkBoxLineToCenter.checked = drawLines

weight = canvas.width;
height = canvas.height;

let mainField = new Field();

function loop() {
    requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height)

    if(autoRun) {
        dataDist(mainField)
        newClusterCenters(mainField)
    }

    mainField.points.forEach(function (point){
        context.fillStyle = point.color
        context.fillRect(point.x - 1, point.y - 1, 2, 2);
    });

    if(drawCenters){
        mainField.clusterCenters.forEach(function (point, index){
            context.fillStyle = colorIndex[index]
            context.fillRect(point.x - 2, point.y - 2, 4, 4);
        });
    }

    if(drawLines){
        mainField.points.forEach(function (point){
            if(point.id !== -1)
            {
                context.strokeStyle = point.color
                context.beginPath();
                context.moveTo(point.x, point.y);
                context.lineTo(mainField.clusterCenters[point.id].x, mainField.clusterCenters[point.id].y);
                context.stroke();
                context.closePath();
            }
        });
    }
}

clusterInit(globalClusterCount, mainField)

canvas.addEventListener('mousedown', function (event) {
    const dx = this.offsetLeft;
    const dy = this.offsetTop;
    if (event.buttons === 1){
        mainField.addPoint(new Point(event.x - dx, event.y - dy))

    }

    if (event.buttons === 4){
        let arrayForDelete = []
        mainField.points.forEach(function (point, index){
            let p = new Point(event.x - dx, event.y - dy)
            console.log(lenBetweenPoints(p, point))
            if(lenBetweenPoints(p, point) < 25) {

                arrayForDelete.push(index)
            }
        });
        arrayForDelete.reverse()
        arrayForDelete.forEach(function (p){
            mainField.points.splice(p, 1);
        })
    }

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


buttonRerun.addEventListener('click', function() {
    mainField.rerun()
    clusterInit(globalClusterCount, mainField)
});

clusterCount.addEventListener('click', function() {
    globalClusterCount = clusterCount.value;
    mainField.rerun()
    clusterInit(globalClusterCount, mainField)
});

buttonClear.addEventListener('click', function() {
    mainField.clear()
});

buttonIter.addEventListener('click', function() {
    dataDist(mainField)
    newClusterCenters(mainField)
});

requestAnimationFrame(loop);