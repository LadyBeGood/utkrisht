import { error } from "./logger.js";
import { keywords } from "./keywords.js";

export function createLexer(source) {
    return {
        source,
        position: 0,
        line: 1,
        sourceLength: source.length,
        // Number of spaces required for a single level of indentation
        indentWidth: 0,
        // Used to emit the correct number of Dedent tokens when returning to outer scopes.
        nestingDepth: 0,
        pendingComment: ""
    };
}

function isAtEnd(lexer) {
    return lexer.position >= lexer.sourceLength;
}

function isCurrentToken(lexer, expected) {
    if (isAtEnd(lexer)) {
        return false;
    } else if (typeof expected === "function") {
        return expected(lexer.source[lexer.position]);
    } else if (lexer.source[lexer.position] === expected) {
        return true;
    } else {
        return false;
    }
}

function isDigit(character) {
    return "0123456789".includes(character);
}

function isSmallAlphabet(character) {
    return "abcdefghijklmnopqrstuvwxyz".includes(character);
}

function isBigAlphabet(character) {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(character);
}

function isAlphaNumeric(character) {
    return isSmallAlphabet(character) || isDigit(character) || character === "-";
}

function lexString(utkrisht, lexer) {
    // Skip the opening quote
    lexer.position++;
    const stringStartPosition = lexer.position;
    const stringStartLine = lexer.line;

    while (true) {
        if (isAtEnd(lexer)) {
            error(utkrisht, "Unterminated string", stringStartLine);
            return undefined;
        } else if (isCurrentToken(lexer, '"')) {
            break;
        } else if (isCurrentToken(lexer, "\n")) {
            lexer.line++;
        }
        lexer.position++;
    }

    const stringEndPosition = lexer.position;

    // Skip the closing quote
    lexer.position++

    return { type: "StringLiteral", lexeme: lexer.source.slice(stringStartPosition, stringEndPosition), line: lexer.line}
}

function lexNumber(lexer) {
    const numberStartPosition = lexer.position;
    while (isCurrentToken(lexer, isDigit)) {
        lexer.position++;
    }

    if (isCurrentToken(lexer, ".")) {
        lexer.position++;
        while (isCurrentToken(lexer, isDigit)) {
            lexer.position++;
        }
    }

    const numberEndPosition = lexer.position;

    return { type: "NumericLiteral", lexeme: lexer.source.slice(numberStartPosition, numberEndPosition), line: lexer.line}
}



function lexIdentifier(lexer) {
    const identifierStartPosition = lexer.position;
    while (isCurrentToken(lexer, isAlphaNumeric)) {
        lexer.position++;
    }
    const identifierEndPosition = lexer.position;

    const lexeme = lexer.source.slice(identifierStartPosition, identifierEndPosition);
    
    let  type = "Identifier";
    if (keywords.has(lexeme)) {
        type = lexeme[0].toUpperCase() + lexeme.slice(1);
    }

    return { type, lexeme, line: lexer.line};
}



function lexNewLine(utkrisht, lexer) {
    const currentLine = lexer.line; // Capture current line before incrementing
    lexer.line++;
    lexer.position++;

    let leadingSpaces = 0;
    while (!isAtEnd(lexer) && isCurrentToken(lexer, " ")) {
        leadingSpaces++;
        lexer.position++;
    }

    // Ignore blank lines
    if (isCurrentToken(lexer, "\n")) {
        return undefined;
    }
    
    // Ignore newline at the very end of file
    if (isAtEnd(lexer)) {
        return undefined;
    }

    // Ignore commented blank lines
    if (isCurrentToken(lexer, "#")) {
        return undefined;
    }

    // Only set `indentWidth` if we find spaces for the first time
    if (lexer.indentWidth === 0 && leadingSpaces > 0) {
        lexer.indentWidth = leadingSpaces;
    }

    // Only calculate level if we actually have an indentWidth
    // If indentWidth is still 0, it means we are still at the margin (Level 0)
    let indentLevel = 0;
    if (lexer.indentWidth !== 0) {
        indentLevel = leadingSpaces / lexer.indentWidth;
    }

    // Error if indentation level is not a multiple of `indentWidth`
    if (!Number.isInteger(indentLevel)) {
        error(utkrisht, "Invalid indentation level. Please indent your code consistently with " + lexer.indentWidth + " spaces.", lexer.line);
        return undefined;
    }


    // Handle Indentation Logic
    if (indentLevel > lexer.nestingDepth) {
        if (indentLevel > lexer.nestingDepth + 1) {
            error(utkrisht, "Cannot indent multiple levels at once.", lexer.line);
            return undefined;
        }
        
        lexer.nestingDepth++;
        return { type: "Indent", lexeme: "++++", line: lexer.line };
    }
    else if (indentLevel < lexer.nestingDepth) {
        const tokens = []
        while (indentLevel < lexer.nestingDepth) {
            lexer.nestingDepth--;
            tokens.push({ type: "Dedent", lexeme: "----", line: lexer.line });
        }
        return tokens;
    }
    else {
        // Since they are on the same level, newline acts as a terminator
        return { type: "NewLine", lexeme: "\n", line: currentLine };
    }

}


function lexToken(utkrisht, lexer) {
    let character = lexer.source[lexer.position];

    switch (character) {
        case "(":
            lexer.position++;
            return { type: "LeftRoundBracket", lexeme: character, line: lexer.line };
        case ")":
            lexer.position++;
            return { type: "RightRoundBracket", lexeme: character, line: lexer.line };
        case "[":
            lexer.position++;
            return { type: "LeftSquareBracket", lexeme: character, line: lexer.line };
        case "]":
            lexer.position++;
            return { type: "RightSquareBracket", lexeme: character, line: lexer.line };
        case "{":
            lexer.position++;
            return { type: "LeftCurlyBracket", lexeme: character, line: lexer.line };
        case "}":
            lexer.position++;
            return { type: "RightCurlyBracket", lexeme: character, line: lexer.line };
        case ".":
            lexer.position++;
            return { type: "Dot", lexeme: character, line: lexer.line };
        case ",":
            lexer.position++;
            return { type: "Comma", lexeme: character, line: lexer.line };
        case ":":
            lexer.position++;
            return { type: "Colon", lexeme: character, line: lexer.line };
        case "#":
            while (!isCurrentToken(lexer, "\n") && !isAtEnd(lexer)) {
                lexer.position++
            }
            return undefined;
        case "~":
            lexer.position++;
            return { type: "Tilde", lexeme: character, line: lexer.line };
        case "=":
            lexer.position++;
            return { type: "Equal", lexeme: character, line: lexer.line };
        case "<":
            lexer.position++;
            return { type: "LessThan", lexeme: character, line: lexer.line };
        case ">":
            lexer.position++;
            return { type: "MoreThan", lexeme: character, line: lexer.line };
        case "@":
            lexer.position++;
            return { type: "At", lexeme: character, line: lexer.line };
        case "$":
            lexer.position++;
            return { type: "Dollar", lexeme: character, line: lexer.line };
        case "&":
            lexer.position++;
            return { type: "And", lexeme: character, line: lexer.line };
        case "+":
            lexer.position++;
            return { type: "Plus", lexeme: character, line: lexer.line };
        case "-":
            lexer.position++;
            return { type: "Minus", lexeme: character, line: lexer.line };
        case "*":
            lexer.position++;
            return { type: "Asterisk", lexeme: character, line: lexer.line };
        case "/":
            lexer.position++;
            return { type: "Slash", lexeme: character, line: lexer.line };
        case "|":
            lexer.position++;
            return { type: "Bar", lexeme: character, line: lexer.line };
        case "\\":
            lexer.position++;
            return { type: "BackSlash", lexeme: character, line: lexer.line };
        case " ":
        case "\r":
            lexer.position++;
            return undefined;
        case "\n":
            return lexNewLine(utkrisht, lexer)        
        case "\t":
            error(utkrisht, "Utkrisht does not support tabs for indentation. Please use spaces.", lexer.line)    
        case "!":
            lexer.position++;
            
            if (isCurrentToken(lexer, "=")) {
                lexer.position++;
                return { type: "ExclamationMarkEqual", lexeme: "!=", line: lexer.line };
            } 
            else if (isCurrentToken(lexer, "<")) {
                lexer.position++;
                return { type: "ExclamationMarkLessThan", lexeme: "!<", line: lexer.line };
            } 
            else if (isCurrentToken(lexer, ">")) {
                lexer.position++;
                return { type: "ExclamationMarkMoreThan", lexeme: "!>", line: lexer.line };
            } 
            else {
                return { type: "ExclamationMark", lexeme: character, line: lexer.line };
            }
        case '"':
            return lexString(utkrisht, lexer);
        default:
            if (isDigit(character)) {
                return lexNumber(lexer);
            } 
            else if (isSmallAlphabet(character)) {
                return lexIdentifier(lexer);
            } 
            else if (isBigAlphabet(character)) {
                error(utkrisht, "Big Letters are not allowed in identifiers", lexer.line);
            }
            error(utkrisht, "Invalid character `" + character + "`", lexer.line);
            lexer.position++
            
    }
}


export function lex(utkrisht, lexer) {
    const tokens = [];

    let leadingSpaces = 0;
    while (!isAtEnd(lexer)) {
        if (isCurrentToken(lexer, " ")) {
            leadingSpaces++;
            lexer.position++
        } else if (isCurrentToken(lexer, "\n")) {
            lexer.line++
            lexer.position++
            leadingSpaces = 0;
        } else if (isCurrentToken(lexer, "#")) {
            leadingSpaces = 0;
            while (!isAtEnd(lexer) && !isCurrentToken(lexer, "\n")) {
                lexer.position++
            }
        } else {
            break;
        }
    }

    if (leadingSpaces !== 0) {
        error(utkrisht, "Invalid Indentation at the start of the file", lexer.line)
    }

    while (!isAtEnd(lexer)) {
        const token = lexToken(utkrisht, lexer);
        if (token === undefined) {
            continue;
        } else if (Array.isArray(token)) {
            tokens.push(...token);
        } else {
            tokens.push(token);
        }
    }

    // Add dedents
    while (lexer.nestingDepth > 0) {
        tokens.push({ type: "Dedent", lexeme: "----", line: lexer.line });
        lexer.nestingDepth--;
    }

    // Add the last token, i.e. EndOfFile
    tokens.push({ type: "EndOfFile", line: lexer.line });

    return tokens;
}


import { createUtkrisht } from "./utkrisht.js";

const utkrisht = createUtkrisht();
const lexer = createLexer(`


loop
when
else

`)

console.log(lex(utkrisht, lexer))