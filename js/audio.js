let audio;

function playAudio(element) {
    let audioId = element.getAttribute('target');
    audio = document.getElementById(audioId);
    audio.volume = 0.1;
    audio.play();
}

function initializeAudio() {
    for (const element of document.getElementsByClassName('audio')) {
        element.onclick = e => playAudio(e.target);
    }
}

initializeAudio();