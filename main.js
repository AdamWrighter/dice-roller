const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const dieObject = {
    roll: 0,
    sides: 0
}

// Serif font support
if (urlParams.get('font') == 'serif') {
    document.body.classList.add("serif");
    document.body.classList.remove("hidden");
} else {
    document.body.classList.remove("hidden");
}

// Generate random number between 1 and max
function ranNum(max) {
    return Math.floor(Math.random() * max) + 1;
}

// Play dice roll sounds, never playing the same one twice in a row

var oldSound = 0;

function sound(thisRoll, sides) {
    let newSound = ranNum(10);
    while (newSound == oldSound) {
        newSound = ranNum(10);
    }
    new Audio(`sound/roll${newSound}.ogg`).play();
    oldSound = newSound;
    if (thisRoll == 20) {
        setTimeout(() => {
            new Audio('sound/natural.ogg').play();
        }, 200);
    }
    if (thisRoll == 1 && sides == 20) {
        setTimeout(() => {
            new Audio('sound/critfail.ogg').play();
        }, 200);
    }
}

// Roll using ranNum and calculate statistics

function roll(sides) {
    let thisRoll = ranNum(sides);
    if (urlParams.get('sound') == 'true') {
        sound(thisRoll, sides);
    }
    calcStats();
    return thisRoll;
}

// Add new dice on clicking add die button

function addDie(sides, storedRoll, shouldCalcStats = true) {
    let dieNumber = 0;
    if (storedRoll) {
        dieNumber = storedRoll;
    } else {
        dieNumber = roll(sides);
    }
    let dieContainer = document.createElement("div");
    dieContainer.classList.add("dieContainer");
    if (dieNumber == 20) {
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
    if (shouldCalcStats) {
        calcStats();
    }
}

function addDiceFromStorage() {
    if (localStorage.getItem('dice')) {
        let diceFromStorage = JSON.parse(localStorage.getItem('dice'));
        for (let i = 0; i < diceFromStorage.length; i++) {
            addDie(diceFromStorage[i].sides, diceFromStorage[i].roll, shouldCalcStats = false);
        }
        calcStats();
    }
}

addDiceFromStorage();

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
    document.querySelectorAll('.removeDie').forEach(el => el.click())
    localStorage.removeItem('dice');
}

// Re-roll die when result is clicked

function reRoll(e) {
    let sides = e.dataset.sides;
    e.children[0].innerHTML = roll(sides);
    e.dataset.roll = e.children[0].innerHTML;
    let dieNumber = e.dataset.roll;
    if (dieNumber == 20) {
        e.parentNode.parentNode.classList.add("natural");
    } else {
        e.parentNode.parentNode.classList.remove("natural");
    }
    calcStats();
}

// Calculate total of rolls and hi & lo roll
var dice = [];

function calcStats() {
    let rolls = [];
    dice = [];
    let total = 0;
    let hi = 0;
    let lo = 0;
    let diceElements = document.querySelectorAll('.dieContainer:not(.hiding) .dieNumber');
    for (i = 0; i < diceElements.length; i++) {
        let thisRoll = parseInt(diceElements[i].dataset.roll);
        rolls.push(thisRoll);
        total += thisRoll;
        hi = Math.max.apply(Math, rolls);
        lo = Math.min.apply(Math, rolls);
        let thisDie = Object.create(dieObject);
        thisDie.roll = thisRoll;
        thisDie.sides = parseInt(diceElements[i].dataset.sides)
        dice.push(thisDie);
        localStorage.setItem('dice', JSON.stringify(dice));
    }
    document.querySelector('#total-container').innerHTML = `<span class="total">Total: ${total} | Hi: ${hi} | Lo: ${lo}</span>`;
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
if (inIframe()) {
    document.body.classList.add("embed");
}