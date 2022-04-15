/*
 * Модуль отвечает за передвижение дерева решений с помощью мышки,
 * а также увеличение дерева с помощью колесика мыши
 */

let elementClientX = 0;
let elementClientY = 0;
let elementX = 0;
let elementY = 0;
let elementWheel = 0;
let elementScale = 1;
let lastX: number;
let lastY: number;

/**
 * Инициализация (для обработки событий мыши)
 */
export function initializeMove() {
    $('.area')
        /*
         * Когда зажимаем мышку
         */
        .on('mousedown', event => {
            lastX = event.clientX;
            lastY = event.clientY;
            return false;
        })
        /*
         * Когда двигаем мышку
         * (двигаем и дерево)
         */
        .on('mousemove', event => {
            if (lastX && lastY) {
                elementX += (event.clientX - lastX) / elementScale;
                elementY += (event.clientY - lastY) / elementScale;
                lastX = event.clientX;
                lastY = event.clientY;
                elementClientX = elementX * elementScale;
                elementClientY = elementY * elementScale;
                $('.movable').css({
                    'transform': `translate(${elementClientX}px, ${elementClientY}px) scale(${elementScale})`
                });
            }
        })
        /*
         * Когда отпускаем мышку
         */
        .on('mouseup', () => {
            lastX = null;
            lastY = null;
        })
        /*
         * Когда крутим колесико мыши
         * (изменяем и размер дерева)
         */
        .on('mousewheel', event => {
            elementWheel -= (<WheelEvent> event.originalEvent).deltaY / 1000;
            elementWheel = Math.max(-1, Math.min(1, elementWheel))
            elementScale = Math.pow(Math.E, elementWheel);
            elementClientX = elementX * elementScale;
            elementClientY = elementY * elementScale;
            $('.movable').css({
                'transform': `translate(${elementClientX}px, ${elementClientY}px) scale(${elementScale})`
            });
        })
        /*
         * Когда выходим за рамки окна
         */
        .on('mouseout', () => {
            if (lastX && lastY) {
                lastX = null;
                lastY = null;
            }
        });
}

/**
 * Возвращает дерево решений в исходную локацию,
 * а также сбрасывает увеличение дерева.
 */
export function resetMove() {
    elementX = 0;
    elementY = 0;
    $('.movable').css({
        'transform': `translate(${elementX}px, ${elementY}px) scale(${elementScale})`
    });
}