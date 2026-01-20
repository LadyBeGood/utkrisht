export function isDigit(character) {
    return "0123456789".includes(character);
}

export function isSmallAlphabet(character) {
    return "abcdefghijklmnopqrstuvwxyz".includes(character);
}

export function isBigAlphabet(character) {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(character);
}

export function isAlphaNumeric(character) {
    return isSmallAlphabet(character) || isDigit(character) || character === "-";
}

const keywords = new Map([
    ["try", "Try"],
    ["fix", "Fix"],
    ["when", "When"],
    ["else", "Else"],
    ["loop", "Loop"],
    ["with", "With"],
    ["right", "Right"],
    ["wrong", "Wrong"],
    ["import", "Import"],
    ["export", "Export"],
    ["exit", "Exit"],
    ["stop", "Stop"],
    ["skip", "Skip"],
]);