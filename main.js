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
    if (sides == 20 && thisRoll == 20) {
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
    return thisRoll;
}

// Add new dice on clicking add die button

function addDie(sides, storedRoll, shouldCalcStats = true) {
    let diceCountInput = document.querySelector('#dice-count-input');
    let diceCount = diceCountInput.value;
    for (let i = 0; i < diceCount; i++) {
        let dieNumber = 0;
        if (storedRoll) {
            dieNumber = storedRoll;
        } else {
            dieNumber = roll(sides);
        }
        let dieContainer = document.createElement("div");
        dieContainer.classList.add("dieContainer");
        if (sides == 20 && dieNumber == 20) {
            dieContainer.classList.add("natural");
        }
        dieContainer.classList.toggle("showing");
        let dieTemplate = `<div class="die">
            <button class="dieNumber" onclick="reRoll(this)" data-sides="${sides}" data-roll="${dieNumber}" title="Reroll this d${sides}"><strong class="number">${dieNumber}</strong> (${sides})</span>
            <button class="removeDie" onclick="removeDie(this)" title="Remove this d${sides}">−</button>
        </div>`
        dieContainer.innerHTML = dieTemplate;
        document.querySelector('#dice').appendChild(dieContainer);
        setTimeout(() => {
            dieContainer.classList.toggle("showing");
        }, 100);
    }
    if (shouldCalcStats) {
        calcStats();
    }
}

function constructTotals(total, hi, lo) {
    document.querySelector('#total-container').innerHTML = `
        <span class="total">Total: ${total} | Hi: ${hi} | Lo: ${lo}</span>
    `;
}

constructTotals(0, 0, 0);

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
    if (document.querySelectorAll('.dieContainer:not(.hiding)').length == 0) {
        localStorage.removeItem('dice');
    }
    calcStats();
}

// Destroy all dice

function removeAllDice() {
    document.querySelector('#dice').innerHTML = "";

    let customDieContainers = document.querySelectorAll('.customDieContainer');
    for (let i = 0; i < customDieContainers.length; i++) {
        customDieContainers[i].parentNode.removeChild(customDieContainers[i]);
    }

    localStorage.removeItem('dice');
    localStorage.removeItem('customDice');

    calcStats();
}

// Re-roll die when result is clicked

function reRoll(e, shouldCalcStats = true) {
    let sides = e.dataset.sides;
    e.children[0].innerHTML = roll(sides);
    e.dataset.roll = e.children[0].innerHTML;
    let dieNumber = e.dataset.roll;
    if (sides == 20 && dieNumber == 20) {
        e.parentNode.parentNode.classList.add("natural");
    } else {
        e.parentNode.parentNode.classList.remove("natural");
    }
    if (shouldCalcStats) {
        calcStats();
    }
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
    }
    localStorage.setItem('dice', JSON.stringify(dice));
    constructTotals(total, hi, lo);
    console.log('Calcstats run');
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

function toggleCountInput() {
    let diceCountContainer = document.querySelector('#config-container');
    diceCountContainer.classList.toggle('hidden');
    // If #toggle-count-input contains "⬇️"
    if (document.querySelector('#toggle-count-input').innerHTML.includes('⬇️')) {
        document.querySelector('#toggle-count-input').innerHTML = "⚙️⬆️";
    } else {
        document.querySelector('#toggle-count-input').innerHTML = "⚙️⬇️";
    }
}

// Add custom die
function addCustomDie(sides = document.querySelector('#custom-die-input').value) {
    if (sides > 0) {
        let customDieTemplate = `
            <div class="customDieContainer">
                <button class="customDieButton" id="d${sides}" onclick="addDie(${sides})" type="button" title="Add a d${sides}">+d${sides}</button><button class="removeDie" onclick="removeDieButton(this)">−</button>
            </div>
        `;

        document.querySelector('#dice-buttons').innerHTML += customDieTemplate;

        document.querySelector('#custom-die-input').value = "";

        storeCustomDice();
    }
}

// Custom die input event listener
document.querySelector('#custom-die-input').addEventListener('keyup', function (e) {
    if (e.keyCode == 13) {
        addCustomDie();
    }
});

// Remove custom die button
function removeDieButton(e) {
    e.parentNode.parentNode.removeChild(e.parentNode);
    storeCustomDice();
}

// Store custom dice
function storeCustomDice() {
    let customDieContainers = document.querySelectorAll('.customDieContainer');

    let customDice = [];

    for (let i = 0; i < customDieContainers.length; i++) {
        let thisDie = customDieContainers[i].children[0].id;
        let thisDieValue = thisDie.substring(1);
        let thisDieObject = Object.create(dieObject);
        thisDieObject.sides = thisDieValue;
        customDice.push(thisDieObject);
    }

    localStorage.setItem('customDice', JSON.stringify(customDice));
}

// Add custom dice from storage
function addCustomDiceFromStorage() {
    if (localStorage.getItem('customDice')) {
        let customDiceFromStorage = JSON.parse(localStorage.getItem('customDice'));
        for (let i = 0; i < customDiceFromStorage.length; i++) {
            addCustomDie(customDiceFromStorage[i].sides);
        }
    }
}

addCustomDiceFromStorage();

// Reroll all dice
function rerollAll() {
    let diceNumbers = document.querySelectorAll('.dieNumber');
    for (let i = 0; i < diceNumbers.length; i++) {
        reRoll(diceNumbers[i], shouldCalcStats = false);
    };
    calcStats();
}

function hideTipAsk() {
    let tipAsk = document.querySelector('#tip-ask');
    document.querySelector('#tip-ask').remove();
    localStorage.setItem('tipAskHidden', true);
    document.querySelector('#config-container').appendChild(tipAsk);
    document.querySelector('#tip-ask-button').remove();
}

if (localStorage.getItem('tipAskHidden')) {
    hideTipAsk();
}

// dark mode
// on page load, and when prefers-color-scheme changes, add .dark to body if dark is preferred
function colorScheme() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches && !(urlParams.get('color-scheme') == 'light')) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    if (urlParams.get('color-scheme') == 'light') {
        document.body.classList.remove('dark');
    } else if (urlParams.get('color-scheme') == 'dark') {
        document.body.classList.add('dark');
    }
}

colorScheme();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', colorScheme);