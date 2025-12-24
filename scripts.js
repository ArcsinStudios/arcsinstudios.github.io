"use strict";

/* vvv CSS vvv */
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
/* ^^^ CSS ^^^ */

/* vvv GENERATION vvv */
genLangBtn();
genThemeBtn();
genTitle();
genSubtitle();
genPageBtn();
genSearch();
genFooter();
/* ^^^ GENERATION ^^^ */

/* vvv VARIABLE vvv */
/* vvv SWITCH vvv */
let searchBoxVisible = false;
/* ^^^ SWITCH ^^^ */

/* vvv ELEMENT vvv */
let page = document.getElementById("page");
let pageLeft = document.getElementById("page-left");
let pageRight = document.getElementById("page-right");
let footer = document.getElementById("footer");
let blueOrPurple = document.getElementById("blue-or-purple");
/* ^^^ ELEMENT ^^^ */

/* vvv PAGE vvv */
let currPage = 1;
let minPage = 1;
let maxPage = 3;
let pages = [];
/* ^^^ PAGE ^^^ */

/* vvv LOCAL STORAGE vvv */
let theme = localStorage.getItem("theme");
let stupid = localStorage.getItem("stupid");
/* ^^^ LOCAL STORAGE ^^^ */
/* ^^^ VARIABLE ^^^ */

/* vvv INITIALIZATION vvv */
initTheme();
initPage();
initStupid();
/* ^^^ INITIALIZATION ^^^ */

/* vvv LISTENER vvv */
document.addEventListener("keydown", handleKeydown);
/* ^^^ LISTENER ^^^ */

/* vvv DISPLAY vvv */
page.style.display = "block";
/* ^^^ DISPLAY ^^^ */

/* vvv FUNCTION vvv */
/* vvv HELPER vvv */
function l10nHelper(func0, func1) {
    if (window.location.pathname.startsWith("/zh-cn/")) {
        func1();
    }
    else {
        func0();
    }
}
/* ^^^ HELPER ^^^ */

/* vvv GENERATION vvv */
function genLangBtn() {
    let langBtn = document.getElementById("lang-btn");
    if (langBtn) {
        langBtn.setAttribute("type", "button");
        langBtn.classList.add("lang-button");
        langBtn.style.position = "absolute";
        let text0;
        let text1;
        let text2;
        l10nHelper(
            function() {
                text0 = "/zh-cn" + window.location.pathname;
                text1 = 225;
                text2 = 10;
                langBtn.textContent = "中文";
            },
            function() {
                text0 = window.location.pathname.substring(6);
                text1 = 175;
                text2 = 20;
                langBtn.textContent = "English";
            }
        );
        langBtn.setAttribute("onclick", `navigateTo("${text0}")`);
        langBtn.style.right = `${text1}px`;
        langBtn.style.top = `${text2}px`;
    }
}

function genThemeBtn() {
    let themeBtn = document.getElementById("theme-btn");
    if (themeBtn) {
        themeBtn.setAttribute("onclick", "toggleTheme()");
        themeBtn.setAttribute("type", "button");
        themeBtn.classList.add("theme-button");
        themeBtn.style.position = "absolute";
        themeBtn.style.right = "10px";
        themeBtn.style.top = "10px";
        l10nHelper(
            function() {
                themeBtn.textContent = "Toggle Theme";
            },
            function() {
                themeBtn.textContent = "切换主题";
            }
        )
    }
}

function genTitle() {
    let title = document.getElementById("title");
    let text0;
    if (title) {
        text0 = title.dataset.text;
        if (!text0) {
            text0 = "~ Arcsin Studios ~";
        }
        title.classList.add("gradient-text0");
        title.style.textAlign = "center";
        title.innerHTML = `<h1>${text0}</h1>`;
    }
}

function genSubtitle() {
    let subtitle = document.getElementById("subtitle");
    let text0;
    if (subtitle) {
        text0 = subtitle.dataset.text;
        if (!text0) {
            l10nHelper(
                function() {
                    text0 = "Craft · Narrate · Code";
                },
                function() {
                    text0 = "创造 · 叙述 · 程序";
                }
            );
        }
        subtitle.classList.add("gradient-text1");
        subtitle.style.textAlign = "center";
        subtitle.innerHTML = `<h2>${text0}</h2>`;
    }
}

function genPageBtn() {
    let pageBtn = document.getElementById("page-btn");
    if (pageBtn) {
        pageBtn.classList.add("container-wrapper");
        pageBtn.innerHTML = "\
            <p id=\"page-left\" class=\"black-text page-button\" style=\"left:-5vw;\" onclick=\"prevPage()\">⯇</p>\n\
            <p id=\"page-right\" class=\"black-text page-button\" style=\"right:-5vw;\" onclick=\"nextPage()\">⯈</p>\
        ";
    }
}

function genSearch() {
    let search = document.getElementById("search");
    if (search) {
        search.setAttribute("onkeypress", "submitJump(event)");
        search.setAttribute("type", "text");
        search.classList.add("search-box");
        l10nHelper(
            function(){
                search.setAttribute("placeholder", "Jump to page...");
            },
            function() {
                search.setAttribute("placeholder", "跳转至页面……");
            }
        );
    }
}

function genFooter() {
    let footer = document.getElementById("footer");
    if (footer) {
        footer.classList.add("black-text");
        let text0 = new Date().getFullYear();
        let text1;
        let text2;
        let text3;
        let text4;
        l10nHelper(
            function() {
                text1 = ". ";
                text2 = "";
                text3 = "Some Rights Reserved";
                text4 = ".";
            },
            function() {
                text1 = " 版权所有。";
                text2 = "/zh-cn"
                text3 = "保留部分权利";
                text4 = "。";
            }
        );
        footer.innerHTML = `© 2024-${text0} Arcsin Studios${text1}<a href="${text2}/copyright/" style="color:dodgerblue;">${text3}</a>${text4}`;
    }
}
/* ^^^ GENRERATION ^^^ */

/* vvv PAGE vvv */
function initPage() {
    for (let i = minPage; i <= maxPage; ++i) {
        pages.push(document.getElementById("page" + i));
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
/* ^^^ PAGE ^^^ */

/* vvv THEME vvv */
function initTheme() {
    if (theme === "dark") {
        page.classList.remove("light-background");
        page.classList.add("dark-background");
        footer.classList.remove("black-text");
        footer.classList.add("white-text");
        if (pageLeft && pageRight) {
            pageLeft.classList.remove("black-text");
            pageRight.classList.remove("black-text");
            pageLeft.classList.add("white-text");
            pageRight.classList.add("white-text");
        }
        if (blueOrPurple) {
            l10nHelper(
                function() {
                    blueOrPurple.textContent = "purple";
                },
                function() {
                    blueOrPurple.textContent = "紫色";
                }
            );
        }
    }
}

function toggleTheme() {
    if (!theme || theme === "light") {
        localStorage.setItem("theme", "dark");
    }
    else {
        localStorage.setItem("theme", "light");
    }
    theme = localStorage.getItem("theme");
    page.classList.toggle("light-background");
    page.classList.toggle("dark-background");
    footer.classList.toggle("black-text");
    footer.classList.toggle("white-text");
    if (pageLeft && pageRight) {
        pageLeft.classList.toggle("black-text");
        pageRight.classList.toggle("black-text");
        pageLeft.classList.toggle("white-text");
        pageRight.classList.toggle("white-text");
    }
    if (blueOrPurple) {
        if (theme === "light") {
            l10nHelper(
                function() {
                    blueOrPurple.textContent = "blue";
                },
                function() {
                    blueOrPurple.textContent = "蓝色";
                }
            );
        }
        else {
            l10nHelper(
                function() {
                    blueOrPurple.textContent = "purple";
                },
                function() {
                    blueOrPurple.textContent = "紫色";
                }
            );
        }
    }
}
/* ^^^ THEME ^^^ */

/* vvv LISTENER vvv */
function handleKeydown(event) {
    if (event.code === "KeyS") {
        if (document.activeElement.tagName !== "INPUT") {
            let searchBox = document.getElementById("search");
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
}
/* ^^^ LISTENER ^^^ */

/* vvv NAVIGATION vvv */
function initStupid() {
    if (!stupid) {
        stupid = "0";
        localStorage.setItem("stupid", stupid);
    }
}

function navigateTo(url) {
    window.location.href = url;
}

function getSearch() {
    let input = document.getElementById("search");
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
    let input = getSearch();
    if (event.code === "Enter") {
        if (checkMalicious(input)) {
            if (input === "http://" || input === "https://") {
                stupid = String(parseInt(stupid, 10) + 1);
                localStorage.setItem("stupid", stupid);
                l10nHelper(
                    function() {
                        alert("Invalid URL: what the heck are you doing?\nYou've done that " + stupid + " time(s).");
                    },
                    function() {
                        alert("无效的URL：你特么的在干什么？\n你已经干了这种事 " + stupid + " 次了。");
                    }
                );
            }
            else {
                navigateTo(input);
            }
        }
        else {
            l10nHelper(
                function() {
                    alert("Invalid character(s) detected.");
                },
                function() {
                    alert("检测到无效字符。");
                }
            );
        }
    }
}
/* ^^^ NAVIGATION ^^^ */
/* ^^^ FUNCTION ^^^ */

// Woah, an Easter Egg!
function checkEasterEgg() {
    if (getSearch() === "BABA IS YOU") {
        navigateTo("arcsin-is-us/");
    }
}
