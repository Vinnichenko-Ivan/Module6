const field = $('#field')[0];

let width;
let height;

$('#field-resize').on('click', resize);
$('#field-find').on('click', find);

let startPos;
let endPos;

function resize() {
    width = Math.min(Math.max($('#field-width')[0].value, 8), 64);
    height = Math.min(Math.max($('#field-height')[0].value, 8), 64);

    $('#field-width')[0].value = width;
    $('#field-height')[0].value = height;

    while (field.firstChild) {
        field.removeChild(field.lastChild)
    }

    for (let y = 0; y < height; y++) {
        let row = jQuery('<div>', {
            class: 'cell-row'
        }).appendTo(field);
        for (let x = 0; x < width; x++) {
            row.append(jQuery('<div>', {
                class: 'cell',
                type: 'empty',
                x: x,
                y: y
            }));
        }
    }

    $(`.cell[x="${2}"][y="${+(height/2)}"]`).attr('type', 'start');
    $(`.cell[x="${width - 2}"][y="${+(height/2)}"]`).attr('type', 'end');

    $('.cell').on('click', event => toggleCell(event.target));
}

function find() {
    let start = $('.cell[type="start"]');
    let end = $('.cell[type="end"]');

    startPos = {
        x: +start.attr('x'),
        y: +start.attr('y')
    }

    endPos = {
        x: +end.attr('x'),
        y: +end.attr('y')
    };

    $('.cell')
        .removeClass("explored")
        .removeClass("reachable")
        .removeClass("path")
        .text('');

    algorithmAStar().then(path => {
        if (path) {
            for (const node of path) {
                $(`.cell[x="${node.x}"][y="${node.y}"]`).addClass("path");
            }
        }
    });
}

function createNode(pos, distance) {
    let x = +pos.x;
    let y = +pos.y;
    let heuristic = manhattan(pos);
    return {
        x: x,
        y: y,
        weight: distance + heuristic.x + heuristic.y,
        getAdjacentNodes: function () {
            let nodes = [];

            if (x > 0 && $(`.cell[x="${x - 1}"][y="${y}"]`).attr('type') !== 'wall') {
                nodes.push(createNode({x: x - 1, y: y}, distance + 1));
            }
            if (x < width - 1 && $(`.cell[x="${x + 1}"][y="${y}"]`).attr('type') !== 'wall') {
                nodes.push(createNode({x: x + 1, y: y}, distance + 1));
            }
            if (y > 0 && $(`.cell[x="${x}"][y="${y - 1}"]`).attr('type') !== 'wall') {
                nodes.push(createNode({x: x, y: y - 1}, distance + 1));
            }
            if (y < height - 1 && $(`.cell[x="${x}"][y="${y + 1}"]`).attr('type') !== 'wall') {
                nodes.push(createNode({x: x, y: y + 1}, distance + 1));
            }

            if (x > 0 && y > 0 && $(`.cell[x="${x - 1}"][y="${y - 1}"]`).attr('type') !== 'wall') {
                nodes.push(createNode({x: x - 1, y: y - 1}, distance + Math.SQRT2));
            }
            if (x < width - 1 && y > 0 && $(`.cell[x="${x + 1}"][y="${y - 1}"]`).attr('type') !== 'wall') {
                nodes.push(createNode({x: x + 1, y: y - 1}, distance + Math.SQRT2));
            }
            if (x > 0 && y < height - 1 && $(`.cell[x="${x - 1}"][y="${y + 1}"]`).attr('type') !== 'wall') {
                nodes.push(createNode({x: x - 1, y: y + 1}, distance + Math.SQRT2));
            }
            if (x < width - 1 && y < height - 1 && $(`.cell[x="${x + 1}"][y="${y + 1}"]`).attr('type') !== 'wall') {
                nodes.push(createNode({x: x + 1, y: y + 1}, distance + Math.SQRT2));
            }

            return nodes;
        }
    }
}

/**
 * @see <a href="https://www.gabrielgambetta.com/generic-search.html"> A* algorithm
 */
async function algorithmAStar() {
    let reachable = [createNode(startPos, 0)];
    let explored = [];

    while (reachable.length) {
        // Выбор узла
        let node = findMin(reachable);

        // Если мы достигли конца
        if (node.x === endPos.x && node.y === endPos.y) {
            let path = []

            while (node) {
                path.push(node)
                node = node.previous;
            }

            return path;
        }

        //
        reachable.splice(reachable.indexOf(node), 1);
        explored.push(node);

        $(`.cell[x="${node.x}"][y="${node.y}"]`).addClass("explored");

        //ку js
        for (const adjacent of node.getAdjacentNodes()) {
            if (!contains(reachable, adjacent) && !contains(explored, adjacent)) {
                adjacent.previous = node;
                reachable.push(adjacent);

                let cell = $(`.cell[x="${adjacent.x}"][y="${adjacent.y}"]`);
                cell.addClass("reachable")
                cell.text(adjacent.weight.toFixed(2));
            }
        }

        await new Promise(r => setTimeout(r, 100))
    }

    return null;
}

function findMin(array) {
    let min = array[0];

    for (let i = 1; i < array.length; i++) {
        if (array[i].weight < min.weight) {
            min = array[i];
        }
    }

    return min;
}

function contains(array, node) {
    for (const element of array) {
        if (element.x === node.x && element.y === node.y) {
            return true;
        }
    }
    return false;
}

function manhattan(pos) {
    return {
        x: Math.abs(endPos.x - pos.x),
        y: Math.abs(endPos.y - pos.y)
    }
}

function toggleCell(element) {
    let type = $(element).attr('type');

    if (type == 'empty') {
        $(element).attr('type', 'wall')
        return;
    }

    if (type == 'wall') {
        $(element).attr('type', 'empty')
    }
}

// Запуск
resize();