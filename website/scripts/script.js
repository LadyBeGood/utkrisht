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

    elements.settingsKeybindings.forEach(function (element) {
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

function main() {
    const editor = ace.edit("editor");
    setupResponsiveness(editor);
    setupAceEditor(editor);
    setupShortcutButtonsToggle();




}



main()















// export function initUtkrishtReference() {
//     const defaultNav = document.getElementById("refDefaultNav");
//     const resultsHUD = document.getElementById("refSearchResultsHUD");
//     const searchInput = document.getElementById("refSearch");
//     const searchControls = document.getElementById("refSearchControls");
//     const matchCountEl = document.getElementById("refMatchCount");
//     const prevBtn = document.getElementById("refPrevBtn");
//     const nextBtn = document.getElementById("refNextBtn");
//     const contentArea = document.getElementById("refContentArea");

//     if (!searchInput || !contentArea) return;

//     // Cache clean text nodes across all individual isolated screens
//     const screens = document.querySelectorAll(".playground-ref__screen");
//     let originalHTMLCache = {};
//     screens.forEach(screen => {
//         originalHTMLCache[screen.id] = screen.innerHTML;
//     });

//     let activeMatches = [];
//     let currentMatchIndex = -1;

//     // 1. SPA ROUTER FUNCTION (Strict Tab Switching)
//     function showTargetScreen(screenId) {
//         screens.forEach(screen => {
//             screen.classList.remove("active");
//         });

//         const targetScreen = document.getElementById(screenId);
//         if (targetScreen) {
//             targetScreen.classList.add("active");
//             contentArea.scrollTop = 0; // Lock scrolling back to top edge on screen shift
//         }

//         // Keep normal sidebar links active markers synced
//         document.querySelectorAll(".playground-ref__link").forEach(link => {
//             if (link.getAttribute("data-screen") === screenId) {
//                 link.classList.add("active");
//             } else {
//                 link.classList.remove("active");
//             }
//         });
//     }

//     // Bind clean non-hash directory click triggers
//     document.querySelectorAll(".playground-ref__link").forEach(link => {
//         link.addEventListener("click", (e) => {
//             e.preventDefault();
//             showTargetScreen(link.getAttribute("data-screen"));
//         });
//     });

//     // Accordion categories controls
//     document.querySelectorAll("[data-heading]").forEach(heading => {
//         heading.addEventListener("click", () => {
//             heading.parentElement.classList.toggle("open");
//         });
//     });

//     // 2. CROSS-SCREEN CONTEXT SNIPPET GENERATOR
//     function executeGlobalRefSearch() {
//         const query = searchInput.value.toLowerCase().trim();

//         // MODE A: Standard Navigation View Mode
//         if (query === "") {
//             searchControls.style.display = "none";
//             resultsHUD.style.display = "none";
//             defaultNav.style.display = "block";

//             // Revert all modified highlight node frames back to original code strings
//             screens.forEach(screen => {
//                 screen.innerHTML = originalHTMLCache[screen.id];
//             });

//             activeMatches = [];
//             currentMatchIndex = -1;
//             return;
//         }

//         // MODE B: Swapping Left Menu Sidebar into Live Search Result Cards
//         defaultNav.style.display = "none";
//         resultsHUD.style.display = "flex";
//         resultsHUD.innerHTML = "";

//         // Clear pre-existing highlights prior to run
//         screens.forEach(screen => {
//             screen.innerHTML = originalHTMLCache[screen.id];
//         });
//         activeMatches = [];

//         // Scan hidden and active nodes alike across all page data trees
//         screens.forEach(screen => {
//             const walker = document.createTreeWalker(screen, NodeFilter.SHOW_TEXT, null, false);
//             const textNodes = [];
//             let currentNode;

//             while (currentNode = walker.nextNode()) {
//                 const parent = currentNode.parentElement;
//                 if (parent.tagName !== "SCRIPT" && parent.tagName !== "STYLE" && currentNode.nodeValue.toLowerCase().includes(query)) {
//                     textNodes.push(currentNode);
//                 }
//             }

//             textNodes.forEach(node => {
//                 const parent = node.parentNode;
//                 if (!parent) return;

//                 const text = node.nodeValue;
//                 const regex = new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "gi");
//                 const fragment = document.createDocumentFragment();
//                 let lastIndex = 0;

//                 const screenTitle = screen.getAttribute("data-title") || "Reference";

//                 text.replace(regex, (match, index) => {
//                     if (index > lastIndex) {
//                         fragment.appendChild(document.createTextNode(text.substring(lastIndex, index)));
//                     }

//                     const mark = document.createElement("mark");
//                     mark.className = "utk-mark";
//                     mark.textContent = match;
//                     fragment.appendChild(mark);

//                     // Pull snippet contextual ranges (approx 45 chars around match index)
//                     const startPos = Math.max(0, index - 40);
//                     const endPos = Math.min(text.length, index + match.length + 45);
//                     let snippetString = text.substring(startPos, endPos);

//                     if (startPos > 0) snippetString = "..." + snippetString;
//                     if (endPos < text.length) snippetString = snippetString + "...";

//                     const visualHUDHtml = snippetString.replace(regex, m => `<mark>${m}</mark>`);

//                     activeMatches.push({
//                         screenId: screen.id,
//                         metaText: screenTitle,
//                         snippetHTML: visualHUDHtml,
//                         // Reference node token inside screen DOM
//                         contentMarkElement: mark
//                     });

//                     lastIndex = index + match.length;
//                 });

//                 if (lastIndex < text.length) {
//                     fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
//                 }
//                 parent.replaceChild(fragment, node);
//             });
//         });

//         // Recalibrate dynamic references to matches following structural node transforms
//         const totalMarks = contentArea.querySelectorAll(".utk-mark");
//         activeMatches.forEach((match, index) => {
//             match.contentMarkElement = totalMarks[index];
//         });

//         // 3. RENDER SEARCH CARDS OVER HUD SIDEBAR VIEW
//         if (activeMatches.length > 0) {
//             searchControls.style.display = "flex";
//             currentMatchIndex = 0;

//             activeMatches.forEach((match, index) => {
//                 const card = document.createElement("div");
//                 card.className = "utk-search-card";
//                 card.innerHTML = `
//                     <div class="utk-search-card__meta">${match.metaText}</div>
//                     <div class="utk-search-card__snippet">${match.snippetHTML}</div>
//                 `;

//                 card.addEventListener("click", () => {
//                     currentMatchIndex = index;
//                     syncHUDNavStates();
//                 });

//                 resultsHUD.appendChild(card);
//             });

//             syncHUDNavStates();
//         } else {
//             searchControls.style.display = "flex";
//             matchCountEl.textContent = "0/0 results";
//             resultsHUD.innerHTML = `<div style="padding:16px;text-align:center;font-size:13px;color:var(--utk-text-dim, #a9b2c3)">No exact term correlations located.</div>`;
//             currentMatchIndex = -1;
//         }
//     }

//     // 4. COORDINATE SCREEN AND CARD ELEMENT FOCUS TRANSITIONS
//     function syncHUDNavStates() {
//         if (currentMatchIndex < 0 || currentMatchIndex >= activeMatches.length) return;

//         const currentMatch = activeMatches[currentMatchIndex];

//         // Swap directly to target screen view
//         showTargetScreen(currentMatch.screenId);

//         // Track active inner node status styling markers
//         const documentMarks = contentArea.querySelectorAll(".utk-mark");
//         documentMarks.forEach((mark, index) => {
//             if (index === currentMatchIndex) {
//                 mark.classList.add("utk-mark--active");
//                 mark.scrollIntoView({ behavior: "smooth", block: "center" });
//             } else {
//                 mark.classList.remove("utk-mark--active");
//             }
//         });

//         // Sync focus state highlights across sidebar list results items 
//         const sidebarCards = resultsHUD.querySelectorAll(".utk-search-card");
//         sidebarCards.forEach((card, index) => {
//             if (index === currentMatchIndex) {
//                 card.classList.add("utk-search-card--active");
//                 card.scrollIntoView({ behavior: "smooth", block: "nearest" });
//             } else {
//                 card.classList.remove("utk-search-card--active");
//             }
//         });

//         matchCountEl.textContent = `${currentMatchIndex + 1}/${activeMatches.length} results`;
//     }

//     function jumpToNextMatch() {
//         if (activeMatches.length === 0) return;
//         currentMatchIndex = (currentMatchIndex + 1) % activeMatches.length;
//         syncHUDNavStates();
//     }

//     function jumpToPrevMatch() {
//         if (activeMatches.length === 0) return;
//         currentMatchIndex = (currentMatchIndex - 1 + activeMatches.length) % activeMatches.length;
//         syncHUDNavStates();
//     }

//     // Setup input listeners
//     searchInput.addEventListener("input", executeGlobalRefSearch);
//     nextBtn.addEventListener("click", jumpToNextMatch);
//     prevBtn.addEventListener("click", jumpToPrevMatch);

//     searchInput.addEventListener("keydown", (e) => {
//         if (e.key === "Enter") {
//             e.preventDefault();
//             if (e.shiftKey) { jumpToPrevMatch(); } else { jumpToNextMatch(); }
//         }
//     });
// }

// initUtkrishtReference();


export function initUtkrishtReference() {
    const sidebar = document.getElementById("refSidebar");
    const defaultNav = document.getElementById("refDefaultNav");
    const resultsHUD = document.getElementById("refSearchResultsHUD");
    const searchInput = document.getElementById("refSearch");
    const searchControls = document.getElementById("refSearchControls");
    const matchCountEl = document.getElementById("refMatchCount");
    const prevBtn = document.getElementById("refPrevBtn");
    const nextBtn = document.getElementById("refNextBtn");
    const contentArea = document.getElementById("refContentArea");

    // Collapse UI Controls
    const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
    const collapsedIconsStrip = document.getElementById("collapsedIconsStrip");
    const uncollapseSidebarBtn = document.getElementById("uncollapseSidebarBtn");
    const quickSearchBtn = document.getElementById("quickSearchBtn");

    if (!sidebar || !searchInput || !contentArea) return;

    // Cache clean text nodes across all individual isolated screens
    const screens = document.querySelectorAll(".playground-ref__screen");
    let originalHTMLCache = {};
    screens.forEach(screen => {
        originalHTMLCache[screen.id] = screen.innerHTML;
    });

    let activeMatches = [];
    let currentMatchIndex = -1;

    // ==========================================
    // SIDEBAR EXPAND / COLLAPSE STATE ENGINE
    // ==========================================
    function setSidebarCollapseState(shouldCollapse) {
        if (shouldCollapse) {
            sidebar.setAttribute("data-collapsed", "true");
            collapsedIconsStrip.style.display = "flex";
        } else {
            sidebar.setAttribute("data-collapsed", "false");
            collapsedIconsStrip.style.display = "none";

            // Re-evaluate if search HUD or default nav should be visible
            if (searchInput.value.trim() !== "") {
                defaultNav.style.display = "none";
                resultsHUD.style.display = "flex";
                searchControls.style.display = "flex";
            } else {
                defaultNav.style.display = "block";
                resultsHUD.style.display = "none";
                searchControls.style.display = "none";
            }
        }
    }

    // Collapse Button Listener (Left Arrow)
    toggleSidebarBtn.addEventListener("click", () => {
        setSidebarCollapseState(true);
    });

    // Uncollapse Button Listener (Right Arrow)
    uncollapseSidebarBtn.addEventListener("click", () => {
        setSidebarCollapseState(false);
    });

    // Quick Search Icon Trigger
    quickSearchBtn.addEventListener("click", () => {
        setSidebarCollapseState(false);
        setTimeout(() => {
            searchInput.focus();
        }, 100); // Small timeout allows sidebar width transit calculation to finish
    });

    // ==========================================
    // ROUTER & TAB SWITCH CHANNELS
    // ==========================================
    function showTargetScreen(screenId) {
        screens.forEach(screen => {
            screen.classList.remove("active");
        });

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add("active");
            contentArea.scrollTop = 0;
        }

        document.querySelectorAll(".playground-ref__link").forEach(link => {
            if (link.getAttribute("data-screen") === screenId) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    }

    document.querySelectorAll(".playground-ref__link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            showTargetScreen(link.getAttribute("data-screen"));
        });
    });

    document.querySelectorAll("[data-heading]").forEach(heading => {
        heading.addEventListener("click", () => {
            heading.parentElement.classList.toggle("open");
        });
    });

    // ==========================================
    // CROSS-SCREEN TEXT SNIPPET SEARCH ENGINE
    // ==========================================
    function executeGlobalRefSearch() {
        const query = searchInput.value.toLowerCase().trim();

        // If search bar cleared, roll back out to basic directory state
        if (query === "") {
            searchControls.style.display = "none";
            resultsHUD.style.display = "none";
            if (sidebar.getAttribute("data-collapsed") === "false") {
                defaultNav.style.display = "block";
            }

            screens.forEach(screen => {
                screen.innerHTML = originalHTMLCache[screen.id];
            });

            activeMatches = [];
            currentMatchIndex = -1;
            return;
        }

        // Display results HUD panels if sidebar expanded
        if (sidebar.getAttribute("data-collapsed") === "false") {
            defaultNav.style.display = "none";
            resultsHUD.style.display = "flex";
        }
        resultsHUD.innerHTML = "";

        screens.forEach(screen => {
            screen.innerHTML = originalHTMLCache[screen.id];
        });
        activeMatches = [];

        // Scan text nodes
        screens.forEach(screen => {
            const walker = document.createTreeWalker(screen, NodeFilter.SHOW_TEXT, null, false);
            const textNodes = [];
            let currentNode;

            while (currentNode = walker.nextNode()) {
                const parent = currentNode.parentElement;
                if (parent.tagName !== "SCRIPT" && parent.tagName !== "STYLE" && currentNode.nodeValue.toLowerCase().includes(query)) {
                    textNodes.push(currentNode);
                }
            }

            textNodes.forEach(node => {
                const parent = node.parentNode;
                if (!parent) return;

                const text = node.nodeValue;
                const regex = new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "gi");
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                const screenTitle = screen.getAttribute("data-title") || "Reference";

                text.replace(regex, (match, index) => {
                    if (index > lastIndex) {
                        fragment.appendChild(document.createTextNode(text.substring(lastIndex, index)));
                    }

                    const mark = document.createElement("mark");
                    mark.className = "utk-mark";
                    mark.textContent = match;
                    fragment.appendChild(mark);

                    const startPos = Math.max(0, index - 40);
                    const endPos = Math.min(text.length, index + match.length + 45);
                    let snippetString = text.substring(startPos, endPos);

                    if (startPos > 0) snippetString = "..." + snippetString;
                    if (endPos < text.length) snippetString = snippetString + "...";

                    const visualHUDHtml = snippetString.replace(regex, m => `<mark>${m}</mark>`);

                    activeMatches.push({
                        screenId: screen.id,
                        metaText: screenTitle,
                        snippetHTML: visualHUDHtml,
                        contentMarkElement: mark
                    });

                    lastIndex = index + match.length;
                });

                if (lastIndex < text.length) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
                }
                parent.replaceChild(fragment, node);
            });
        });

        const totalMarks = contentArea.querySelectorAll(".utk-mark");
        activeMatches.forEach((match, index) => {
            match.contentMarkElement = totalMarks[index];
        });

        if (activeMatches.length > 0) {
            if (sidebar.getAttribute("data-collapsed") === "false") {
                searchControls.style.display = "flex";
            }
            currentMatchIndex = 0;

            activeMatches.forEach((match, index) => {
                const card = document.createElement("div");
                card.className = "utk-search-card";
                card.innerHTML = `
                    <div class="utk-search-card__meta">${match.metaText}</div>
                    <div class="utk-search-card__snippet">${match.snippetHTML}</div>
                `;

                card.addEventListener("click", () => {
                    currentMatchIndex = index;
                    syncHUDNavStates();
                });

                resultsHUD.appendChild(card);
            });

            syncHUDNavStates();
        } else {
            if (sidebar.getAttribute("data-collapsed") === "false") {
                searchControls.style.display = "flex";
            }
            matchCountEl.textContent = "0/0 results";
            resultsHUD.innerHTML = `<div style="padding:16px;text-align:center;font-size:13px;color:var(--utk-text-dim, #a9b2c3)">No matches found.</div>`;
            currentMatchIndex = -1;
        }
    }

    function syncHUDNavStates() {
        if (currentMatchIndex < 0 || currentMatchIndex >= activeMatches.length) return;

        const currentMatch = activeMatches[currentMatchIndex];
        showTargetScreen(currentMatch.screenId);

        const documentMarks = contentArea.querySelectorAll(".utk-mark");
        documentMarks.forEach((mark, index) => {
            if (index === currentMatchIndex) {
                mark.classList.add("utk-mark--active");
                mark.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                mark.classList.remove("utk-mark--active");
            }
        });

        const sidebarCards = resultsHUD.querySelectorAll(".utk-search-card");
        sidebarCards.forEach((card, index) => {
            if (index === currentMatchIndex) {
                card.classList.add("utk-search-card--active");
                card.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } else {
                card.classList.remove("utk-search-card--active");
            }
        });

        matchCountEl.textContent = `${currentMatchIndex + 1}/${activeMatches.length} results`;
    }

    function jumpToNextMatch() {
        if (activeMatches.length === 0) return;
        currentMatchIndex = (currentMatchIndex + 1) % activeMatches.length;
        syncHUDNavStates();
    }

    // Wiring Input Events
    searchInput.addEventListener("input", executeGlobalRefSearch);
    nextBtn.addEventListener("click", jumpToNextMatch);
    prevBtn.addEventListener("click", () => {
        if (activeMatches.length === 0) return;
        currentMatchIndex = (currentMatchIndex - 1 + activeMatches.length) % activeMatches.length;
        syncHUDNavStates();
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            jumpToNextMatch();
        }
    });
}

initUtkrishtReference();






















document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab-btn");
    const panes = document.querySelectorAll(".pane");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active status from current active tabs & panes
            document.querySelector(".tab-btn.active")?.classList.remove("active");
            document.querySelector(".pane.active")?.classList.remove("active");

            // Add active class to clicked elements
            tab.classList.add("active");
            const targetPaneId = `pane-${tab.dataset.tab}`;
            document.getElementById(targetPaneId)?.classList.add("active");
        });
    });

    // Wire up Clear Console utility button
    document.getElementById("clear-console")?.addEventListener("click", () => {
        const consoleLog = document.querySelector(".console-log");
        if (consoleLog) consoleLog.innerHTML = `<div class="log-line system">> Console cleared.</div>`;
    });
});

