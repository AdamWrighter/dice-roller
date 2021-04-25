setInterval(function () {
    document.querySelector('#d20').click();
    let total = 0;
    let diceElements = document.querySelectorAll('.dieNumber');
    for (i = 0; i < diceElements.length; i++) {
        total += parseInt(diceElements[i].dataset.roll);
    }
    console.log('Average: ' + total/diceElements.length)
}, 10);