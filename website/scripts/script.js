import { examples } from "./examples.js"

const settingsButton = document.querySelector("[data-settings]");
const settingsMenu = document.querySelector("[data-settings-menu]");
const settingsOverlay = document.querySelector("[data-settings-overlay]");



function showSettingsMenu(editor) {
    settingsOverlay.style.display = "block"
    settingsMenu.style.display = "grid"
}

function hideSettingsMenu(editor) {
    settingsOverlay.style.display = "none"
    settingsMenu.style.display = "none"
}

function setUpAceEditor() {
    const editor = ace.edit("editor");
    editor.setValue(examples.prime, 0)
    editor.clearSelection();
    editor.setTheme("ace/theme/dracula");
    editor.getSession().setMode("ace/mode/utkrisht");
    editor.setShowPrintMargin(false);

    settingsButton.addEventListener("click", function () {
        showSettingsMenu(editor);
    });


    settingsOverlay.addEventListener("click", function () {
        hideSettingsMenu(editor)
    })
}



function main() {
    setUpAceEditor()
}



main()