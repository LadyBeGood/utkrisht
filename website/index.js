import "./components/injectSVG.js";
import "./components/loadingSpinner.js";

window.addEventListener("hashchange", handleRoute);
window.addEventListener("load", handleRoute);

function handleRoute() {
    let page = location.hash.slice(1) || "home";
    Navigate("website/pages/" + page);
}


async function Navigate(page) {
    const origin = document.querySelector("#origin");
    const loader = document.querySelector("main loading-spinner");

    let loadingTimeout = setTimeout(() => {
        origin.innerHTML = "";
        loader.style.display = "block";
    }, 100);

    try {
        const response = await fetch(page + "/index.html");
        const html = await response.text();
        clearTimeout(loadingTimeout);
        loader.style.display = "none";
        origin.innerHTML = html;
        Prism.highlightAll();

    } catch (error) {
        clearTimeout(loadingTimeout);
        const errorMessage = "Error fetching page: " + error;
        console.error(errorMessage);
        loader.style.display = "none";
        origin.innerHTML = errorMessage;
    }
}



