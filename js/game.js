// ========================
// Game Setup & DOM Elements
// ========================

// Get category and level from localStorage
let category = localStorage.getItem("category");
let level = localStorage.getItem("level");

// Set the game title
let headerName = document.querySelector(".title");
headerName.innerHTML = `Guess The ${category}`;

// Game settings
let numbersOfTries = 6;
let currentTry = 1;
let numberOfHints = 2;

// DOM references
const guessButton = document.querySelector(".check");
const getHintButton = document.querySelector(".hint");
document.querySelector(".hint span").innerHTML = numberOfHints;

// ========================
// Word Bank & Word Picker
// ========================

const wordBank = {
    Animal: {
        easy: ["cat", "dog", "cow", "fox", "bear"],
        medium: ["zebra", "camel", "panda", "tiger", "horse"],
        hard: ["kangaroo", "chameleon", "armadillo", "hippopotamus", "platypus"]
    },
    Country: {
        easy: ["egypt", "china", "india", "spain", "japan"],
        medium: ["brazil", "turkey", "canada", "mexico", "sweden"],
        hard: ["kazakhstan", "azerbaijan", "madagascar", "mozambique", "liechtenstein"]
    },
    Sport: {
        easy: ["soccer", "tennis", "boxing", "golf", "chess"],
        medium: ["cricket", "fencing", "surfing", "judo", "rugby"],
        hard: ["triathlon", "decathlon", "bobsleigh", "skeleton", "squash"]
    }
};

let wordToGuess = "";
if (wordBank[category] && wordBank[category][level]) {
    const words = wordBank[category][level];
    wordToGuess = words[Math.floor(Math.random() * words.length)];
} else {
    console.error("Invalid category or level from localStorage");
}

let numbersOfLetters = wordToGuess.length;

// ========================
// Generate Inputs
// ========================

function generateInput() {
    const inputsContainer = document.querySelector(".inputs");

    for (let i = 1; i <= numbersOfTries; i++) {
        const tryDiv = document.createElement("div");
        tryDiv.classList.add(`try-${i}`);
        tryDiv.innerHTML = `<span>Try ${i}</span>`;
        if (i !== 1) tryDiv.classList.add("disabled-inputs");

        for (let j = 1; j <= numbersOfLetters; j++) {
            const input = document.createElement("input");
            input.type = "text";
            input.id = `guess${i}-letter-${j}`;
            input.setAttribute("maxlength", "1");
            tryDiv.appendChild(input);
        }
        inputsContainer.appendChild(tryDiv);
    }

    // Focus first input of first try
    inputsContainer.children[0].querySelector("input").focus();

    // Disable all other inputs
    document.querySelectorAll(".disabled-inputs input").forEach(input => input.disabled = true);

    // Handle input navigation and formatting
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input, index) => {
        input.addEventListener("keyup", function (event) {
            const key = event.key;
            if (!/^[a-zA-Z]$/.test(key)) {
                this.value = "";
                return;
            }
            this.value = this.value.toUpperCase();

            const ignored = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Backspace", "Tab"];
            if (!ignored.includes(key)) {
                const nextInput = inputs[index + 1];
                if (nextInput) nextInput.focus();
            }
        });

        input.addEventListener("keydown", function (event) {
            const idx = Array.from(inputs).indexOf(event.target);
            if (event.key === "ArrowRight" && idx + 1 < inputs.length) inputs[idx + 1].focus();
            if (event.key === "ArrowLeft" && idx - 1 >= 0) inputs[idx - 1].focus();
        });
    });
}

// ========================
// Guess Handling
// ========================

guessButton.addEventListener("click", handleGuesses);

function handleGuesses() {
    let successGuess = true;

    for (let i = 1; i <= numbersOfLetters; i++) {
        const inputField = document.querySelector(`#guess${currentTry}-letter-${i}`);
        const letter = inputField.value.toLowerCase();
        const actualLetter = wordToGuess[i - 1];

        if (letter === actualLetter) {
            inputField.classList.add("yes-in-place");
        } else if (wordToGuess.includes(letter) && letter !== "") {
            inputField.classList.add("not-in-place");
            successGuess = false;
        } else {
            inputField.classList.add("no");
            successGuess = false;
        }
    }

    // Handle win/lose
    if (successGuess) {
        showEndGamePopup(true, wordToGuess);
    } else {
        document.querySelector(`.try-${currentTry}`).classList.add("disabled-inputs");
        document.querySelectorAll(`.try-${currentTry} input`).forEach(input => input.disabled = true);

        currentTry++;
        const nextTryInputs = document.querySelectorAll(`.try-${currentTry} input`);

        if (nextTryInputs.length > 0) {
            document.querySelector(`.try-${currentTry}`).classList.remove("disabled-inputs");
            nextTryInputs.forEach(input => input.disabled = false);
            nextTryInputs[0].focus();
        } else {
            showEndGamePopup(false, wordToGuess);
        }
    }
}

// ========================
// Hint System
// ========================

getHintButton.addEventListener("click", getHint);

function getHint() {
    if (numberOfHints > 0) {
        numberOfHints--;
        document.querySelector(".hint span").innerHTML = numberOfHints;
    }
    if (numberOfHints === 0) getHintButton.disabled = true;

    const enabledInputs = document.querySelectorAll("input:not([disabled])");
    const emptyEnabledInputs = Array.from(enabledInputs).filter(input => input.value === "");

    if (emptyEnabledInputs.length > 0) {
        const randomInput = emptyEnabledInputs[Math.floor(Math.random() * emptyEnabledInputs.length)];
        const indexToFill = Array.from(enabledInputs).indexOf(randomInput);
        randomInput.value = wordToGuess[indexToFill].toUpperCase();
    }
}

// ========================
// Backspace Navigation
// ========================

document.addEventListener("keydown", handleBackspace);

function handleBackspace(event) {
    if (event.key === "Backspace") {
        const inputs = document.querySelectorAll("input:not([disabled])");
        const currentIndex = Array.from(inputs).indexOf(document.activeElement);
        if (currentIndex > 0) {
            const currentInput = inputs[currentIndex];
            const prevInput = inputs[currentIndex - 1];
            currentInput.value = "";
            prevInput.value = "";
            prevInput.focus();
        }
    }
}

// ========================
// Game End Popup
// ========================

function showEndGamePopup(isWin, word) {
    document.querySelectorAll(".inputs > div").forEach(div => div.classList.add("disabled-inputs"));
    guessButton.disabled = true;
    getHintButton.disabled = true;

    const popupContainer = document.createElement("div");
    popupContainer.className = "end-popup";

    const popupBox = document.createElement("div");
    popupBox.className = "popup-box";

    const status = document.createElement("h2");
    status.textContent = isWin ? "🎉 You Win!" : "💀 You Lose!";
    status.style.color = isWin ? "green" : "red";

    const reveal = document.createElement("p");
    reveal.innerHTML = `The word was: <span>${word}</span>`;

    const retryBtn = document.createElement("button");
    retryBtn.textContent = "🔁 Try Again";
    retryBtn.onclick = () => location.href = "index.html";

    const exitBtn = document.createElement("button");
    exitBtn.textContent = "❌ Exit";
    exitBtn.onclick = () => popupContainer.remove();

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "popup-buttons";
    buttonContainer.appendChild(retryBtn);
    buttonContainer.appendChild(exitBtn);

    popupBox.appendChild(status);
    popupBox.appendChild(reveal);
    popupBox.appendChild(buttonContainer);
    popupContainer.appendChild(popupBox);
    document.body.appendChild(popupContainer);
}

// ========================
// Rules Popup
// ========================

let ruleBtn = document.querySelector(".rules span");
ruleBtn.onclick = function () {
    const ruleContainer = document.createElement("div");
    ruleContainer.className = "rule-container";

    const ruleBox = document.createElement("div");
    ruleBox.className = "rule-box";

    const closeBtn = document.createElement("span");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "X";
    closeBtn.onclick = () => ruleContainer.remove();

    const ruleContent = document.createElement("div");
    ruleContent.className = "rule-content";
    ruleContent.innerHTML = `
    <h2>Game Rules</h2>
    <p>The word is based on the level and category you chose.</p>
    <p>You can use hints but they are limited.</p>
    <p>Colors will guide you:</p>
    <div class="colors">
      <div class="correct-in-place"><span>yellow</span> = correct letter in place</div>
      <div class="correct-not-in-place"><span>green</span> = correct letter wrong place</div>
      <div class="wrong"><span>gray</span> = wrong letter</div>
    </div>`;

    ruleBox.appendChild(closeBtn);
    ruleBox.appendChild(ruleContent);
    ruleContainer.appendChild(ruleBox);
    document.body.appendChild(ruleContainer);
};

// ========================
// Initialize Game
// ========================

window.onload = function () {
    generateInput();
};
