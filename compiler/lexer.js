import { isDigit, isSmallAlphabet, isBigAlphabet, isAlphaNumeric } from "./core.js"


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



export function createLexer(source) {
    return {
        source,
        start: 0,
        position,
        line: 1,
        tokens: [],
        keywords,
        sourceLength
    };
}



export function isAtEnd(lexer) {
    return lexer.position >= lexer.sourceLength;
}


function addToken(lexer, type, lexeme = "") {
    lexer.tokens.push({ type, lexeme, line });
}


export function lexer(input) {


    function string() {
        // Skip the opening quote
        position++;  
        
        let accumulate = [];
        while (true) {
            if (isAtEnd()) {
                error(line, "Unterminated string")
            }
    
            if (input[position] === '"') {
                break;
            }
            else if (input[position] === "\n") {
                line++;
            }

            accumulate.push(input[position])
            position++;
        }
    
        // Skip the closing quote
        position++;  

        addToken("StringLiteral", accumulate.join(""))
    }


    function identifier() {
        let accumulate = [];

        while (!isAtEnd() && isAlphaNumeric(input[position])) {
            accumulate.add(input[position])
            position++;
        }
        
        const word = accumulate.join("");
        // Check if the identifier is a keyword
        if (keywords.has(word)) {
            addToken(keywords.get(word), word);
        }
        else {
            addToken("Identifier", word);
        }
    }


    addToken("EndOfFile", "File has ended");

    return tokens;
}


function lexTokens(utkrisht, lexer) {
    let character = lexer.source[lexer.position];

    switch (character) {
        case "(":
            //roundBracketStack.add(0)
            addToken("LeftRoundBracket", character);
            position++;
            break;
        case ")":
            // roundBracketStack.pop()
            addToken("RightRoundBracket", character);
            position++;
            break;
        case "{":
            addToken("LeftCurlyBracket", character);
            position++;
            break;
        case "}":
            addToken("RightCurlyBracket", character);
            position++;
            break;
        case "[":
            squareBracketStack.add(0)
            addToken("LeftSquareBracket", character);
            position++;
            break;
        case "]":
            squareBracketStack.pop()
            addToken("RightSquareBracket", character);
            position++;
            break;
        case ",":
            addToken("Comma", character);
            position++;
            break;
        case ".":
            addToken("Dot", character);
            position++;
            break;
        case ":":
            addToken("Colon", character);
            position++;
            break;
        case "~":
            addToken("Tilde", character);
            position++;
            break;
        case "-":
            if (position + 1 < inputLength && isDigit(input[position + 1])) {
                position++;
                number(true);
            } else if (position + 1 < inputLength && input[position + 1] == "-") {
                error(line, "Invalid token `--`");
            } else {
                addToken("Minus", character);
                position++;
            }
            break;
        case "+":
            if (position + 1 < inputLength && isDigit(input[position + 1])) {
                position++;
                number()
            } else if (position + 1 < inputLength && input[position + 1] == "+") {
                error(line, "Invalid token `++`")
            } else {
                addToken("Plus", character);
                position++;
            }
            break;
        case "*":
            addToken("Asterisk", character);
            position++;
            break;
        case "/":
            addToken("Slash", character);
            position++;
            break;
        case "$":
            addToken("Dollar", character);
            position++;
            break;
        case "?":
            addToken("Question", character);
            position++;
            break;
        case "&":
            addToken("Ampersand", character);
            position++;
            break;
        case "=":
            addToken("Equal", character);
            position++;
            break;
        case ">":
            addToken("MoreThan", character);
            position++;
            break;
        case "<":
            addToken("LessThan", character);
            position++;
            break;
        case "|":
            addToken("Bar", character);
            position++;
            break;
        case "#":
            // Ignore single line comment
            while (!isAtEnd() && not(input[position] === "\n")) {
                position++;
            }
            break;
        case "_":
            if (position + 1 < inputLength && input[position + 1] === "<") {
                position += 2;
                addToken("UnderscoreLessThan", "_<")
            } else {
                addToken("Underscore", character);
                position++;
            }
            break;
        case "\n":
            newline()
            break;
        case " ",
            "\r":
            position++;
            break;
        case "!":
            if (position + 1 < inputLength && input[position + 1] in ["=", ">", "<"]) {
                if (input[position + 1] == "=") {
                    addToken("ExclamationEqual", "!=")
                } else if (input[position + 1] == ">") {
                    addToken("ExclamationMoreThan", "!>")
                } else if (input[position + 1] == "<") {
                    addToken("ExclamationLessThan", "!<")
                    position += 2;
                } else {
                    addToken("Exclamation", character);
                    position++;
                }
            }
            break;
        case '"':
            string()
            break;
        default:
            if (isDigit(character)) {
                number()
            } else if (isSmallAlphabet(character)) {
                identifier()
            } else if (isBigAlphabet(character)) {
                error(line, "Uki only uses small characters for identifiers.")
            } else {
                error(line, "Invalid character, `" + character + "`")
            }
    }
}


export function lex(manager, lexer) {
    while (!isAtEnd()) {
        lexer.start = lexer.current

        lexTokens(manager, lexer)
    }

    return lexer.tokens;
}
