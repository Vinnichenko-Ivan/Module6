let audio;

function playAudio(element) {
    alert("Осторожно громкий ЗВУК.")
    alert("Cделайте потише!")
    let audioId = element.getAttribute('target');
    audio = document.getElementById(audioId);
    audio.volume = 0.25;
    audio.play();
}

function initializeAudio() {
    for (const element of document.getElementsByClassName('audio')) {
        element.onclick = e => playAudio(e.target);
    }
}

initializeAudio();