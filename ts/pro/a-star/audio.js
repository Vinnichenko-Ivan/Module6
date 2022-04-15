define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initializeAudio = void 0;
    const displayOn = 'Добавить атмосферы';
    const displayOff = 'Сделать скучным =|';
    const volume = 0.05;
    let audio;
    function playAudio(button) {
        if (audio != undefined && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
            return;
        }
        let audioId = button.getAttribute('target');
        audio = $(`audio#${audioId}`)[0];
        audio.volume = volume;
        audio.onpause = () => button.textContent = displayOn;
        audio.play().then();
        button.textContent = displayOff;
    }
    function initializeAudio() {
        $('.audio').on('click', e => playAudio(e.target));
    }
    exports.initializeAudio = initializeAudio;
});
//# sourceMappingURL=audio.js.map