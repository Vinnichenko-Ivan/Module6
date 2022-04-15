/*
 * Модуль с пасхалкой
 */

// Название кнопок для различных состояний
const displayOn = 'RTX ON';
const displayOff = 'RTX OFF';

// Громкость музыки
const volume = 0.05;

// Количество битов в минуту
const bpm = 125.66;

// Задержка между битами в миллисекундах
const beatDelay = 60000 / bpm / 4;

// Музыка
let audio: HTMLAudioElement;

// Время начала музыки
let timestamp: number;

// Текущий бит
let beat = 0;

function playAudio(button: HTMLElement) {
    if (audio != undefined && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        return;
    }

    let audioId = button.getAttribute('target');
    audio = <HTMLAudioElement> $(`audio#${audioId}`)[0];
    audio.volume = volume;

    audio.play();
    runTask(button);

    button.textContent = displayOff;
}

async function runTask(button: HTMLElement) {
    timestamp = Date.now();

    while (!audio.paused) {
        await new Promise(resolve => setTimeout(resolve, 20));

        beat = Math.trunc((Date.now() - timestamp) / beatDelay);

        // Крабики клешнями стучат
        if (beat >= 64 && beat <= 368) {
            $('.animation.jump')
                .css({
                    transform: `translateY(-${beat % 2 * 5}px)`,
                    '--time': '.1s'
                });
        }

        // Плавное движение на релаксе
        if (beat >= 128 && beat <= 1304 && beat % 16 === 0) {
            $('.animation.slide-right')
                .css({
                    transform: `translateX(${(Math.trunc(beat / 16 + 1) % 2) * 25}px)`,
                    '--time': '2s'
                });
            $('.animation.slide-left')
                .css({
                    transform: `translateX(-${(Math.trunc(beat / 16 + 1) % 2) * 25}px)`,
                    '--time': '2s'
                });
        }

        // Первый бит
        if (beat === 128) {
            $('.animation.window')
                .css({
                    '--time': '0',
                    transform: `scale(1.02)`
                })
        }
        if (beat === 129) {
            $('.animation.window')
                .css({
                    transform: `scale(1)`,
                    '--time': '.2s'
                });
        }

        // Мерцание окошка
        if (((beat >= 256 && beat <= 642) || (beat >= 770 && beat <= 1157)) && beat % 4 === 0) {
            $('.animation.area')
                .css({
                    '--time': '0',
                    background: `rgba(255, 255, 255, 0.1)`
                })
            $('.animation.window')
                .css({
                    transform: `scale(1.005)`,
                    '--time': '.1s'
                });
        }
        if (((beat >= 256 && beat <= 642) || (beat >= 770 && beat <= 1157)) && beat % 4 === 1) {
            $('.animation.area')
                .css({
                    '--time': '.1s',
                    background: `none`,
                });
            $('.animation.window')
                .css({
                    transform: `scale(1)`,
                    '--time': '.1s'
                });
        }

        // Кнопки набирают темп
        if (((beat >= 320 && beat <= 352) || (beat >= 834 && beat <= 870)) && beat % 4 === 0) {
            $('.animation.beat')
                .css({
                    '--time': '0',
                    transform: `scale(1.2)`,
                })
        }
        if (((beat >= 320 && beat <= 352) || (beat >= 834 && beat <= 870)) && beat % 4 === 1) {
            $('.animation.beat')
                .css({
                    '--time': '.2s',
                    transform: `scale(1)`,
                })
        }

        // Кнопки набирали макс. темп
        if (((beat >= 352 && beat <= 368) || (beat >= 870 && beat <= 885)) && beat % 2 === 0) {
            $('.animation.beat')
                .css({
                    '--time': '0',
                    transform: `scale(1.2)`,
                })
        }
        if (((beat >= 352 && beat <= 368) || (beat >= 870 && beat <= 885)) && beat % 2 === 1) {
            $('.animation.beat')
                .css({
                    '--time': '.05s',
                    transform: `scale(1)`,
                })
        }

        // Повороты экрана
        for (let i = 0; i < 4; i++) {
            if (beat === 368 + i * 4 || beat === 884 + i * 4) {
                $('.animation.window')
                    .css({
                        '--time': '0',
                        transform: `scale(1.05) rotate(${i % 2 ? '-' : ''}5deg)`
                    })
            }
            if (beat === 368 + i * 4 + 2 || beat === 884 + i * 4 + 2) {
                $('.animation.window')
                    .css({
                        '--time': '0',
                        transform: `scale(1)`
                    });
            }
        }

        // Дискотека
        if (((beat >= 384 && beat <= 642) || (beat >= 914 && beat <= 1157)) && beat % 4 === 0) {
            $('.animation.disco')
                .css({
                    '--time': '0',
                    transform: `scale(1.2)`
                })
            $('.animation.window')
                .css({
                    '--time': '0',
                    transform: `scale(1.02)`
                })
        }
        if (((beat >= 384 && beat <= 642) || (beat >= 914 && beat <= 1157)) && beat % 4 === 1) {
            $('.animation.disco')
                .css({
                    '--time': '.2s',
                    transform: `scale(1)`
                })
            $('.animation.window')
                .css({
                    transform: `scale(1)`,
                    '--time': '.2s'
                });
        }
        if (beat >= 384 && beat <= 632 && beat % 8 === 0) {
            $('body')
                .css({
                    '--time': '1s',
                    'background-position-y': beat % 16 === 0 ? '0' : 'center'
                })
        }
        if (beat >= 914 && beat <= 1144 && (beat + 4) % 8 === 0) {
            $('body')
                .css({
                    '--time': '1s',
                    'background-position-y': (beat + 4) % 16 === 0 ? 'center' : '0'
                })
        }
    }
    button.textContent = displayOn;
}

export function initializeAudio() {
    $('.audio').on('click', e => playAudio(e.target));
}