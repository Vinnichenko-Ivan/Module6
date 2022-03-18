
drawCenters = true

xs = 400;
ys = 400;

gk = 4;

colorIndex = [];
colorIndex.push('red')
colorIndex.push('yellow')
colorIndex.push('green')
colorIndex.push('blue')
colorIndex.push('brown')

//https://habr.com/ru/post/585034/
class Point{
    x = 0.0;
    y = 0.0;
    id = 0;
    color = 'white';
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function lenBetweenPoints(a, b){
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y))
}

class Fild{
    points = [];
    k = 0;
    clasterCenters = []
    addPoint(point){
        this.points.push(point)
    }

}

function randDouble(min, max){
    return Math.random() * (max - min)
}

function dataDist(area){
    area.points.forEach(function (point, j){
        let minD = 1000000;
        let index = 0
        area.clasterCenters.forEach(function (cl, i){
            if(lenBetweenPoints(cl, point) < minD){
                index = i;
                minD = lenBetweenPoints(cl, point)
            }
        })
        area.points[j].color = colorIndex[index]
        area.points[j].id = index
    })
}

function newCC(area){
    let clasterCentersCopy = []
    let newCCentersCounts = []
    for (let i = 0; i < area.k; i++)
    {
        clasterCentersCopy.push(new Point(area.clasterCenters[i].x,  area.clasterCenters[i].y))
        area.clasterCenters[i].x = 0
        area.clasterCenters[i].y = 0
        newCCentersCounts.push(0);

    }
    area.points.forEach(function (point, j){
        area.clasterCenters[point.id].x += point.x;
        area.clasterCenters[point.id].y += point.y;
        newCCentersCounts[point.id]++;
    })
    for (let i = 0; i < area.k; i++)
    {
        if(newCCentersCounts[i] === 0) {
            area.clasterCenters[i].x = clasterCentersCopy[i].x;
            area.clasterCenters[i].y = clasterCentersCopy[i].y;
        }
        else {
            area.clasterCenters[i].x /= newCCentersCounts[i];
            area.clasterCenters[i].y /= newCCentersCounts[i];
        }
    }

}

function clInit(k, area){
    area.k = k
    for (let i = 0; i < k; i++) {
        area.clasterCenters.push(new Point(randDouble(0, xs), randDouble(0, ys)));
    }
}

const canvas = document.getElementById('mainFild');
const context = canvas.getContext('2d');

let mainFild = new Fild();

function loop() {
    requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height)

    dataDist(mainFild)
    newCC(mainFild)

    mainFild.points.forEach(function (point, index){
        context.fillStyle = point.color
        context.fillRect(point.x - 1, point.y - 1, 2, 2);
    });

    if(drawCenters){
        mainFild.clasterCenters.forEach(function (point, index){
            context.fillStyle = colorIndex[index]
            context.fillRect(point.x - 2, point.y - 2, 4, 4);
        });
    }
    //context.stroke();
}

clInit(gk, mainFild)

canvas.addEventListener('mousedown', function (event) {
    const dx = this.offsetLeft;
    const dy = this.offsetTop;
    if (event.which === 1){
        mainFild.addPoint(new Point(event.x - dx, event.y - dy))

    }

    if (event.which === 2){
        let arrayForDelete = []
        mainFild.points.forEach(function (point, index){
            let p = new Point(event.x - dx, event.y - dy)
            console.log(lenBetweenPoints(p, point))
            if(lenBetweenPoints(p, point) < 25) {

                arrayForDelete.push(index)
            }
        });
        arrayForDelete.reverse()
        arrayForDelete.forEach(function (p, index){
            mainFild.points.splice(p, 1);
        })
    }


});

requestAnimationFrame(loop);
