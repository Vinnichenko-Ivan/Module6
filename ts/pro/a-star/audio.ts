// Название кнопок для различных состояний
const displayOn = 'Добавить атмосферы';
const displayOff = 'Сделать скучным =|';

// Громкость музыки
const volume = 0.5;

// Музыка
let audio: HTMLAudioElement;

function playAudio(button: HTMLElement) {
    if (audio != undefined && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        return;
    }

    let audioId = button.getAttribute('target');
    audio = <HTMLAudioElement> $(`audio#${audioId}`)[0];
    audio.volume = volume;
    audio.onpause = () => button.textContent = displayOn;

    audio.play().then();

    button.textContent = displayOff;
}

export function initializeAudio() {
    $('.audio').on('click', e => playAudio(e.target));
}