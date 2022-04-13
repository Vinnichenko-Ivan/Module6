let audio: HTMLAudioElement;

function playAudio(element: HTMLElement) {
    let audioId = element.getAttribute('target');
    audio = <HTMLAudioElement> $(`audio#${audioId}`)[0];
    audio.volume = 0.1;
    audio.play();
}

export function initializeAudio() {
    $('.audio').on('click', e => playAudio(e.target));
}