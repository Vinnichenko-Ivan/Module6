let drawCenters = true;
let drawLines = true
let autoRun = true
let weight;
let height;
let globalClusterCount = 4;
let colorIndex = [];
let defColor = 'white'

genRandColor(colorIndex, 100)

const checkBoxLineToCenter = document.getElementById('linesToCentres')
const checkBoxAutoRun = document.getElementById('autoRun')
const checkBoxClusterCentres = document.getElementById('clusterCenters')
const buttonClear = document.getElementById('clear')
const buttonRerun = document.getElementById('rerun')
const buttonIter = document.getElementById('iter')
const clusterCount = document.getElementById('clusterCount');
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

clusterCount.addEventListener('input', function() {
    globalClusterCount = getReal(1,100, false, clusterCount.value);
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