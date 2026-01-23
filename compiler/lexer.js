import { error } from "./logger.js";
import { keywords } from "./keywords.js";

export function createLexer(source) {
    return {
        source,
        position: 0,
        line: 1,
        sourceLength: source.length,
        indentStack: [],
        roundBracketStack: [],
        squareBracketStack: [],
    };
}

function isAtEnd(lexer) {
    return lexer.position >= lexer.sourceLength;
}

function match(lexer, expected) {
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
        } else if (match(lexer, '"')) {
            break;
        } else if (match(lexer, "\n")) {
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
    while (match(lexer, isDigit)) {
        lexer.position++;
    }

    if (match(lexer, ".")) {
        lexer.position++;
        while (match(lexer, isDigit)) {
            lexer.position++;
        }
    }

    const numberEndPosition = lexer.position;

    return { type: "NumericLiteral", lexeme: lexer.source.slice(numberStartPosition, numberEndPosition), line: lexer.line}
}



function lexIdentifier(lexer) {
    const identifierStartPosition = lexer.position;
    while (match(lexer, isAlphaNumeric)) {
        lexer.position++;
    }
    const identifierEndPosition = lexer.position;

    const lexeme = lexer.source.slice(identifierStartPosition, identifierEndPosition);
    
    let  type = "Identifier";
    if (keywords.has(lexeme)) {
        type = "Keyword"
    }

    return { type, lexeme, line: lexer.line};
}



export function lexNewLine(utkrisht, lexer) {
    lexer.line++;
    lexer.position++; // Consume the '\n'

    // return if inside a grouping expression;
    if (lexer.roundBracketStack.length !== 0) {
        return undefined;
    }

    let spaces = 0;
    // Count leading whitespace on the new line
    while (!isAtEnd(lexer)) {
        if (match(lexer, " ")) {
            spaces++;
            lexer.position++;
        } else {
            break;
        }
    }

    // Handle empty lines or lines with only whitespace
    const nextChar = lexer.source[lexer.position];
    if (nextChar === '\n' || nextChar === '\r' || isAtEnd(lexer)) {
        return undefined; // Skip logic for empty lines
    }

    const currentIndent = lexer.indentStack[lexer.indentStack.length - 1];

    // 1. Indentation increased
    if (spaces > currentIndent) {
        lexer.indentStack.push(spaces);
        return { type: "INDENT", lexeme: "++++", line: lexer.line };
    }

    // 2. Indentation decreased
    if (spaces < currentIndent) {
        // You might need to pop multiple times (e.g., exiting two blocks at once)
        // Note: For a single call to scanToken, you might need a "buffer" 
        // to return multiple DEDENTs if your loop only expects one token.
        if (!lexer.indentStack.includes(spaces)) {
            error(utkrisht, lexer.line, "Indentation Error: Inconsistent indentation levels.");
            return null;
        }

        lexer.indentStack.pop();
        return { type: "DEDENT", lexeme: "----", line: lexer.line };
    }

    // 3. Indentation stayed the same
    return undefined;
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
        case ";":
            lexer.position++;
            return { type: "SemiColon", lexeme: character, line: lexer.line };
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
            if (match(lexer, "=")) {
                lexer.position++;
                return { type: "ExclamationMarkEqual", lexeme: "!=", line: lexer.line };
            } else if (match(lexer, "<")) {
                lexer.position++;
                return { type: "ExclamationMarkLessThan", lexeme: "!<", line: lexer.line };
            } else if (match(lexer, ">")) {
                lexer.position++;
                return { type: "ExclamationMarkMoreThan", lexeme: "!>", line: lexer.line };
            } else {
                return { type: "ExclamationMark", lexeme: character, line: lexer.line };
            }
        case '"':
            return lexString(utkrisht, lexer);
        default:
            if (isDigit(character)) {
                return lexNumber(lexer);
            } else if (isSmallAlphabet(character)) {
                return lexIdentifier(lexer);
            } else if (isBigAlphabet(character)) {
                error(utkrisht, "Big Letters are not allowed in identifiers", lexer.line);
            }
            error(utkrisht, "Invalid character `" + character + "`", lexer.line)
    }
}


export function lex(utkrisht, lexer) {
    const tokens = [];

    while (!isAtEnd(lexer)) {
        const token = lexToken(utkrisht, lexer);
        if (token !== undefined) {
            tokens.push(token);
        }
    }

    // Add dedents
    while (lexer.indentStack.length > 1) {
        lexer.indentStack.pop();
        tokens.push({ type: "DEDENT", lexeme: "----", line: lexer.line });
    }

    // Add the last token, i.e. EndOfFile
    tokens.push({ type: "EndOfFile", line: lexer.line });

    return tokens;
}

import { createUtkrisht } from "./utkrisht.js";

const lexer = createLexer(`
aaa
    aaa
        aaa
aaa
    aaa
aaa
`)
const utkrisht = createUtkrisht();
console.log(lex(utkrisht, lexer))