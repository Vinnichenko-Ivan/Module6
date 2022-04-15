var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initializeAudio = void 0;
    const volume = 0.05;
    const bpm = 125.66;
    const beatDelay = 60000 / bpm / 4;
    let audio;
    let timestamp;
    let beat = 0;
    function playAudio(element) {
        if (audio != undefined && !audio.paused) {
            return;
        }
        let audioId = element.getAttribute('target');
        audio = $(`audio#${audioId}`)[0];
        audio.volume = volume;
        audio.play();
        runTask();
    }
    function runTask() {
        return __awaiter(this, void 0, void 0, function* () {
            timestamp = Date.now();
            while (!audio.paused) {
                yield new Promise(resolve => setTimeout(resolve, 20));
                beat = Math.trunc((Date.now() - timestamp) / beatDelay);
                if (beat >= 64 && beat <= 368) {
                    $('.animation.jump')
                        .css({
                        transform: `translateY(-${beat % 2 * 5}px)`,
                        '--time': '.1s'
                    });
                }
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
                if (beat === 128) {
                    $('.animation.window')
                        .css({
                        '--time': '0',
                        transform: `scale(1.02)`
                    });
                }
                if (beat === 129) {
                    $('.animation.window')
                        .css({
                        transform: `scale(1)`,
                        '--time': '.2s'
                    });
                }
                if (((beat >= 256 && beat <= 642) || (beat >= 770 && beat <= 1156)) && beat % 4 === 0) {
                    $('.animation.area')
                        .css({
                        '--time': '0',
                        background: `rgba(255, 255, 255, 0.1)`
                    });
                    $('.animation.window')
                        .css({
                        transform: `scale(1.005)`,
                        '--time': '.1s'
                    });
                }
                if (((beat >= 256 && beat <= 642) || (beat >= 770 && beat <= 1156)) && beat % 4 === 1) {
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
                if (((beat >= 320 && beat <= 352) || (beat >= 834 && beat <= 870)) && beat % 4 === 0) {
                    $('.animation.beat')
                        .css({
                        '--time': '0',
                        transform: `scale(1.2)`,
                    });
                }
                if (((beat >= 320 && beat <= 352) || (beat >= 834 && beat <= 870)) && beat % 4 === 1) {
                    $('.animation.beat')
                        .css({
                        '--time': '.2s',
                        transform: `scale(1)`,
                    });
                }
                if (((beat >= 352 && beat <= 368) || (beat >= 870 && beat <= 884)) && beat % 2 === 0) {
                    $('.animation.beat')
                        .css({
                        '--time': '0',
                        transform: `scale(1.2)`,
                    });
                }
                if (((beat >= 352 && beat <= 368) || (beat >= 870 && beat <= 884)) && beat % 2 === 1) {
                    $('.animation.beat')
                        .css({
                        '--time': '.05s',
                        transform: `scale(1)`,
                    });
                }
                for (let i = 0; i < 4; i++) {
                    if (beat === 368 + i * 4 || beat === 884 + i * 4) {
                        $('.animation.window')
                            .css({
                            '--time': '0',
                            transform: `scale(1.05) rotate(${i % 2 ? '-' : ''}5deg)`
                        });
                    }
                    if (beat === 368 + i * 4 + 2 || beat === 884 + i * 4 + 2) {
                        $('.animation.window')
                            .css({
                            '--time': '0',
                            transform: `scale(1)`
                        });
                    }
                }
                if (((beat >= 384 && beat <= 642) || (beat >= 914 && beat <= 1157)) && beat % 4 === 0) {
                    $('.animation.disco')
                        .css({
                        '--time': '0',
                        transform: `scale(1.2)`
                    });
                    $('.animation.window')
                        .css({
                        '--time': '0',
                        transform: `scale(1.02)`
                    });
                }
                if (((beat >= 384 && beat <= 642) || (beat >= 914 && beat <= 1157)) && beat % 4 === 1) {
                    $('.animation.disco')
                        .css({
                        '--time': '.2s',
                        transform: `scale(1)`
                    });
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
                    });
                }
                if (beat >= 914 && beat <= 1156 && (beat + 4) % 8 === 0) {
                    $('body')
                        .css({
                        '--time': '1s',
                        'background-position-y': (beat + 4) % 16 === 0 ? 'center' : '0'
                    });
                }
            }
        });
    }
    function initializeAudio() {
        $('.audio').on('click', e => playAudio(e.target));
    }
    exports.initializeAudio = initializeAudio;
});
//# sourceMappingURL=audio.js.map