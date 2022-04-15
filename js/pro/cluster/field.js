class Field{
    points = [];
    clusterCount = 0;
    clusterCenters = []

    /**
     * Добавление точки
     * @param point точка
     */
    addPoint(point){
        this.points.push(point)
    }

    /**
     * Полный сброс поля.
     */
    rerun(){
        this.clusterCenters = []
        this.clusterCount = 0
        this.points.forEach(function (point){
            point.color = defColor
            point.id = -1;
        });
    }

    /**
     * Удаление точек.
     */
    clear(){
        this.points = []
    }

    /**
     * Копирование без кластеров.
     * @param field Поле откуда копировать.
     */
    copyFromFieldWithoutClusters(field){
        this.points = JSON.parse(JSON.stringify(field.points));
        this.clusterCount = field.clusterCount;
        this.points.forEach(function (point){
            point.id = -1;
            point.color = defColor;
        })
    }
}