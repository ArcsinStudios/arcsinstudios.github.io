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

function toggleTheme() {
    var page = document.getElementById("page");
    page.classList.toggle("light-background");
    page.classList.toggle("dark-background");
}
