import { examples } from "./examples.js"
import { elements } from "./elements.js"


function showSettingsMenu() {
    elements.settingsOverlay.style.display = "block"
    elements.settingsMenu.style.display = "grid"
}

function hideSettingsMenu() {
    elements.settingsOverlay.style.display = "none"
    elements.settingsMenu.style.display = "none"
}


function spacesToTab(editor, tabWidth) {
    const source = editor.getValue();

    const updatedSource = source.replace(/^( +)/gm, (match) => {
        const count = match.length;
        const tabs = "\t".repeat(Math.floor(count / tabWidth));
        const remainingSpaces = " ".repeat(count % tabWidth);

        return tabs + remainingSpaces;
    });

    editor.setValue(updatedSource, 0);
    editor.clearSelection();
}

function tabToSpaces(editor, tabWidth) {
    const source = editor.getValue();
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


    editor.setTheme(elements.settingsTheme.value);
    elements.settingsTheme.addEventListener("change", function () {
        editor.setTheme(elements.settingsTheme.value)
    });

    editor.setFontSize(Number(elements.settingsFontSize.value));
    elements.settingsFontSize.addEventListener("change", function () {
        editor.setFontSize(Number(elements.settingsFontSize.value))
    });

    elements.settingsCursorStyle.addEventListener("change", function () {
        editor.setOptions({ cursorStyle: elements.settingsCursorStyle.value })
    })


    const newSize = Number(elements.settingsTabSize.value);
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



    editor.session.setUseSoftTabs(elements.settingsInsertSpaces.checked);
    if (elements.settingsInsertSpaces.checked) {
        tabToSpaces(editor, Number(elements.settingsTabSize.value))
    } else {
        spacesToTab(editor, Number(elements.settingsTabSize.value))
    }
    elements.settingsInsertSpaces.addEventListener("click", function () {
        editor.session.setUseSoftTabs(elements.settingsInsertSpaces.checked);
        if (elements.settingsInsertSpaces.checked) {
            tabToSpaces(editor, Number(elements.settingsTabSize.value))
        } else {
            spacesToTab(editor, Number(elements.settingsTabSize.value))
        }
    })

    
    editor.setShowInvisibles(elements.settingsShowInvisibleCharacters.checked)
    elements.settingsShowInvisibleCharacters.addEventListener("change", function () {
        editor.setShowInvisibles(elements.settingsShowInvisibleCharacters.checked);
    })

    editor.setOptions({ enableKeyboardAccessibility: elements.settingsKeyboardAccessibilityMode.checked })
    elements.settingsKeyboardAccessibilityMode.addEventListener("change", function () {
        editor.setOptions({ enableKeyboardAccessibility: elements.settingsKeyboardAccessibilityMode.checked })
    })
}

function setupExampleSelection(editor) {
    function setText() {
        editor.setValue(examples[elements.examples.value], 0)
        editor.clearSelection();
    }

    setText();
    elements.examples.addEventListener("change", setText);
}

function setupAceEditor() {
    const editor = ace.edit("editor");
    editor.getSession().setMode("ace/mode/utkrisht");

    setupExampleSelection(editor);
    setupSettings(editor);
}



function main() {
    setupAceEditor()
}



main()
