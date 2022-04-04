import {vars} from "./vars.js";

//---------------------------------------------------------------
//---------------------------------------------------------------
//~~~~~~~~~~~~~~~~~~~~~~~ФУНКЦИИ ОТРИСОВКИ~~~~~~~~~~~~~~~~~~~~~~~
export function updateCtx() {
    vars.ctx.clearRect(0, 0, vars.MyCanvas.width, vars.MyCanvas.height);
    vars.ctx.drawImage(vars.ExtraCanvas2, 0, 0);
    vars.ctx.drawImage(vars.ExtraCanvas1, 0, 0);

    if (vars.anthill.isBuilt) {
        for (let i = 0; i < vars.ants.length; i++)
            vars.ants[i].next();
        for (let i = 0; i < vars.ants.length; i++) {
            vars.ctx.beginPath();
            vars.ctx.fillStyle = "red";
            vars.ctx.strokeStyle = "black";
            vars.ctx.arc(vars.ants[i].x, vars.ants[i].y, 3, 0, Math.PI * 2, false);
            vars.ctx.closePath();
            vars.ctx.fill();
            vars.ctx.stroke();
        }
    }
}

export function updateExtraCtx1() {
    vars.extraCtx1.clearRect(0, 0, vars.MyCanvas.width, vars.MyCanvas.height);
    for (let i = 0; i < vars.mainObjects.length; i++)
        for (let j = 0; j < vars.mainObjects[i].length; j++)
            if (vars.mainObjects[i][j].notEmpty)
                vars.mainObjects[i][j].next();

    if (vars.anthill.isBuilt) {
        vars.extraCtx1.beginPath();
        vars.extraCtx1.fillStyle = vars.anthill.color;
        vars.extraCtx1.strokeStyle = vars.anthill.borderColor;
        vars.extraCtx1.arc(vars.anthill.x, vars.anthill.y, vars.anthill.radius, 0, Math.PI * 2, false);
        vars.extraCtx1.closePath();
        vars.extraCtx1.fill();
        vars.extraCtx1.stroke();
    }
}

export function updateExtraCtx2() {
    vars.extraCtx2.clearRect(0, 0, vars.MyCanvas.width, vars.MyCanvas.height);
    for (let i = 0; i < vars.pheromones.length; i++) {
        for (let j = 0; j < vars.pheromones[i].length; j++) {
            vars.pheromones[i][j].next();
            if (vars.pheromones[i][j].notEmpty) {

                if(vars.pheromonesDrawingMode === 1){
                    if (vars.pheromones[i][j].toHomePheromones && vars.pheromones[i][j].toFoodPheromones)
                        vars.extraCtx2.fillStyle = "#ccee00";
                    else if (vars.pheromones[i][j].toHomePheromones)
                        vars.extraCtx2.fillStyle = "orange";
                    else
                        vars.extraCtx2.fillStyle = "green";

                }
                else {
                    let toHomeColor, toFoodColor;

                    if (vars.pheromones[i][j].toHomePheromones < 16)
                        toHomeColor = `0${Math.floor(vars.pheromones[i][j].toHomePheromones).toString(16)}`;
                    else
                        toHomeColor = `${Math.min(Math.floor(vars.pheromones[i][j].toHomePheromones), 255).toString(16)}`;

                    if (vars.pheromones[i][j].toFoodPheromones < 16)
                        toFoodColor = `0${Math.floor(vars.pheromones[i][j].toFoodPheromones).toString(16)}`;
                    else
                        toFoodColor = `${Math.min(Math.floor(vars.pheromones[i][j].toFoodPheromones), 255).toString(16)}`;

                    vars.extraCtx2.fillStyle = `#${toHomeColor}${toFoodColor}00`;
                }

                vars.extraCtx2.beginPath();
                vars.extraCtx2.strokeStyle = "black";
                vars.extraCtx2.arc(vars.pheromones[i][j].x, vars.pheromones[i][j].y, 2, 0, Math.PI * 2, false);
                vars.extraCtx2.closePath();
                vars.extraCtx2.fill();
                vars.extraCtx2.stroke();
            }
        }
    }
}
