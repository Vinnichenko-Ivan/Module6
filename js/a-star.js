const field = $('#field')[0];

let width;
let height;

let startPos;
let endPos;

let finding = false;

let selected;

/*
 * Определяем события кнопок
 */
$('#field-resize').on('click', resize);
$('#field-generate').on('click', generate);
$('#field-find').on('click', find);

/*
 * Определяем события для взаимодействия с клетками
 */
$('#field')
    .mousedown(event => {
        if (finding) {
            return;
        }

        if ($(event.target).hasClass('cell')) {
            selected = $(event.target);
        }
        return false;
    })
    .mouseup(event => {
        if (finding) {
            return;
        }

        if ($(event.target).hasClass('cell')) {
            let element = $(event.target);

            if (selected.attr('type') === 'start' || selected.attr('type') === 'end') {
                element.attr('type', selected.attr('type'));
                selected.attr('type', 'empty')
                selected = null;
            }
        }
    });

/**
 * Функция изменения размера поля
 */
function resize() {
    // Проверка состояния
    if (finding) {
        return;
    }

    // Получаем размер из ввода
    width = Math.min(Math.max($('#field-width')[0].value, 8), 64);
    height = Math.min(Math.max($('#field-height')[0].value, 8), 64);

    $('#field-width')[0].value = width;
    $('#field-height')[0].value = height;

    // Обновляем поле
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

    // Добавляем точки начала и конца
    jCell(2, (height/2)|0).attr('type', 'start');
    jCell(width - 3, (height/2)|0).attr('type', 'end');

    // Добавляем события клика
    $('.cell').on('click', event => toggleCell(event.target));
}

/**
 * Функция генерации лабиринта с помощью рандомизированного алгоритм Прима
 */
function generate() {
    // Проверяем состояние
    if (finding) {
        return;
    }

    // Делаем все клетки стенами
    $('.cell')
        .removeClass('reachable')
        .removeClass('explored')
        .removeClass('path')
        .attr('type', 'wall');

    // Выбираем случайно первую клетку
    let x = ((Math.random() * (width / 2))|0) * 2 + 1;
    let y = ((Math.random() * (height / 2))|0) * 2 + 1;
    jCell(x, y).attr('type', 'empty');

    // Добавляем в очередь соседние клетки
    let queue = [];
    if (y - 2 >= 0) {
        queue.push({x: x, y: y - 2});
    }
    if (y + 2 < height) {
        queue.push({x: x, y: y + 2});
    }
    if (x - 2 >= 0) {
        queue.push({x: x - 2, y: y});
    }
    if (x + 2 < width) {
        queue.push({x: x + 2, y: y});
    }

    // Пока очередь не пуста
    while (queue.length) {
        // Выбираем случайно клетку из очереди и делаем её пустой
        let index = (Math.random() * queue.length)|0;
        let cell = queue[index];
        queue.splice(index, 1);
        x = cell.x;
        y = cell.y;
        jCell(x, y).attr('type', 'empty');

        // Закрашиваем клетки между предыдущей и текущей
        let directions = ['north', 'south', 'east', 'west'];
        while (directions.length) {
            let directionIndex = (Math.random() * directions.length)|0
            switch (directions[directionIndex]) {
                case 'north':
                    if (y - 2 >= 0 && jCellIsEmpty(x, y - 2)) {
                        jCell(x, y - 1).attr('type', 'empty');
                        directions = [];
                    }
                    break;
                case 'south':
                    if (y + 2 < height && jCellIsEmpty(x, y + 2)) {
                        jCell(x, y + 1).attr('type', 'empty');
                        directions = [];
                    }
                    break;
                case 'east':
                    if (x - 2 >= 0 && jCellIsEmpty(x - 2, y)) {
                        jCell(x - 1, y).attr('type', 'empty');
                        directions = [];
                    }
                    break;
                case 'west':
                    if (x + 2 < width && jCellIsEmpty(x + 2, y)) {
                        jCell(x + 1, y).attr('type', 'empty');
                        directions = [];
                    }
                    break;
            }
            directions.splice(directionIndex, 1);
        }

        // Добавляем в очередь соседние клетки
        if (y - 2 >= 0 && jCellIsWall(x, y - 2) && !contains(queue, {x: x, y: y - 2})) {
            queue.push({x: x, y: y - 2});
        }
        if (y + 2 < height && jCellIsWall(x, y + 2) && !contains(queue, {x: x, y: y + 2})) {
            queue.push({x: x, y: y + 2});
        }
        if (x - 2 >= 0 && jCellIsWall(x - 2, y) && !contains(queue, {x: x - 2, y: y})) {
            queue.push({x: x - 2, y: y});
        }
        if (x + 2 < width && jCellIsWall(x + 2, y) && !contains(queue, {x: x + 2, y: y})) {
            queue.push({x: x + 2, y: y});
        }
    }

    // Добавляем точки начала и конца
    jCellRandomEmpty().attr('type', 'start');
    jCellRandomEmpty().attr('type', 'end');
}

/**
 * Функция запуска поиска пути по алгоритму A*
 */
function find() {
    // Проверка состояния
    if (finding) {
        return;
    }

    // Инициализация
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

    // Отчищаем путь
    $('.cell')
        .removeClass("explored")
        .removeClass("reachable")
        .removeClass("path")
        .text('');

    // Изменения состояния
    finding = true;

    // Выполняем алгоритм A*
    algorithmAStar().then(path => {
        // Отмечаем найденный путь
        if (path) {
            for (const node of path) {
                jCell(node.x, node.y).addClass("path");
            }
        }

        // Изменение состояния
        finding = false;
    });
}

/**
 * Функция создания узла для алгоритма A*
 *
 * @param pos координаты узла (клетки)
 * @param distance пройденная дистанция от начальной клетки
 * @returns {{getAdjacentNodes: (function(): *[]), x: number, y: number, weight: *}} узел
 */
function createNode(pos, distance) {
    let x = +pos.x;
    let y = +pos.y;
    return {
        x: x,
        y: y,
        weight: distance + manhattan(pos),
        getAdjacentNodes: function () {
            let nodes = [];

            if (x > 0 && !jCellIsWall(x - 1, y)) {
                nodes.push(createNode({x: x - 1, y: y}, distance + 1));
            }
            if (x < width - 1 && !jCellIsWall(x + 1, y)) {
                nodes.push(createNode({x: x + 1, y: y}, distance + 1));
            }
            if (y > 0 && !jCellIsWall(x, y - 1)) {
                nodes.push(createNode({x: x, y: y - 1}, distance + 1));
            }
            if (y < height - 1 && !jCellIsWall(x, y + 1)) {
                nodes.push(createNode({x: x, y: y + 1}, distance + 1));
            }

            if (x > 0 && y > 0 && !jCellIsWall(x - 1, y - 1) && (!jCellIsWall(x - 1, y) || !jCellIsWall(x, y - 1))) {
                nodes.push(createNode({x: x - 1, y: y - 1}, distance + Math.SQRT2));
            }
            if (x < width - 1 && y > 0 && !jCellIsWall(x + 1, y - 1) && (!jCellIsWall(x + 1, y) || !jCellIsWall(x, y - 1))) {
                nodes.push(createNode({x: x + 1, y: y - 1}, distance + Math.SQRT2));
            }
            if (x > 0 && y < height - 1 && !jCellIsWall(x - 1, y + 1) && (!jCellIsWall(x - 1, y) || !jCellIsWall(x, y + 1))) {
                nodes.push(createNode({x: x - 1, y: y + 1}, distance + Math.SQRT2));
            }
            if (x < width - 1 && y < height - 1 && !jCellIsWall(x + 1, y + 1) && (!jCellIsWall(x + 1, y) || !jCellIsWall(x, y + 1))) {
                nodes.push(createNode({x: x + 1, y: y + 1}, distance + Math.SQRT2));
            }

            return nodes;
        }
    }
}

/**
 * Алгоритм A* (асинхронно)
 *
 * @returns {Promise<null|*[]>} массив найденных узлов для пути
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

        reachable.splice(reachable.indexOf(node), 1);
        explored.push(node);

        $(`.cell[x="${node.x}"][y="${node.y}"]`).addClass("explored");

        // Проходимся по смежным узлам, если они
        for (const adjacent of node.getAdjacentNodes()) {
            if (!contains(reachable, adjacent) && !contains(explored, adjacent)) {
                adjacent.previous = node;
                reachable.push(adjacent);

                let cell = $(`.cell[x="${adjacent.x}"][y="${adjacent.y}"]`);
                cell.addClass("reachable")
                //cell.text(adjacent.weight.toFixed(2));
            }
        }

        await new Promise(r => setTimeout(r, 10))
    }

    return null;
}

/**
 * Найти элемент с минимальным весом в массиве
 *
 * @param array массив элементов с весами
 * @returns {*}
 */
function findMin(array) {
    let min = array[0];

    for (let i = 1; i < array.length; i++) {
        if (array[i].weight < min.weight) {
            min = array[i];
        }
    }

    return min;
}

/**
 * Проверить, содержит ли массив в себе координаты
 *
 * @param array массив координат
 * @param pos координаты
 * @returns {boolean}
 */
function contains(array, pos) {
    for (const element of array) {
        if (element.x === pos.x && element.y === pos.y) {
            return true;
        }
    }
    return false;
}

/**
 * Эвристическая функция "Манхеттан"
 *
 * @param pos координаты
 * @returns {number}
 */
function manhattan(pos) {
    return Math.abs(endPos.x - pos.x) + Math.abs(endPos.y - pos.y);
}

/**
 * Получить элемент клетки по координатам
 *
 * @param x абсцисса
 * @param y ордината
 * @returns {jQuery|HTMLElement}
 */
function jCell(x, y) {
    return $(`.cell[x="${x}"][y="${y}"]`);
}

/**
 * Получить тип клетки
 *
 * @param x абсцисса
 * @param y ордината
 * @returns {string}
 */
function jCellType(x, y) {
    return jCell(x, y).attr('type');
}

/**
 * Проверить, является ли клетка стеной
 *
 * @param x абсцисса
 * @param y ордината
 * @returns {boolean}
 */
function jCellIsWall(x, y) {
    return jCellType(x, y) === 'wall';
}

/**
 * Проверить, является ли клетка пустой
 *
 * @param x абсцисса
 * @param y ордината
 * @returns {boolean}
 */
function jCellIsEmpty(x, y) {
    return jCellType(x, y) === 'empty';
}

/**
 * Найти случайную пустую клетку
 *
 * @returns {jQuery|HTMLElement}
 */
function jCellRandomEmpty() {
    let size = width * height;
    let random = (Math.random() * size)|0;

    for (let index = random; index !== random - 1; index = (index + 1) % size) {
        let x = index % height;
        let y = (index / height)|0;

        if (jCellIsEmpty(x, y)) {
            return jCell(x, y);
        }
    }

    let x = random % height;
    let y = (random / height)|0;

    return jCell(x, y);
}

/**
 * Переключить клетку со стены на пустую и наоборот
 *
 * @param element {jQuery} элемент
 */
function toggleCell(element) {
    // Проверка состояния
    if (finding) {
        return;
    }

    let type = $(element).attr('type');

    if (type === 'empty') {
        $(element).attr('type', 'wall')
        return;
    }

    if (type === 'wall') {
        $(element).attr('type', 'empty')
    }
}

// Запуск
resize();