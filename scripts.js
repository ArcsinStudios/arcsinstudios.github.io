if (window.CSS) {
    CSS.registerProperty({
        name: "--start-stop",
        syntax: "<color>",
        inherits: false,
        initialValue: "transparent"
    });
    CSS.registerProperty({
        name: "--end-stop",
        syntax: "<color>",
        inherits: false,
        initialValue: "transparent"
    });
}

var searchBoxVisible = false;

document.addEventListener("keydown", function(event) {
    if (event.key === 's') {
        var searchBox = document.getElementById("search");
        event.preventDefault();
        searchBoxVisible = !searchBoxVisible;
        if (searchBoxVisible) {
            searchBox.style.display = "none";
        } else {
            searchBox.style.display = "block";
        }
    }
});

function initTheme() {
    var page = document.getElementById("page");
    var footer = document.getElementById("footer");
    var theme = localStorage.getItem("theme");
    if (theme === "dark") {
        page.classList.remove("light-background");
        page.classList.add("dark-background");
        footer.classList.remove("black-text");
        footer.classList.add("white-text");
    }
    page.style.display = "block";
}
window.onload = initTheme;

function toggleTheme() {
    var page = document.getElementById("page");
    var theme = localStorage.getItem("theme");
    if (theme === null || theme === "light") {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
    page.classList.toggle("light-background");
    page.classList.toggle("dark-background");
    footer.classList.toggle("black-text");
    footer.classList.toggle("white-text");
}

function navigateTo(url) {
    window.location.href = url;
}

function getInputValue() {
    var input = document.getElementById("search");
    return input.value;
}

function submitJump(event) {
    var input = getInputValue();
    if (event.keyCode === 13 && !input.includes("arcsin-is-us")) {
        navigateTo(input);
    }
}

function checkEasterEgg() {
    if (getInputValue() === "BABA IS YOU") {
        navigateTo("arcsin-is-us/");
    }
}
