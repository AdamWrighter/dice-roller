const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// Generate random number between 1 and max
function ranNum(max) {
    return Math.floor(Math.random() * max) + 1;
}

// Play dice roll sounds, never playing the same one twice in a row

var oldSound = 0;

function sound() {
    let newSound = ranNum(10);
    while (newSound == oldSound) {
        newSound = ranNum(10);
    }
    new Audio(`roll${newSound}.ogg`).play();
    oldSound = newSound;
}

// Roll using ranNum and calculate statistics

function roll(sides) {
    if (urlParams.get('sound') == 'true') {
        sound();
    }
    calcStats();
    return ranNum(sides);
}

// Add new dice on clicking add die button

function addDie(sides) {
    let dieNumber = roll(sides);
    let dieContainer = document.createElement("div");
    dieContainer.classList.add("dieContainer");
    if (dieNumber == sides) {
        dieContainer.classList.add("natural");
    }
    dieContainer.classList.toggle("showing");
    var dieTemplate = `<div class="die">
            <button class="dieNumber" onclick="reRoll(this)" data-sides="${sides}" data-roll="${dieNumber}"><strong class="number">${dieNumber}</strong> (${sides})</span>
            <button class="removeDie" onclick="removeDie(this)">−</button>
        </div>`
    dieContainer.innerHTML = dieTemplate;
    document.querySelector('#dice').appendChild(dieContainer);
    setTimeout(() => {
        dieContainer.classList.toggle("showing");
    }, 100);
    calcStats();
}

// Destroy one die

function removeDie(e) {
    e.parentNode.parentNode.classList.toggle('hiding');
    setTimeout(() => {
        e.parentNode.parentNode.parentNode.removeChild(e.parentNode.parentNode);
    }, 100);
    calcStats();
}

// Destroy all dice

function removeAllDice() {
    document.querySelectorAll('.removeDie').forEach(el=>el.click())
}

// Re-roll die when result is clicked

function reRoll(e) {
    let sides = e.dataset.sides;
    e.children[0].innerHTML = roll(sides);
    e.dataset.roll = e.children[0].innerHTML;
    let dieNumber = e.dataset.roll;
    if (dieNumber == sides) {
        e.parentNode.parentNode.classList.add("natural");
    } else {
        e.parentNode.parentNode.classList.remove("natural");
    }
    calcStats();
}

// Calculate total of rolls and hi & lo roll

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

// Detect if page is in an iFrame

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

// If an an iFrame, add class to body for reduced margins

function detectNotion() {
    if (inIframe()) {
        document.body.classList.add("embed");
    }
}
detectNotion();