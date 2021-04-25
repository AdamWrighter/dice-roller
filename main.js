const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

function ranNum(max) {
    return Math.floor(Math.random() * max) + 1;
}

var oldSound = 0;

function sound() {
    let newSound = ranNum(10);
    while (newSound == oldSound) {
        newSound = ranNum(10);
    }
    new Audio(`roll${newSound}.ogg`).play();
    oldSound = newSound;
}

function roll(sides) {
    if (urlParams.get('sound') == 'true') {
        sound();
    }
    calcStats();
    return ranNum(sides);
}

function addDie(sides) {
    let dieNumber = roll(sides);
    let dieContainer = document.createElement("div");
    dieContainer.classList.add("dieContainer");
    dieContainer.classList.toggle("showing");
    var dieTemplate = `<div class="die">
            <button class="dieNumber" onclick="reRoll(this)" data-sides="${sides}" data-roll="${dieNumber}"><strong class="number">${dieNumber}</strong> (${sides})</span>
            <button class="removeDie" onclick="removeDie(this)">−</button>
        </div>`
    dieContainer.innerHTML = dieTemplate;
    document.querySelector('#dice').appendChild(dieContainer);
    setTimeout(() => {
        dieContainer.classList.toggle("showing");
    }, 1000);
    calcStats();
}

function removeDie(e) {
    e.parentNode.parentNode.classList.toggle('hiding');
    setTimeout(() => {
        e.parentNode.parentNode.parentNode.removeChild(e.parentNode.parentNode);
    }, 100);
    calcStats();
}

function reRoll(e) {
    e.children[0].innerHTML = roll(e.dataset.sides);
    e.dataset.roll = e.children[0].innerHTML;
    calcStats();
}

function calcStats() {
    let rollArray = [];
    let total = 0;
    let hi = 0;
    let lo = 0;
    let diceElements = document.querySelectorAll('.dieContainer:not(.hiding) .dieNumber');
    for (i = 0; i < diceElements.length; i++) {
        let thisRoll = parseInt(diceElements[i].dataset.roll);
        rollArray.push(thisRoll);
        total += thisRoll;
        hi = Math.max.apply(Math, rollArray);
        lo = Math.min.apply(Math, rollArray);
    }
    var totalTemplate = `<span class="total">Total: ${total} | Hi: ${hi} | Lo: ${lo}</span>`
    document.querySelector('#total-container').innerHTML = totalTemplate;
}

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function detectNotion() {
    if (inIframe()) {
        document.body.classList.add("embed");
    }
}
detectNotion();