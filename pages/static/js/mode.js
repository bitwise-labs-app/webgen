if (localStorage.lightmode) {
    if (localStorage.lightmode == "true") {
        document.body.classList.add("lightmode");
    }
} else {
    if (window.matchMedia) {
        localStorage.lightmode = window.matchMedia("prefers-color-scheme: dark").matches ? "false" : "true";
    } else {
        localStorage.lightmode = "false";
    }

    if (localStorage.lightmode == "true") {
        document.body.classList.add("lightmode");
    }
}

document.querySelector(".header-mode-toggle").addEventListener("click", () => {
    document.body.classList.toggle("lightmode");
    localStorage.lightmode = document.body.classList.contains("lightmode") ? "true" : "false";
});