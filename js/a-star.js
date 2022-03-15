const field = $('#field')[0];

let width;
let height;

$('#field-resize').on('click', resize);

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