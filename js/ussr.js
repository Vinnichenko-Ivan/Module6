let clickEvent = document.getElementById('ussr').onclick;
document.getElementById('ussr').onclick = e => {
    clickEvent(e);
    let background = '../assets/img/ussr.png';
    document.body.style.backgroundImage = `url("${background}")`;
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundSize = 'cover';
};