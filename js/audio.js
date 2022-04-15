let audio;

function playAudio(element) {
    alert("Осторожно громкий ЗВУК.")
    alert("Cделайте потише!")
    alert("Я предупреждал!")
    let audioId = element.getAttribute('target');
    audio = document.getElementById(audioId);
    audio.volume = 0.01;
    audio.play();
}

function initializeAudio() {
    for (const element of document.getElementsByClassName('audio')) {
        element.onclick = e => playAudio(e.target);
    }
}

initializeAudio();