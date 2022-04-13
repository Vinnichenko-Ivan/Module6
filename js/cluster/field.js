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

    copyFromFieldWithoutClusters(field){
        this.points = JSON.parse(JSON.stringify(field.points));
        this.clusterCount = field.clusterCount;
        this.points.forEach(function (point){
            point.id = -1;
            point.color = defColor;
        })
        // this.clusterCenters = JSON.parse(JSON.stringify(field.clusterCenters.slice()));
    }
}