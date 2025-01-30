if (window.CSS) {
    CSS.registerProperty({
        name: '--start-stop',
        syntax: '<color>',
        inherits: false,
        initialValue: 'transparent'
    });
    CSS.registerProperty({
        name: '--end-stop',
        syntax: '<color>',
        inherits: false,
        initialValue: 'transparent'
    });
}

function initTheme() {
    var page = document.getElementById("page");
    var theme = localStorage.getItem("theme");
    if (theme === "dark") {
        page.classList.remove("light-background");
        page.classList.add("dark-background");
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
}

function navigateTo(url) {
    window.location.href = url;
}

function getInputValue() {
    var input = document.getElementById("search");
    return input.value;
}

function submitJump(event) {
    if (event.keyCode === 13) {
        navigateTo(getInputValue());
    }
}
