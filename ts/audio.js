define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initializeAudio = void 0;
    let audio;
    function playAudio(element) {
        let audioId = element.getAttribute('target');
        audio = $(`audio#${audioId}`)[0];
        audio.volume = 0.1;
        audio.play();
    }
    function initializeAudio() {
        $('.audio').on('click', e => playAudio(e.target));
    }
    exports.initializeAudio = initializeAudio;
});
//# sourceMappingURL=audio.js.map