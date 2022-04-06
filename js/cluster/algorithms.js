function genRandColor(colors) {
    colors.push('red')
    colors.push('yellow')
    colors.push('green')
    colors.push('blue')
    colors.push('brown')
    while (colors.length < 100) {
        do {
            var color = Math.floor((Math.random() * 1000000) + 1);
        } while (colors.indexOf(color) >= 0);
        colors.push("#" + ("000000" + color.toString(16)).slice(-6));
    }
}

function lenBetweenPoints(a, b){
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y))
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

function sizeOfComp(matrix, point)
{
    let n = matrix.length;
    let matrixPs = new Array(n).fill(0);
    let mass = [];
    mass.push(point);
    matrixPs[point] = 1;
    while(mass.length !== 0)
    {
        let p = mass[mass.length - 1];
        mass.pop();
        for(let i = 0; i < n; i++){
            if(matrixPs[i] === 0 && matrix[p][i] !== 0){
                matrixPs[i] = 1;
                mass.push(i);
            }
        }
    }
    return matrixPs;

}

function compare(a, b) {
    if (a[2] < b[2]) {
        return -1;
    }
    if (a[2] > b[2]) {
        return 1;
    }
    return 0;
}


function graphGenClusterCenters(field){
    let graph = []
    let graphAnswer = []
    let matrix = new Array(field.points.length).fill(0).map( () => new Array(field.points.length).fill(0))
    for(let i = 0; i < field.points.length; i++)
    {
        for(let j = i + 1; j < field.points.length; j++)
        {
            let temp = [i, j, lenBetweenPoints(field.points[i], field.points[j])];
            graph.push(temp)
        }
    }
    graph.sort(compare);
    for(let i = 0; i < graph.length; i++){
        let start = sizeOfComp(matrix, graph[i][0]);
        matrix[graph[i][0]][graph[i][1]] = graph[i][2];
        matrix[graph[i][1]][graph[i][0]] = graph[i][2];
        let end = sizeOfComp(matrix, graph[i][0]);
        if(JSON.stringify(start) === JSON.stringify(end))
        {
            matrix[graph[i][0]][graph[i][1]] = 0;
            matrix[graph[i][0]][graph[i][1]] = 0;
        }
        else
        {
            graphAnswer.push(graph[i]);
        }
    }
    graphAnswer.sort(compare);
    for(let i = 0; i < field.clusterCount - 1; i++)
    {
        graphAnswer.pop();
    }
    matrix = new Array(field.points.length).fill(0).map( () => new Array(field.points.length).fill(0))
    for(let i = 0; i < graphAnswer.length; i++) {
        matrix[graphAnswer[i][0]][graphAnswer[i][1]] = graphAnswer[i][2]
        matrix[graphAnswer[i][1]][graphAnswer[i][0]] = graphAnswer[i][2]
    }

    let flag = new Array(field.points.length).fill(0);
    let counter = 0;
    for(let i = 0; i < field.points.length; i++){
        if(flag[i] === 0) {
            field.clusterCenters[counter].id = counter;
            field.clusterCenters[counter].color = colorIndex[counter];
            let temp1 = sizeOfComp(matrix, i)
            for (let j = 0; j < field.points.length; j++) {
                if(temp1[j] === 1){
                    field.points[j].id = counter;
                    field.points[j].color = colorIndex[counter];
                    flag[j] = 1;
                }
            }
            counter++;
        }
    }

}

function clusterInit(clusterCount, area){
    area.clusterCenters = []
    area.clusterCount = clusterCount
    for (let i = 0; i < clusterCount; i++) {
        area.clusterCenters.push(new Point(randDouble(0, weight), randDouble(0, height)));
    }
}