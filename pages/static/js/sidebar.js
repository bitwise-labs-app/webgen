const sidebar = document.querySelector("#sidebar");

document.querySelector(".header-menu > a").addEventListener("click", () => {
    sidebar.setAttribute(
        "data-visible",
        sidebar.getAttribute("data-visible") == "true" ? "false" : "true"
    )
});