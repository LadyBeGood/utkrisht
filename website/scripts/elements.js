
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

export const elements = {
    left: $("[data-left]"),
    right: $("[data-right]"),

    examples: $("[data-examples]"),

    settings: $("[data-settings]"),
    settingsMenu: $("[data-settings-menu]"),
    settingsOverlay: $("[data-settings-overlay]"),
    settingsTheme: $("[data-settings-theme]"),
    settingsKeybindings: $$("[data-settings-keybinding]"),
    settingsFontSize: $("[data-settings-font-size]"),
    settingsCursorStyle: $("[data-settings-cursor-style]"),
    settingsTabSize: $("[data-settings-tab-size]"),
    settingsInsertSpaces: $("[data-settings-insert-spaces]"),
    settingsShowInvisibleCharacters: $("[data-settings-show-invisible-characters]"),
    settingsKeyboardAccessibilityMode: $("[data-settings-keyboard-accessibility-mode]"),

    shortcutButtons: $("[data-shortcut-buttons]"),
    shortcutButtonsToggler: $("[data-shortcut-buttons-toggler]"),


    documentationSidebar: $("[data-documentation-sidebar]"),
    documentationContent: $("[data-documentation-content]"),
    documentationSearchPreviousButton: $("[data-documentation-search-previous-button]"),
    documentationSearchNextButton: $("[data-documentation-search-next-button]"),
    documentationSearchResultCount: $("[data-documentation-search-result-count ]"),
    documentationSearchControls: $("[data-documentation-search-controls]"),
    documentationSearchField: $("[data-documentation-search-field]"),
    
}

