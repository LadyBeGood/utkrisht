import { examples } from "./examples.js"
import { elements } from "./elements.js"

function debug(x) {
    console.log(x);
    return x;
}

function showSettingsMenu() {
    elements.settingsOverlay.style.display = "block"
    elements.settingsMenu.style.display = "grid"
}

function hideSettingsMenu() {
    elements.settingsOverlay.style.display = "none"
    elements.settingsMenu.style.display = "none"
}


function spacesToTab(editor, tabWidth, value) {
    const source = value ?? editor.getValue();

    const updatedSource = source.replace(/^( +)/gm, (match) => {
        const count = match.length;
        const tabs = "\t".repeat(Math.floor(count / tabWidth));
        const remainingSpaces = " ".repeat(count % tabWidth);

        return tabs + remainingSpaces;
    });

    editor.setValue(updatedSource, 0);
    editor.clearSelection();
}

function tabToSpaces(editor, tabWidth, value) {
    const source = value ?? editor.getValue();
    const spaceString = " ".repeat(tabWidth);

    const updatedSource = source.replace(/\t/g, spaceString);

    editor.setValue(updatedSource, 0);
    editor.clearSelection();
}

function setupSettings(editor) {
    elements.settings.addEventListener("click", function () {
        showSettingsMenu();
    });

    elements.settingsOverlay.addEventListener("click", function () {
        hideSettingsMenu();
    })


    /* Theme */
    editor.setTheme(elements.settingsTheme.value);
    elements.settingsTheme.addEventListener("change", function () {
        editor.setTheme(elements.settingsTheme.value)
    });


    /* Keybindings */
    const currentKeybinding = document.querySelector("[data-settings-keybinding='active']").value;
    editor.setKeyboardHandler(currentKeybinding !== "null" ? currentKeybinding : null);

    elements.settingsKeybindingCollection.forEach(function (element) {
        element.addEventListener("click", function () {

            elements.settingsKeybindings.forEach(function (button) {
                if (button === element) {
                    button.dataset.settingsKeybinding = "active"
                    editor.setKeyboardHandler(button.value !== "null" ? button.value : null);
                } else {
                    button.dataset.settingsKeybinding = ""
                }
            })
        })
    })


    /* Font size */
    editor.setFontSize(Number(elements.settingsFontSize.value));
    elements.settingsFontSize.addEventListener("change", function () {
        editor.setFontSize(Number(elements.settingsFontSize.value))
    });


    /* Cursor style */
    elements.settingsCursorStyle.addEventListener("change", function () {
        editor.setOption("cursorStyle", debug(elements.settingsCursorStyle.value))
    })


    /* Tab size */
    elements.settingsTabSize.addEventListener("change", function () {
        const newSize = Number(this.value);
        console.log(newSize)
        const oldSize = editor.session.getTabSize();

        if (elements.settingsInsertSpaces.checked && oldSize !== newSize && newSize > 0) {
            const source = editor.getValue();
            const updatedSource = source.replace(/^( +)/gm, (match) => {
                return " ".repeat(Math.round(match.length / oldSize) * newSize);
            });
            editor.setValue(updatedSource, 0);
            editor.clearSelection();
        }

        editor.session.setTabSize(newSize);

    })


    /* Insert spaces */
    elements.settingsInsertSpaces.addEventListener("click", function () {
        editor.session.setUseSoftTabs(elements.settingsInsertSpaces.checked);
        if (elements.settingsInsertSpaces.checked) {
            tabToSpaces(editor, Number(elements.settingsTabSize.value))
        } else {
            spacesToTab(editor, Number(elements.settingsTabSize.value))
        }
    })


    /* Show invisible characters */
    editor.setShowInvisibles(elements.settingsShowInvisibleCharacters.checked)
    elements.settingsShowInvisibleCharacters.addEventListener("change", function () {
        editor.setShowInvisibles(elements.settingsShowInvisibleCharacters.checked);
    })


    /* Settings keyboard accessibility mode */
    editor.setOptions({ enableKeyboardAccessibility: elements.settingsKeyboardAccessibilityMode.checked })
    elements.settingsKeyboardAccessibilityMode.addEventListener("change", function () {
        editor.setOptions({ enableKeyboardAccessibility: elements.settingsKeyboardAccessibilityMode.checked })
    })
}

function setupExampleSelection(editor) {
    function setText() {
        let source = examples[elements.examples.value];
        const tabWidth = Number(elements.settingsTabSize.value);
        const insertSpaces = elements.settingsInsertSpaces.checked;

        // For safety
        if (tabWidth < 1) {
            tabWidth = 1;
        }

        if (insertSpaces) {
            source = source.replaceAll("\t", " ".repeat(tabWidth));
        }

        editor.setValue(source);
        editor.clearSelection()
        editor.session.setTabSize(tabWidth);
        editor.session.setUseSoftTabs(insertSpaces);
    }

    setText();
    elements.examples.addEventListener("change", setText);
}

function setupAceEditor(editor) {
    editor.getSession().setMode("ace/mode/utkrisht");

    // source: https://groups.google.com/g/ace-discuss/c/FDyNuFJCvTw?pli=1
    editor.setOption("scrollPastEnd", 0.7);
    editor.setOption("showPrintMargin", false);

    // Adds 200 pixels of extra scrollable space to the right of the last column
    editor.renderer.setScrollMargin(0, 0, 0, 50);

    // Target the internal scroller element of Ace
    editor.renderer.scroller.style.touchAction = "pan-x pan-y";


    setupExampleSelection(editor);
    setupSettings(editor);
}


function setupResponsiveness() {
    const mobileQuery = window.matchMedia("(max-width: 480px)");

    function handleTabletChange(event) {
        let fontSize = 16;
        let tabSize = 4;

        if (event.matches) {
            fontSize = 14;
            tabSize = 2;
        }

        elements.settingsFontSize.value = fontSize;
        elements.settingsTabSize.value = tabSize;

        const changeEvent = new Event('change', { bubbles: true });
        elements.settingsFontSize.dispatchEvent(changeEvent);
        elements.settingsTabSize.dispatchEvent(changeEvent);
    }

    mobileQuery.addEventListener("change", handleTabletChange);
    handleTabletChange(mobileQuery);
}

function setupShortcutButtonsToggle() {
    function handleClick() {
        console.log(elements.shortcutButtons.dataset.isVisible)
        if (elements.shortcutButtons.dataset.isVisible === "no") {
            elements.shortcutButtons.style.transform = "translateY(100%)";
            elements.shortcutButtons.dataset.isVisible = "yes";
            elements.left.style.paddingBottom = "0";
            elements.shortcutButtonsToggler.querySelector("img").style.transform = "rotate(180deg)";
        } else {
            elements.shortcutButtons.style.transform = "translateY(0%)"
            elements.shortcutButtons.dataset.isVisible = "no";
            elements.left.style.paddingBottom = "72px";
            elements.shortcutButtonsToggler.querySelector("img").style.transform = "rotate(0deg)";
        }

        // Prevents engine from batching this styling
        setTimeout(() => elements.left.style.setProperty("--transition-duration", "0.25s"));
    }

    elements.shortcutButtonsToggler.addEventListener("click", function () {
        handleClick();
    })

    handleClick()
}



// export function setupDocumentation() {
//     const fileContentCache = {};
//     let searchMatches = [];
//     let currentMatchIndex = -1;


//     // Load the active item on startup, or fall back to the first available sub-topic item
//     const initialActiveSubtopic =
//         elements.documentationSidebar.querySelector("[data-sub-topic].active") ??
//         elements.documentationSubTopicCollection[0];

//     if (initialActiveSubtopic) {
//         loadDocumentationFile(initialActiveSubtopic.dataset.fileName);
//     }



//     async function loadDocumentationFile(fileKey, skipContentInsertion = false) {
//         if (!fileKey) return "";

//         const filePath = `./documentations/${fileKey}.md`;

//         try {
//             // Fetch from network if the file is not already in the cache
//             if (!fileContentCache[fileKey]) {
//                 const response = await fetch(filePath);
//                 if (!response.ok) {
//                     throw new Error(`Could not load file: ${filePath}`);
//                 }

//                 const markdownText = await response.text();
//                 const HTMLText = marked.parse(markdownText);

//                 fileContentCache[fileKey] = HTMLText;
//             }

//             // Insert into main content pane if we are not in the middle of a background search scan
//             if (!skipContentInsertion) {
//                 elements.documentationContent.innerHTML = fileContentCache[fileKey];
//                 elements.documentationContent.scrollTop = 0;
//             }

//             return fileContentCache[fileKey];
//         } catch (error) {
//             console.error(`Documentation Loader Error:`, error);
//             if (!skipContentInsertion) {
//                 elements.documentationContent.innerHTML = `<div style="padding: 20px; color: #ff6b6b;">Error: Failed to load document.</div>`;
//             }
//             return "";
//         }
//     }

//     // Handle switching between sub-topics
//     elements.documentationSubTopicCollection.forEach(subTopic => {
//         subTopic.addEventListener("click", async () => {
//             elements.documentationSubTopicCollection.forEach(item => item.classList.remove("active"));
//             subTopic.classList.add("active");

//             const fileKey = subTopic.dataset.fileName;
//             await loadDocumentationFile(fileKey);
//         });
//     });


//     // Handle opening and closing folder directories (Language, Keybindings)
//     elements.documentationTopicNameCollection.forEach(heading => {
//         heading.addEventListener("click", () => {
//             const parentTopicElement = heading.closest("[data-topic]");
//             if (parentTopicElement) {
//                 parentTopicElement.classList.toggle("open");
//             }
//         });
//     });



//     async function executeSearch() {
//         const searchQuery = elements.documentationSearchField.value.toLowerCase().trim();

//         // If the search input is empty, reset the UI to standard navigation
//         if (searchQuery === "") {
//             elements.documentationSearchControls.style.display = "none";
//             elements.documentationSearchResults.style.display = "none";
//             elements.documentationTopics.style.display = "block"; // Show the standard topics tree

//             // Re-render the active document to remove highlighted mark elements
//             const currentActiveButton = elements.documentationSidebar.querySelector("[data-sub-topic].active");
//             if (currentActiveButton) {
//                 const fileKey = currentActiveButton.dataset.fileName;
//                 elements.documentationContent.innerHTML = fileContentCache[fileKey] || "";
//             }

//             searchMatches = [];
//             currentMatchIndex = -1;
//             return;
//         }

//         // Hide standard topic tree and show search results container
//         elements.documentationTopics.style.display = "none";
//         elements.documentationSearchResults.style.display = "block";
//         elements.documentationSearchResults.innerHTML = "";
//         searchMatches = [];

//         // Force download any files that are not yet loaded into memory
//         for (const button of elements.documentationSubTopicCollection) {
//             const fileKey = button.dataset.fileName;
//             if (!fileContentCache[fileKey]) {
//                 await loadDocumentationFile(fileKey, true);
//             }
//         }

//         // Scan text across all cached content
//         elements.documentationSubTopicCollection.forEach(button => {
//             const fileKey = button.dataset.fileName;
//             const fileHTML = fileContentCache[fileKey] || "";
//             const pageTitle = button.textContent.trim();

//             // Create an isolated HTML element to extract raw text content safely without tags
//             const temporaryParser = document.createElement("div");
//             temporaryParser.innerHTML = fileHTML;
//             const textContent = temporaryParser.textContent || temporaryParser.innerText || "";

//             // Escape special characters to construct a safe regular expression
//             const escapedQuery = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
//             const searchRegex = new RegExp(escapedQuery, "gi");
//             let executionMatch;

//             while ((executionMatch = searchRegex.exec(textContent)) !== null) {
//                 const textIndex = executionMatch.index;
//                 const windowStart = Math.max(0, textIndex - 40);
//                 const windowEnd = Math.min(textContent.length, textIndex + executionMatch[0].length + 45);

//                 let snippetText = textContent.substring(windowStart, windowEnd);
//                 if (windowStart > 0) snippetText = "..." + snippetText;
//                 if (windowEnd < textContent.length) snippetText = snippetText + "...";

//                 const highlightedSnippetHTML = snippetText.replace(searchRegex, match => `<mark>${match}</mark>`);

//                 searchMatches.push({
//                     fileKey: fileKey,
//                     metaText: pageTitle,
//                     snippetHTML: highlightedSnippetHTML,
//                     subTopicButton: button
//                 });
//             }
//         });

//         // Render search result cards or show "no matches found" feedback
//         if (searchMatches.length > 0) {
//             elements.documentationSearchControls.style.display = "flex";
//             currentMatchIndex = 0;

//             searchMatches.forEach((match, index) => {
//                 const resultCard = document.createElement("div");
//                 resultCard.className = "utk-search-card";
//                 resultCard.innerHTML = `
//                     <div class="utk-search-card__meta">${match.metaText}</div>
//                     <div class="utk-search-card__snippet">${match.snippetHTML}</div>
//                 `;

//                 resultCard.addEventListener("click", () => {
//                     currentMatchIndex = index;
//                     syncSearchNavigationState();
//                 });

//                 elements.documentationSearchResults.appendChild(resultCard);
//             });

//             syncSearchNavigationState();
//         } else {
//             elements.documentationSearchControls.style.display = "flex";
//             elements.documentationSearchResultCount.textContent = "0/0 results";
//             elements.documentationSearchResults.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 13px; color: #a9b2c3;">No matches found.</div>`;
//             currentMatchIndex = -1;
//         }
//     }

//     // ==========================================
//     // SELECTION STATE SYNCHRONIZATION
//     // ==========================================
//     function syncSearchNavigationState() {
//         if (currentMatchIndex < 0 || currentMatchIndex >= searchMatches.length) return;

//         const currentMatch = searchMatches[currentMatchIndex];

//         // Update the active button highlight state in the sidebar menu list
//         elements.documentationSubTopicCollection.forEach(item => item.classList.remove("active"));
//         currentMatch.subTopicButton.classList.add("active");

//         // Inject content text combined with structural text highlight tags
//         const sourceHTML = fileContentCache[currentMatch.fileKey];
//         const escapedQuery = elements.documentationSearchField.value.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
//         const highlightRegex = new RegExp(`(${escapedQuery})`, "gi");

//         elements.documentationContent.innerHTML = sourceHTML.replace(highlightRegex, `<mark class="utk-mark">$1</mark>`);

//         // Calculate and scroll to the correct match item index within the active page content viewport
//         const pageHighlightMarks = elements.documentationContent.querySelectorAll(".utk-mark");
//         if (pageHighlightMarks.length > 0) {
//             let relativeMatchCount = 0;
//             for (let i = 0; i < currentMatchIndex; i++) {
//                 if (searchMatches[i].fileKey === currentMatch.fileKey) {
//                     relativeMatchCount++;
//                 }
//             }

//             const activeMarkElement = pageHighlightMarks[relativeMatchCount] || pageHighlightMarks[0];
//             if (activeMarkElement) {
//                 activeMarkElement.classList.add("utk-mark--active");
//                 activeMarkElement.scrollIntoView({ behavior: "smooth", block: "center" });
//             }
//         }

//         // Highlight and center the selected search result card inside the sidebar
//         const resultCards = elements.documentationSearchResults.querySelectorAll(".utk-search-card");
//         resultCards.forEach((card, index) => {
//             if (index === currentMatchIndex) {
//                 card.classList.add("utk-search-card--active");
//                 card.scrollIntoView({ behavior: "smooth", block: "nearest" });
//             } else {
//                 card.classList.remove("utk-search-card--active");
//             }
//         });

//         elements.documentationSearchResultCount.textContent = `${currentMatchIndex + 1}/${searchMatches.length} results`;
//     }

//     function navigateToNextMatch() {
//         if (searchMatches.length === 0) return;
//         currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
//         syncSearchNavigationState();
//     }

//     // ==========================================
//     // EVENT LISTENERS
//     // ==========================================
//     elements.documentationSearchField.addEventListener("input", executeSearch);
//     elements.documentationSearchNextButton.addEventListener("click", navigateToNextMatch);

//     elements.documentationSearchPreviousButton.addEventListener("click", () => {
//         if (searchMatches.length === 0) return;
//         currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
//         syncSearchNavigationState();
//     });

//     elements.documentationSearchField.addEventListener("keydown", (event) => {
//         if (event.key === "Enter") {
//             event.preventDefault();
//             navigateToNextMatch();
//         }
//     });
// }

// export async function setupDocumentation() {
//     const fileContentCache = {};
//     const fileTextCache = {}; // Pre-stripped clean text cache for fast searching
//     let searchMatches = [];
//     let currentMatchIndex = -1;

//     // Load the active item on startup, or fall back to the first available sub-topic item
//     const initialActiveSubtopic =
//         elements.documentationSidebar.querySelector("[data-sub-topic].active") ??
//         elements.documentationSubTopicCollection[0];

//     // ==========================================
//     // PRELOAD MATRIX (Load everything concurrently)
//     // ==========================================
//     async function preloadAllFiles() {
//         const fetchPromises = Array.from(elements.documentationSubTopicCollection).map(async (button) => {
//             const fileKey = button.dataset.fileName;
//             const filePath = `./documentations/${fileKey}.md`;

//             try {
//                 const response = await fetch(filePath);
//                 if (!response.ok) throw new Error(`Could not fetch ${filePath}`);

//                 const markdownText = await response.text();
//                 const htmlText = marked.parse(markdownText);

//                 // Cache the HTML for structural rendering
//                 fileContentCache[fileKey] = htmlText;

//                 // Cache a clean text version instantly to keep memory operations light
//                 fileTextCache[fileKey] = htmlText.replace(/<\/?[^>]+(>|$)/g, "");
//             } catch (error) {
//                 console.error(`Preload failed for ${fileKey}:`, error);
//                 fileContentCache[fileKey] = `<div style="padding: 20px; color: #ff6b6b;">Error: Failed to load document.</div>`;
//                 fileTextCache[fileKey] = "";
//             }
//         });

//         // Wait for all files to be downloaded and parsed into memory
//         await Promise.all(fetchPromises);

//         // Once fully loaded, render the initial view
//         if (initialActiveSubtopic) {
//             renderDocument(initialActiveSubtopic.dataset.fileName);
//         }
//     }

//     function renderDocument(fileKey) {
//         if (!fileKey || !fileContentCache[fileKey]) return;
//         elements.documentationContent.innerHTML = fileContentCache[fileKey];
//         elements.documentationContent.scrollTop = 0;
//     }

//     // Trigger the global preload sequence immediately
//     await preloadAllFiles();

//     // ==========================================
//     // SIDEBAR INTERACTION LISTENERS
//     // ==========================================

//     // Handle switching between sub-topics (Instant from cache)
//     elements.documentationSubTopicCollection.forEach(subTopic => {
//         subTopic.addEventListener("click", () => {
//             elements.documentationSubTopicCollection.forEach(item => item.classList.remove("active"));
//             subTopic.classList.add("active");

//             const fileKey = subTopic.dataset.fileName;
//             renderDocument(fileKey);
//         });
//     });

//     // Handle opening and closing folder directories
//     elements.documentationTopicNameCollection.forEach(heading => {
//         heading.addEventListener("click", () => {
//             const parentTopicElement = heading.closest("[data-topic]");
//             if (parentTopicElement) {
//                 parentTopicElement.classList.toggle("open");
//             }
//         });
//     });

//     // ==========================================
//     // INSTANT SYNCHRONOUS SEARCH ENGINE
//     // ==========================================
//     function executeSearch() {
//         const searchQuery = elements.documentationSearchField.value.toLowerCase().trim();

//         // Empty search reset
//         if (searchQuery === "") {
//             elements.documentationSearchControls.style.display = "none";
//             elements.documentationSearchResults.style.display = "none";
//             elements.documentationTopics.style.display = "block";

//             const currentActiveButton = elements.documentationSidebar.querySelector("[data-sub-topic].active");
//             if (currentActiveButton) {
//                 renderDocument(currentActiveButton.dataset.fileName);
//             }

//             searchMatches = [];
//             currentMatchIndex = -1;
//             return;
//         }

//         elements.documentationTopics.style.display = "none";
//         elements.documentationSearchResults.style.display = "block";
//         elements.documentationSearchResults.innerHTML = "";
//         searchMatches = [];

//         // Scan the pre-rendered text cache synchronously
//         elements.documentationSubTopicCollection.forEach(button => {
//             const fileKey = button.dataset.fileName;
//             const textContent = fileTextCache[fileKey] || "";
//             const pageTitle = button.textContent.trim();

//             const escapedQuery = searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
//             const searchRegex = new RegExp(escapedQuery, "gi");
//             let executionMatch;

//             while ((executionMatch = searchRegex.exec(textContent)) !== null) {
//                 const textIndex = executionMatch.index;
//                 const windowStart = Math.max(0, textIndex - 40);
//                 const windowEnd = Math.min(textContent.length, textIndex + executionMatch[0].length + 45);

//                 let snippetText = textContent.substring(windowStart, windowEnd);
//                 if (windowStart > 0) snippetText = "..." + snippetText;
//                 if (windowEnd < textContent.length) snippetText = snippetText + "...";

//                 const highlightedSnippetHTML = snippetText.replace(searchRegex, match => `<mark>${match}</mark>`);

//                 searchMatches.push({
//                     fileKey: fileKey,
//                     metaText: pageTitle,
//                     snippetHTML: highlightedSnippetHTML,
//                     subTopicButton: button
//                 });
//             }
//         });

//         // Display results
//         if (searchMatches.length > 0) {
//             elements.documentationSearchControls.style.display = "flex";
//             currentMatchIndex = 0;

//             const fragment = document.createDocumentFragment();

//             searchMatches.forEach((match, index) => {
//                 const resultCard = document.createElement("div");
//                 resultCard.className = "utk-search-card";
//                 resultCard.innerHTML = `
//                     <div class="utk-search-card__meta">${match.metaText}</div>
//                     <div class="utk-search-card__snippet">${match.snippetHTML}</div>
//                 `;

//                 resultCard.addEventListener("click", () => {
//                     currentMatchIndex = index;
//                     syncSearchNavigationState();
//                 });

//                 fragment.appendChild(resultCard);
//             });

//             elements.documentationSearchResults.appendChild(fragment);
//             syncSearchNavigationState();
//         } else {
//             elements.documentationSearchControls.style.display = "flex";
//             elements.documentationSearchResultCount.textContent = "0/0 results";
//             elements.documentationSearchResults.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 13px; color: #a9b2c3;">No matches found.</div>`;
//             currentMatchIndex = -1;
//         }
//     }

//     function syncSearchNavigationState() {
//         if (currentMatchIndex < 0 || currentMatchIndex >= searchMatches.length) return;

//         const currentMatch = searchMatches[currentMatchIndex];

//         elements.documentationSubTopicCollection.forEach(item => item.classList.remove("active"));
//         currentMatch.subTopicButton.classList.add("active");

//         const sourceHTML = fileContentCache[currentMatch.fileKey];
//         const escapedQuery = elements.documentationSearchField.value.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
//         const highlightRegex = new RegExp(`(${escapedQuery})`, "gi");

//         elements.documentationContent.innerHTML = sourceHTML.replace(highlightRegex, `<mark class="utk-mark">$1</mark>`);

//         const pageHighlightMarks = elements.documentationContent.querySelectorAll(".utk-mark");
//         if (pageHighlightMarks.length > 0) {
//             let relativeMatchCount = 0;
//             for (let i = 0; i < currentMatchIndex; i++) {
//                 if (searchMatches[i].fileKey === currentMatch.fileKey) {
//                     relativeMatchCount++;
//                 }
//             }

//             const activeMarkElement = pageHighlightMarks[relativeMatchCount] || pageHighlightMarks[0];
//             if (activeMarkElement) {
//                 activeMarkElement.classList.add("utk-mark--active");
//                 activeMarkElement.scrollIntoView({ behavior: "smooth", block: "center" });
//             }
//         }

//         const resultCards = elements.documentationSearchResults.querySelectorAll(".utk-search-card");
//         resultCards.forEach((card, index) => {
//             if (index === currentMatchIndex) {
//                 card.classList.add("utk-search-card--active");
//                 card.scrollIntoView({ behavior: "smooth", block: "nearest" });
//             } else {
//                 card.classList.remove("utk-search-card--active");
//             }
//         });

//         elements.documentationSearchResultCount.textContent = `${currentMatchIndex + 1}/${searchMatches.length} results`;
//     }

//     function navigateToNextMatch() {
//         if (searchMatches.length === 0) return;
//         currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
//         syncSearchNavigationState();
//     }

//     // ==========================================
//     // INSTANT INPUT WIRE (No debounce needed anymore)
//     // ==========================================
//     elements.documentationSearchField.addEventListener("input", executeSearch);
//     elements.documentationSearchNextButton.addEventListener("click", navigateToNextMatch);

//     elements.documentationSearchPreviousButton.addEventListener("click", () => {
//         if (searchMatches.length === 0) return;
//         currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
//         syncSearchNavigationState();
//     });

//     elements.documentationSearchField.addEventListener("keydown", (event) => {
//         if (event.key === "Enter") {
//             event.preventDefault();
//             navigateToNextMatch();
//         }
//     });
// }


export async function setupDocumentation() {
    const fileContentCache = {};
    const fileTextCache = {}; // Pre-stripped clean text cache for fast searching
    let searchMatches = [];
    let currentMatchIndex = -1;

    // Load the active item on startup, or fall back to the first available sub-topic item
    const initialActiveSubtopic =
        elements.documentationSidebar.querySelector("[data-sub-topic].active") ??
        elements.documentationSubTopicCollection[0];

    // ==========================================
    // PRELOAD MATRIX (Load everything concurrently)
    // ==========================================
    async function preloadAllFiles() {
        const fetchPromises = Array.from(elements.documentationSubTopicCollection).map(async (button) => {
            const fileKey = button.dataset.fileName;
            const filePath = `./documentations/${fileKey}.md`;

            try {
                const response = await fetch(filePath);
                if (!response.ok) throw new Error(`Could not fetch ${filePath}`);

                const markdownText = await response.text();
                const htmlText = marked.parse(markdownText);

                // Cache the HTML for structural rendering
                fileContentCache[fileKey] = htmlText;

                // Cache a clean text version instantly to keep memory operations light
                fileTextCache[fileKey] = htmlText.replace(/<\/?[^>]+(>|$)/g, "");
            } catch (error) {
                console.error(`Preload failed for ${fileKey}:`, error);
                fileContentCache[fileKey] = `<div style="padding: 20px; color: #ff6b6b;">Error: Failed to load document.</div>`;
                fileTextCache[fileKey] = "";
            }
        });

        // Wait for all files to be downloaded and parsed into memory
        await Promise.all(fetchPromises);

        // Once fully loaded, render the initial view
        if (initialActiveSubtopic) {
            renderDocument(initialActiveSubtopic.dataset.fileName);
        }
    }

    function renderDocument(fileKey) {
        if (!fileKey || !fileContentCache[fileKey]) return;
        elements.documentationContent.innerHTML = fileContentCache[fileKey];
        elements.documentationContent.scrollTop = 0;
    }

    // Trigger the global preload sequence immediately
    await preloadAllFiles();

    // ==========================================
    // SIDEBAR INTERACTION LISTENERS
    // ==========================================

    // Handle switching between sub-topics (Instant from cache)
    elements.documentationSubTopicCollection.forEach(subTopic => {
        subTopic.addEventListener("click", () => {
            elements.documentationSubTopicCollection.forEach(item => item.classList.remove("active"));
            subTopic.classList.add("active");

            const fileKey = subTopic.dataset.fileName;
            renderDocument(fileKey);
        });
    });

    // Handle opening and closing folder directories
    elements.documentationTopicNameCollection.forEach(heading => {
        heading.addEventListener("click", () => {
            const parentTopicElement = heading.closest("[data-topic]");
            if (parentTopicElement) {
                parentTopicElement.classList.toggle("open");
            }
        });
    });

    // ==========================================
    // ZERO-REGEX STRING SEARCH ENGINE
    // ==========================================
    function executeSearch() {
        const rawQuery = elements.documentationSearchField.value.trim();
        const searchQuery = rawQuery.toLowerCase();

        // Safety Gate: If the query is empty or just spaces, completely reset and exit
        if (!searchQuery) {
            elements.documentationSearchControls.style.display = "none";
            elements.documentationSearchResults.style.display = "none";
            elements.documentationTopics.style.display = "block";

            const currentActiveButton = elements.documentationSidebar.querySelector("[data-sub-topic].active");
            if (currentActiveButton) {
                renderDocument(currentActiveButton.dataset.fileName);
            }

            searchMatches = [];
            currentMatchIndex = -1;
            return;
        }

        elements.documentationTopics.style.display = "none";
        elements.documentationSearchResults.style.display = "block";
        elements.documentationSearchResults.innerHTML = "";
        searchMatches = [];

        // Scan the pre-rendered text cache using rapid string indexing
        elements.documentationSubTopicCollection.forEach(button => {
            const fileKey = button.dataset.fileName;
            const textContent = fileTextCache[fileKey] || "";
            const lowerTextContent = textContent.toLowerCase();
            const pageTitle = button.textContent.trim();

            let position = lowerTextContent.indexOf(searchQuery);

            // loop through all matching indices via direct index tracking offset
            while (position !== -1) {
                const windowStart = Math.max(0, position - 40);
                const windowEnd = Math.min(textContent.length, position + searchQuery.length + 45);

                let snippetText = textContent.substring(windowStart, windowEnd);
                if (windowStart > 0) snippetText = "..." + snippetText;
                if (windowEnd < textContent.length) snippetText = snippetText + "...";

                // Highlight using basic string manipulation instead of an unsafe execution pattern
                const queryLength = searchQuery.length;
                const matchIndex = snippetText.toLowerCase().indexOf(searchQuery);
                const originalValue = snippetText.substring(matchIndex, matchIndex + queryLength);

                const highlightedSnippetHTML = snippetText.substring(0, matchIndex) +
                    `<mark>${originalValue}</mark>` +
                    snippetText.substring(matchIndex + queryLength);

                searchMatches.push({
                    fileKey: fileKey,
                    metaText: pageTitle,
                    snippetHTML: highlightedSnippetHTML,
                    subTopicButton: button
                });

                // Advance position index past the current match length to find next match
                position = lowerTextContent.indexOf(searchQuery, position + queryLength);
            }
        });

        // Display results
        if (searchMatches.length > 0) {
            elements.documentationSearchControls.style.display = "flex";
            currentMatchIndex = 0;

            const fragment = document.createDocumentFragment();

            searchMatches.forEach((match, index) => {
                const resultCard = document.createElement("div");
                resultCard.className = "utk-search-card";
                resultCard.innerHTML = `
                    <div class="utk-search-card__meta">${match.metaText}</div>
                    <div class="utk-search-card__snippet">${match.snippetHTML}</div>
                `;

                resultCard.addEventListener("click", () => {
                    currentMatchIndex = index;
                    syncSearchNavigationState();
                });

                fragment.appendChild(resultCard);
            });

            elements.documentationSearchResults.appendChild(fragment);
            syncSearchNavigationState();
        } else {
            elements.documentationSearchControls.style.display = "flex";
            elements.documentationSearchResultCount.textContent = "0/0 results";
            elements.documentationSearchResults.innerHTML = `<div style="padding: 16px; text-align: center; font-size: 13px; color: #a9b2c3;">No matches found.</div>`;
            currentMatchIndex = -1;
        }
    }

    function syncSearchNavigationState() {
        if (currentMatchIndex < 0 || currentMatchIndex >= searchMatches.length) return;

        const currentMatch = searchMatches[currentMatchIndex];

        elements.documentationSubTopicCollection.forEach(item => item.classList.remove("active"));
        currentMatch.subTopicButton.classList.add("active");

        const sourceHTML = fileContentCache[currentMatch.fileKey];
        const rawQuery = elements.documentationSearchField.value.trim();

        // Highlight active page elements using primitive split/join mechanics to preserve system safety
        const searchParts = sourceHTML.split(new RegExp(`(${rawQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi"));
        elements.documentationContent.innerHTML = searchParts.map(part => {
            return part.toLowerCase() === rawQuery.toLowerCase() ? `<mark class="utk-mark">${part}</mark>` : part;
        }).join("");

        const pageHighlightMarks = elements.documentationContent.querySelectorAll(".utk-mark");
        if (pageHighlightMarks.length > 0) {
            let relativeMatchCount = 0;
            for (let i = 0; i < currentMatchIndex; i++) {
                if (searchMatches[i].fileKey === currentMatch.fileKey) {
                    relativeMatchCount++;
                }
            }

            const activeMarkElement = pageHighlightMarks[relativeMatchCount] || pageHighlightMarks[0];
            if (activeMarkElement) {
                activeMarkElement.classList.add("utk-mark--active");
                activeMarkElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }

        const resultCards = elements.documentationSearchResults.querySelectorAll(".utk-search-card");
        resultCards.forEach((card, index) => {
            if (index === currentMatchIndex) {
                card.classList.add("utk-search-card--active");
                card.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } else {
                card.classList.remove("utk-search-card--active");
            }
        });

        elements.documentationSearchResultCount.textContent = `${currentMatchIndex + 1}/${searchMatches.length} results`;
    }

    function navigateToNextMatch() {
        if (searchMatches.length === 0) return;
        currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
        syncSearchNavigationState();
    }

    // ==========================================
    // EVENTS
    // ==========================================
    elements.documentationSearchField.addEventListener("input", executeSearch);
    elements.documentationSearchNextButton.addEventListener("click", navigateToNextMatch);

    elements.documentationSearchPreviousButton.addEventListener("click", () => {
        if (searchMatches.length === 0) return;
        currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
        syncSearchNavigationState();
    });

    elements.documentationSearchField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            navigateToNextMatch();
        }
    });
}

function main() {
    const editor = ace.edit("editor");
    setupResponsiveness(editor);
    setupAceEditor(editor);
    setupShortcutButtonsToggle();
    setupDocumentation();
}



main()























