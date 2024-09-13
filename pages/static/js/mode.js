if (localStorage.lightmode) {
    if (localStorage.lightmode == "false") {
        document.body.setAttribute("data-bs-theme", "dark");
    }
} else {
    if (window.matchMedia) {
        localStorage.lightmode = window.matchMedia("prefers-color-scheme: dark").matches ? "false" : "true";
    } else {
        localStorage.lightmode = "false";
    }

    if (localStorage.lightmode == "false") {
        document.body.setAttribute("data-bs-theme", "dark");
    }
}

document.querySelector("#toggle-mode-button").addEventListener("click", () => {
    document.body.setAttribute("data-bs-theme", document.body.getAttribute("data-bs-theme") == "dark" ? "" : "dark");
    localStorage.lightmode = document.body.getAttribute("data-bs-theme") != "dark" ? "true" : "false";
});