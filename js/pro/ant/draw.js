import {vars} from "./vars.js";

//---------------------------------------------------------------
//---------------------------------------------------------------
//~~~~~~~~~~~~~~~~~~~~~~~ФУНКЦИИ ОТРИСОВКИ~~~~~~~~~~~~~~~~~~~~~~~
export function updateCtx() {
    vars.ctx.clearRect(0, 0, vars.MyCanvas.width, vars.MyCanvas.height);
    vars.ctx.drawImage(vars.ExtraCanvasForPheromones, 0, 0);
    vars.ctx.drawImage(vars.ExtraCanvasForMainObjects, 0, 0);

    if (vars.anthill.isBuilt) {
        for (let i = 0; i < vars.ants.length; i++)
            vars.ants[i].next();
        for (let i = 0; i < vars.ants.length; i++) {
            vars.ctx.beginPath();
            vars.ctx.fillStyle = vars.antsColor;
            vars.ctx.strokeStyle = "black";
            vars.ctx.arc(vars.ants[i].x, vars.ants[i].y, vars.antsRadius, 0, Math.PI * 2, false);
            vars.ctx.closePath();
            vars.ctx.fill();
            vars.ctx.stroke();
        }
    }
}

export function updateExtraCtxForMainObjects() {
    vars.extraCtxForMainObjects.clearRect(0, 0, vars.MyCanvas.width, vars.MyCanvas.height);
    for (let i = 0; i < vars.mainObjects.length; i++)
        for (let j = 0; j < vars.mainObjects[i].length; j++)
            if (vars.mainObjects[i][j].notEmpty)
                vars.mainObjects[i][j].next();

    if (vars.anthill.isBuilt) {
        vars.extraCtxForMainObjects.beginPath();
        vars.extraCtxForMainObjects.fillStyle = vars.anthill.color;
        vars.extraCtxForMainObjects.strokeStyle = vars.anthill.borderColor;
        vars.extraCtxForMainObjects.arc(vars.anthill.x, vars.anthill.y, vars.anthill.radius, 0, Math.PI * 2, false);
        vars.extraCtxForMainObjects.closePath();
        vars.extraCtxForMainObjects.fill();
        vars.extraCtxForMainObjects.stroke();
    }
}

export function updateExtraCtxForPheromones() {
    vars.extraCtxForPheromones.clearRect(0, 0, vars.MyCanvas.width, vars.MyCanvas.height);
    for (let i = 0; i < vars.pheromones.length; i++) {
        for (let j = 0; j < vars.pheromones[i].length; j++) {
            vars.pheromones[i][j].next();
            if (vars.pheromones[i][j].notEmpty) {

                if(vars.pheromones[i][j].toHomePheromones + vars.pheromones[i][j].toFoodPheromones < vars.minPheromoneValueForDrawing)
                    continue;

                if (vars.pheromonesDrawingMode === 1) {
                    if (vars.pheromones[i][j].toHomePheromones && vars.pheromones[i][j].toFoodPheromones)
                        vars.extraCtxForPheromones.fillStyle = "#ccee00";
                    else if (vars.pheromones[i][j].toHomePheromones)
                        vars.extraCtxForPheromones.fillStyle = "orange";
                    else
                        vars.extraCtxForPheromones.fillStyle = "green";
                } else if(vars.pheromonesDrawingMode === 2){
                    let toHomeColor, toFoodColor;

                    if (vars.pheromones[i][j].toHomePheromones < 16)
                        toHomeColor = `0${Math.floor(vars.pheromones[i][j].toHomePheromones).toString(16)}`;
                    else
                        toHomeColor = `${Math.min(Math.floor(vars.pheromones[i][j].toHomePheromones), 255).toString(16)}`;

                    if (vars.pheromones[i][j].toFoodPheromones < 16)
                        toFoodColor = `0${Math.floor(vars.pheromones[i][j].toFoodPheromones).toString(16)}`;
                    else
                        toFoodColor = `${Math.min(Math.floor(vars.pheromones[i][j].toFoodPheromones), 255).toString(16)}`;

                    vars.extraCtxForPheromones.fillStyle = `#${toHomeColor}${toFoodColor}00`;
                }
                else
                    continue;

                vars.extraCtxForPheromones.beginPath();
                vars.extraCtxForPheromones.strokeStyle = "black";
                vars.extraCtxForPheromones.arc(vars.pheromones[i][j].x, vars.pheromones[i][j].y, vars.pheromonesRadius, 0, Math.PI * 2, false);
                vars.extraCtxForPheromones.closePath();
                vars.extraCtxForPheromones.fill();
                vars.extraCtxForPheromones.stroke();
            }
        }
    }
}
