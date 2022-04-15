//https://github.com/tayden/dbscanjs/blob/master/index.js
//https://habr.com/ru/post/427761/
//https://en.wikipedia.org/wiki/DBSCAN
//https://en.wikipedia.org/wiki/Cluster_analysis#Fuzzy_c-means_clustering
//https://ru.wikipedia.org/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4_%D0%BD%D0%B5%D1%87%D1%91%D1%82%D0%BA%D0%BE%D0%B9_%D0%BA%D0%BB%D0%B0%D1%81%D1%82%D0%B5%D1%80%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D0%B8_C-%D1%81%D1%80%D0%B5%D0%B4%D0%BD%D0%B8%D1%85

function genRandColor(colors, count) {
    while (colors.length < count) {
        let color;
        do {
            color = Math.trunc((Math.random() * 256 * 256 * 256));
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
        let minD = Infinity;
        let index = 0
        area.clusterCenters.forEach(function (clusterCenter, i){
            if(lenBetweenPoints(clusterCenter, point) < minD){
                index = i;
                minD = lenBetweenPoints(clusterCenter, point)
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
        if(point.id < 0){return}
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
    let matrixTemp = new Array(n).fill(0);
    let mass = [];
    mass.push(point);
    matrixTemp[point] = 1;
    while(mass.length !== 0)
    {
        let p = mass[mass.length - 1];
        mass.pop();
        for(let i = 0; i < n; i++){
            if(matrixTemp[i] === 0 && matrix[p][i] !== 0){
                matrixTemp[i] = 1;
                mass.push(i);
            }
        }
    }
    return matrixTemp;
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

function clusterInitRand(clusterCount, area){
    area.clusterCenters = []
    area.clusterCount = clusterCount
    for (let i = 0; i < clusterCount; i++) {
        area.clusterCenters.push(new Point(randDouble(0, weight), randDouble(0, height)));
    }
}

function clusterInit(clusterCount, area){
    area.clusterCenters = []
    area.clusterCount = clusterCount
    for (let i = 0; i < clusterCount; i++) {
        area.clusterCenters.push(new Point(-5, -5));
    }
}

function dbscanDeep(field, eps, minPointCount, pointIndex, stack)
{
    let point = field.points[pointIndex];
    let nearPointsIndex = []
    field.points.forEach(function (pointTemp, indexTemp){
        if(lenBetweenPoints(pointTemp, point) <= eps && pointIndex !== indexTemp){
            nearPointsIndex.push(indexTemp);
        }
    });

    while(nearPointsIndex.length !== 0)
    {
        let tempPointIndex = nearPointsIndex.pop();
        if(field.points[tempPointIndex].id === -1){
            field.points[tempPointIndex].id = field.points[pointIndex].id;
            field.points[tempPointIndex].color = field.points[pointIndex].color;
            stack.push(tempPointIndex);
        }
    }
}

function dbscan(field, eps, minPointCount){
    let clusterCounter = -1;
    field.rerun();
    field.points.forEach(function (point, index){
        if(point.id === -1){
            let stack = []
            let nearPointsIndex = []
            field.points.forEach(function (pointTemp, indexTemp){
                if(lenBetweenPoints(pointTemp, point) <= eps && index !== indexTemp){
                    nearPointsIndex.push(indexTemp);
                }
            });
            if(nearPointsIndex.length < minPointCount - 1){//-1 because nearPointsIndex dont contain start point
                field.points[index].id = -2; // -2 => noise
                return;
            }
            clusterCounter++;
            if(clusterCounter > colorIndex.length)
            {
                genRandColor(colorIndex, clusterCounter + 100);
            }
            field.points[index].id = clusterCounter;
            field.points[index].color = colorIndex[clusterCounter];

            while(nearPointsIndex.length !== 0)
            {
                let tempPointIndex = nearPointsIndex.pop();
                if(field.points[tempPointIndex].id === -1){
                    field.points[tempPointIndex].id = clusterCounter;
                    field.points[tempPointIndex].color = colorIndex[clusterCounter];
                    stack.push(tempPointIndex)
                }
                else if(field.points[tempPointIndex].id !== -2){
                    continue;
                }
                field.points[tempPointIndex].id = clusterCounter;
                field.points[tempPointIndex].color = colorIndex[clusterCounter];
            }

            while(stack.length > 0)
            {
                dbscanDeep(field, eps, minPointCount, stack.pop(), stack);
            }
        }



    });
    clusterInit(clusterCounter + 1, field)
    newClusterCenters(field);

}

function getReal(min, max, floating, value)
{
    value = Number(value)
    if(value < min)
    {
        alert("НЕЛЬЗЯ! Вы ввели значение меньше минимального.")
    }
    if(value > max)
    {
        alert("НЕЛЬЗЯ! Вы ввели значение больше максимального.")
    }
    if(Number.isInteger(value) === false && floating === false){
        alert("НЕЛЬЗЯ! Дроби нельзя. Поставь целое число. ПЖПЖП....");
    }
    if(floating === false){
        value = Math.floor(value);
    }
    return Math.min(max, Math.max(value, min));
}