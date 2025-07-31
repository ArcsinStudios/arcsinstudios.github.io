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

var currPage = 1;
var minPage = 1;
var maxPage = 2;

var pages = [];
for (let i = minPage; i <= maxPage; ++i) {
    pages.push(document.getElementById("page" + i));
}

var stupid = localStorage.getItem("stupid");
if (stupid === null) {
    stupid = "0";
    localStorage.setItem("stupid", stupid);
}

document.addEventListener("keydown", function(event) {
    if (event.code === "KeyS") {
        if (document.activeElement.tagName !== "INPUT") {
            var searchBox = document.getElementById("search");
            event.preventDefault();
            searchBoxVisible = !searchBoxVisible;
            if (searchBoxVisible) {
                searchBox.style.display = "block";
            }
            else {
                searchBox.style.display = "none";
            }
        }
    }
    else if (event.code === "KeyA" || event.code == "ArrowLeft") {
        if (document.activeElement.tagName !== "INPUT") {
            event.preventDefault();
            prevPage();
        }
    }
    else if (event.code === "KeyD" || event.code == "ArrowRight") {
        if (document.activeElement.tagName !== "INPUT") {
            event.preventDefault();
            nextPage();
        }
    }
});

function initTheme() {
    var page = document.getElementById("page");
    var footer = document.getElementById("footer");
    var pageLeft = document.getElementById("page-left");
    var pageRight = document.getElementById("page-right");
    var theme = localStorage.getItem("theme");
    if (theme === "dark") {
        page.classList.remove("light-background");
        page.classList.add("dark-background");
        footer.classList.remove("black-text");
        footer.classList.add("white-text");
        if (pageLeft !== null && pageRight !== null) {
            pageLeft.classList.remove("black-text");
            pageRight.classList.remove("black-text");
            pageLeft.classList.add("white-text");
            pageRight.classList.add("white-text");
        }
    }
    page.style.display = "block";
}
window.onload = initTheme;

function toggleTheme() {
    var page = document.getElementById("page");
    var footer = document.getElementById("footer");
    var pageLeft = document.getElementById("page-left");
    var pageRight = document.getElementById("page-right");
    var theme = localStorage.getItem("theme");
    if (theme === null || theme === "light") {
        localStorage.setItem("theme", "dark");
    }
    else {
        localStorage.setItem("theme", "light");
    }
    page.classList.toggle("light-background");
    page.classList.toggle("dark-background");
    footer.classList.toggle("black-text");
    footer.classList.toggle("white-text");
    if (pageLeft !== null && pageRight !== null) {
        pageLeft.classList.toggle("black-text");
        pageRight.classList.toggle("black-text");
        pageLeft.classList.toggle("white-text");
        pageRight.classList.toggle("white-text");
    }
}

function showPage() {
    for (let i = minPage - 1; i < maxPage; ++i) {
        if (i + 1 != currPage) {
            pages[i].style.display = "none";
        }
        else {
            pages[i].style.display = "block";
        }
    }
}

function prevPage() {
    if (!(currPage <= minPage)) {
        --currPage;
    }
    showPage();
}

function nextPage() {
    if (!(currPage >= maxPage)) {
        ++currPage;
    }
    showPage();
}

function navigateTo(url) {
    window.location.href = url;
}

function getInputValue() {
    var input = document.getElementById("search");
    return input.value;
}

function checkMalicious(input) {
    if (input.includes(":")) {
        if (!(input.startsWith("http://") || input.startsWith("https://"))) {
            return false;
        }
        return true;
    }
    for (let i = 0; i < input.length; ++i) {
        const code = input.charCodeAt(i);
        if (!(
            (code >= 45 && code <= 47) ||
            (code >= 48 && code <= 57) ||
            (code >= 65 && code <= 90) ||
            (code >= 97 && code <= 122)
        )) {
            return false;
        }
    }
    return true;
}

function submitJump(event) {
    var input = getInputValue();
    if (event.code === "Enter") {
        if (checkMalicious(input)) {
            if (input === "http://" || input === "https://") {
                stupid = String(parseInt(stupid, 10) + 1);
                localStorage.setItem("stupid", stupid);
                alert("Invalid URL: what the heck are you doing??\n无效的URL：你特么到底在干什么？？\n" + stupid);
            }
            else {
                navigateTo(input);
            }
        }
        else {
            alert("Invalid character(s) detected.\n检测到无效字符。");
        }
    }
}

function checkEasterEgg() {
    if (getInputValue() === "BABA IS YOU") {
        navigateTo("arcsin-is-us/");
    }
}
