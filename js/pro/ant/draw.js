import {vars} from "./vars.js";

//---------------------------------------------------------------
//---------------------------------------------------------------
//~~~~~~~~~~~~~~~~~~~~~~~ФУНКЦИИ ОТРИСОВКИ~~~~~~~~~~~~~~~~~~~~~~~
export function updateCtx(MyCanvas, ctx, anthill, ants, ExtraCanvas1, ExtraCanvas2) {
    ctx.clearRect(0, 0, MyCanvas.width, MyCanvas.height);
    ctx.drawImage(ExtraCanvas2, 0, 0);
    ctx.drawImage(ExtraCanvas1, 0, 0);

    if (anthill.isBuilt) {
        for (let i = 0; i < ants.length; i++)
            ants[i].next();
        for (let i = 0; i < ants.length; i++) {
            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.strokeStyle = "black";
            ctx.arc(ants[i].x, ants[i].y, 3, 0, Math.PI * 2, false);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}

export function updateExtraCtx1() {
    vars.extraCtx1.clearRect(0, 0, vars.MyCanvas.width, vars.MyCanvas.height);
    for (let i = 0; i < vars.mainObjects.length; i++)
        for (let j = 0; j < vars.mainObjects[i].length; j++)
            if (vars.mainObjects[i][j].notEmpty)
                vars.mainObjects[i][j].next();

    if (anthill.isBuilt) {
        extraCtx1.beginPath();
        extraCtx1.fillStyle = anthill.color;
        extraCtx1.strokeStyle = anthill.borderColor;
        extraCtx1.arc(anthill.x, anthill.y, anthill.radius, 0, Math.PI * 2, false);
        extraCtx1.closePath();
        extraCtx1.fill();
        extraCtx1.stroke();
    }
}

export function updateExtraCtx2() {
    vars.extraCtx2.clearRect(0, 0, vars.MyCanvas.width, vars.MyCanvas.height);
    for (let i = 0; i < vars.pheromones.length; i++) {
        for (let j = 0; j < vars.pheromones[i].length; j++) {
            vars.pheromones[i][j].next();
            if (vars.pheromones[i][j].notEmpty) {

                if(pheromonesDrawingMode === 1){
                    if (pheromones[i][j].toHomePheromones && pheromones[i][j].toFoodPheromones)
                        extraCtx2.fillStyle = "#ccee00";
                    else if (pheromones[i][j].toHomePheromones)
                        extraCtx2.fillStyle = "orange";
                    else
                        extraCtx2.fillStyle = "green";

                }
                else {
                    let toHomeColor, toFoodColor;

                    if (pheromones[i][j].toHomePheromones < 16)
                        toHomeColor = `0${Math.floor(pheromones[i][j].toHomePheromones).toString(16)}`;
                    else
                        toHomeColor = `${Math.min(Math.floor(pheromones[i][j].toHomePheromones), 255).toString(16)}`;

                    if (pheromones[i][j].toFoodPheromones < 16)
                        toFoodColor = `0${Math.floor(pheromones[i][j].toFoodPheromones).toString(16)}`;
                    else
                        toFoodColor = `${Math.min(Math.floor(pheromones[i][j].toFoodPheromones), 255).toString(16)}`;

                    extraCtx2.fillStyle = `#${toHomeColor}${toFoodColor}00`;
                }

                extraCtx2.beginPath();
                extraCtx2.strokeStyle = "black";
                extraCtx2.arc(pheromones[i][j].x, pheromones[i][j].y, 2, 0, Math.PI * 2, false);
                extraCtx2.closePath();
                extraCtx2.fill();
                extraCtx2.stroke();
            }
        }
    }
}
