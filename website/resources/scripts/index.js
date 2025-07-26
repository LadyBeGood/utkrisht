window.location.href += '#guide/tutorial';

// whenever hash of the site changes, handle routes
window.addEventListener("hashchange", handleRoute);

// intial route handling when the pages loads
window.addEventListener("load", handleRoute);

function styleNavigator(href) {
    document.querySelectorAll(`a.navigator`).forEach((a) => {
        if (a.getAttribute("href") === "href") {
            if (a.classList.contains("active")) return;
            else {
                a.classList.add("active")
            }
        } else {
            a.classList.remove("active")
        }
    })
    document.querySelector(`a.navigator[href="${href}"]`).classList.add("active")
}

function handleRoute() {
    const page = location.hash.slice(1) || "home";
    const match = location.hash.match(/#[^/\s]+/g)?.[0] ?? "#";

    styleNavigator(match)
    Navigate("pages/" + page);
}

async function Navigate(page) {
    // element where page contents will be inserted
    const origin = document.querySelector("#origin");
    
    const spinnerContainer = document.querySelector("main .spinner-container");
    
    // delay the rendering of spinner by 100ms to avoid flickering UI while rapidly switching tabs
    const loadingTimeout = setTimeout(() => {
        origin.innerHTML = "";
        spinnerContainer.style.display = "block";
    }, 100);
    
    const endLoading = () => {
        clearTimeout(loadingTimeout);
        spinnerContainer.style.display = "none";
    }
    

    try {
        // get the page contents
        const responseHTML = await fetch(`${page}.html`);
        const html = await responseHTML.text();
        
        // display the page contents inside origin
        endLoading()
        origin.innerHTML = html;

        // prism.js is implemented as a for loop looping over different html-classes of elements instead of a web component,
        // hence it requires to be reinitialised everytime the page renders
        Prism.highlightAll();

    } catch (error) {
        // display the error message, both in page and in console
        endLoading()
        origin.innerHTML = "Error fetching page: " + error;
        console.error(error);
    }
}



