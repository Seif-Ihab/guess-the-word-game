// make variable for start button
let gameBtn = document.querySelector("#start-btn");

// function triggered when click start button
gameBtn.onclick = function () {

    // Get selected level (radio button)
    let level = document.querySelector('input[name="level"]:checked');

    // Get selected category (from <select>)
    let category = document.querySelector('select[name="category"]').value;

    // Save to localStorage
    localStorage.setItem("level", level.id);
    localStorage.setItem("category", category);

    // Redirect to game page
    window.location.href = "game.html";
};