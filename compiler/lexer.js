import "./types.js"
import { error } from "./logger.js";
import { keywords } from "./keywords.js";

/**
 * Creates a lexer object
 * @returns {Lexer}
 */
export function createLexer(/** @type string */ source) {
    return {
        source,
        position: 0,
        line: 1,
        indentWidth: 0,
        nestingDepth: 0,
    };
}

function isAtEnd(lexer) {
    return lexer.position >= lexer.source.length;
}

function isCurrentCharacter(lexer, expected) {
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

function lexString(compiler, lexer) {
    const stringStartLine = lexer.line;
    // Skip opening quote
    lexer.position++;

    let isSingleLine = true;
    let temporaryPosition = lexer.position;

    // Check for "followed by spaces and a newline"
    while (lexer.source[temporaryPosition] === " ") {
        temporaryPosition++;
    }

    if (lexer.source[temporaryPosition] === "\n") {
        isSingleLine = false;
        // Skip the spaces and the first \n
        lexer.position = temporaryPosition + 1;
        lexer.line++;
    }

    if (isSingleLine) {
        const start = lexer.position;

        while (!isCurrentCharacter(lexer, '"')) {
            if (isAtEnd(lexer)) {
                error(compiler, "Unterminated string", stringStartLine);
                return undefined;
            }

            if (lexer.source[lexer.position] === "\n") {
                error(compiler, "Single line strings cannot contain a new line.", stringStartLine);
                return undefined;
            }

            lexer.position++;
        }

        const lexeme = lexer.source.slice(start, lexer.position);

        // Skip closing "
        lexer.position++;

        return { type: "StringLiteral", lexeme, line: stringStartLine };
    }

    else { // !isSingleLine

        const lines = [];

        if (lexer.indentWidth === 0) {
            let temporaryPosition = lexer.position;
            while (lexer.source[temporaryPosition] === " ") {
                lexer.indentWidth++;
                temporaryPosition++;
            }
        }
        // The indentation we must skip for the closing quote
        let requiredClosingQuoteOffset = lexer.nestingDepth * lexer.indentWidth;
        // The indentation we must skip for EVERY line inside this string
        let requiredContentOffset = requiredClosingQuoteOffset + lexer.indentWidth;

        while (true) {
            if (isAtEnd(lexer)) {
                error(compiler, "Unterminated multiline string", stringStartLine);
                return undefined;
            }

            // Check if the current line is the closing quote line
            // It must be at the correct nesting level (same as the 'parent' code)
            let closingCandidate = lexer.position;
            while (lexer.source[closingCandidate] === " ") {
                closingCandidate++;
            }

            if (lexer.source[closingCandidate] === '"') {
                // Ensure the closing quote is indented correctly (matching parent)
                const closingQuoteOffset = closingCandidate - lexer.position;
                if (closingQuoteOffset !== requiredClosingQuoteOffset) {
                    error(compiler, "Closing quote indentation must match the block level.", lexer.line);
                    return undefined;
                }
                // Move past the quote
                lexer.position = closingCandidate + 1;
                break;
            }

            // Validate leading spaces for the current content line
            let spaceCount = 0;
            while (spaceCount < requiredContentOffset && lexer.source[lexer.position + spaceCount] === " ") {
                spaceCount++;
            }

            if (spaceCount < requiredContentOffset) {
                error(compiler, `Insufficient indentation for multiline string. Expected ${requiredContentOffset} spaces.`, lexer.line);
                return undefined;
            }

            // Capture from after the skipOffset until the end of the line
            lexer.position += requiredContentOffset;
            const lineStart = lexer.position;
            while (!isAtEnd(lexer) && lexer.source[lexer.position] !== "\n") {
                if (lexer.source[lexer.position] === '"') {
                    error(compiler, "Closing quote must be on its own line for multiline strings.", lexer.line);
                    return undefined;
                }
                lexer.position++;
            }

            lines.push(lexer.source.slice(lineStart, lexer.position));

            if (isCurrentCharacter(lexer, "\n")) {
                lexer.line++;
                lexer.position++;
            }
        }

        return { type: "StringLiteral", lexeme: lines.join("\n"), line: stringStartLine };
    }
}

function lexNumber(lexer, isNegative = false) {
    const numberStartPosition = lexer.position;
    while (isCurrentCharacter(lexer, isDigit)) {
        lexer.position++;
    }

    if (isCurrentCharacter(lexer, ".")) {
        lexer.position++;
        while (isCurrentCharacter(lexer, isDigit)) {
            lexer.position++;
        }
    }

    const numberEndPosition = lexer.position;

    return { type: "NumericLiteral", lexeme: (isNegative ? "-" : "") + lexer.source.slice(numberStartPosition, numberEndPosition), line: lexer.line }
}

function lexIdentifier(lexer) {
    const identifierStartPosition = lexer.position;
    while (isCurrentCharacter(lexer, isAlphaNumeric)) {
        lexer.position++;
    }
    const identifierEndPosition = lexer.position;

    const lexeme = lexer.source.slice(identifierStartPosition, identifierEndPosition);

    let type = "Identifier";
    if (keywords.has(lexeme)) {
        type = lexeme[0].toUpperCase() + lexeme.slice(1);
    }

    return { type, lexeme, line: lexer.line };
}

function lexNewLine(compiler, lexer) {
    const currentLine = lexer.line; // Capture current line before incrementing
    lexer.line++;
    lexer.position++;

    let leadingSpaces = 0;
    while (!isAtEnd(lexer) && isCurrentCharacter(lexer, " ")) {
        leadingSpaces++;
        lexer.position++;
    }

    // Ignore blank lines
    if (isCurrentCharacter(lexer, "\n")) {
        return undefined;
    }

    if (isCurrentCharacter(lexer, "\r")) {
        lexer.position++;
        if (!isCurrentCharacter(lexer, "\n")) {
            error(compiler, "Carriage return must be followed by a NewLine character.", lexer.line);
        }
        return undefined;
    }

    // Ignore newline at the very end of file
    if (isAtEnd(lexer)) {
        return undefined;
    }

    // Ignore commented blank lines
    if (isCurrentCharacter(lexer, "#")) {
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
        error(compiler, "Invalid indentation level. Please indent your code consistently with " + lexer.indentWidth + " spaces.", lexer.line);
        return undefined;
    }


    // Handle Indentation Logic
    if (indentLevel > lexer.nestingDepth) {
        if (indentLevel > lexer.nestingDepth + 1) {
            error(compiler, "Cannot indent multiple levels at once.", lexer.line);
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

function lexComent(lexer) {
    while (!isCurrentCharacter(lexer, "\n") && !isAtEnd(lexer)) {
        lexer.position++
    }
}

function lexComma(compiler, lexer) {
    const tokens = [{ type: "Comma", lexeme: ",", line: lexer.line }];
    lexer.position++;

    // Ignore spaces and comments
    while (true) {
        while (true) {
            if (isCurrentCharacter(lexer, " ")) {
                lexer.position++;
            } else if (isCurrentCharacter(lexer, "#")) {
                lexComent(lexer);
            } else {
                break;
            }
        }

        if (isCurrentCharacter(lexer, "\r")) {
            lexer.position++;
            if (!isCurrentCharacter(lexer, "\n")) {
                error(compiler, "Carriage return must be followed by a NewLine character.", lexer.line);
            }
        }

        if (isCurrentCharacter(lexer, "\n")) {
            const whiteSpaceTokens = lexNewLine(compiler, lexer);
            if (Array.isArray(whiteSpaceTokens)) {
                tokens.push(...whiteSpaceTokens);
                break;
            }
            if (whiteSpaceTokens !== undefined && whiteSpaceTokens.type !== "NewLine") {
                tokens.push(whiteSpaceTokens);
                break;
            }
        } else {
            break;
        }
    }


    return tokens;
}

function lexOpenBracket(compiler, lexer, type, character) {
    const tokens = [{ type, lexeme: character, line: lexer.line }];
    lexer.position++;

    // Ignore spaces and comments
    while (true) {
        while (true) {
            if (isCurrentCharacter(lexer, " ")) {
                lexer.position++;
            } else if (isCurrentCharacter(lexer, "#")) {
                lexComent(lexer);
            } else {
                break;
            }
        }

        if (isCurrentCharacter(lexer, "\r")) {
            lexer.position++;
            if (!isCurrentCharacter(lexer, "\n")) {
                error(compiler, "Carriage return must be followed by a NewLine character.", lexer.line);
            }
        }

        if (isCurrentCharacter(lexer, "\n")) {
            const whiteSpaceTokens = lexNewLine(compiler, lexer);
            if (Array.isArray(whiteSpaceTokens)) {
                tokens.push(...whiteSpaceTokens);
                break;
            }
            if (whiteSpaceTokens !== undefined && whiteSpaceTokens.type !== "NewLine") {
                tokens.push(whiteSpaceTokens);
                break;
            }
        } else {
            break;
        }
    }

    return tokens
}

function lexToken(compiler, lexer) {
    let character = lexer.source[lexer.position];

    switch (character) {
        case "(":
            return lexOpenBracket(compiler, lexer, "LeftRoundBracket", "(")
        case ")":
            lexer.position++;
            return { type: "RightRoundBracket", lexeme: character, line: lexer.line };
        case "[":
            return lexOpenBracket(compiler, lexer, "LeftSquareBracket", "[")
        case "]":
            lexer.position++;
            return { type: "RightSquareBracket", lexeme: character, line: lexer.line };
        case "{":
            return lexOpenBracket(compiler, lexer, "LeftCurlyBracket", "{");
        case "}":
            lexer.position++;
            return { type: "RightCurlyBracket", lexeme: character, line: lexer.line };
        case ".":
            lexer.position++;
            return { type: "Dot", lexeme: character, line: lexer.line };
        case ",":
            return lexComma(compiler, lexer);
        case ":":
            lexer.position++;
            return { type: "Colon", lexeme: character, line: lexer.line };
        case "#":
            lexComent(lexer);
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
            if (isCurrentCharacter(lexer, isDigit)) {
                return lexNumber(lexer)
            } else {
                return { type: "Plus", lexeme: character, line: lexer.line };
            }
        case "-":
            lexer.position++;
            if (isCurrentCharacter(lexer, isDigit)) {
                return lexNumber(lexer, /* isNegative */ true)
            } else {
                return { type: "Minus", lexeme: character, line: lexer.line };
            }
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
            lexer.position++;
            return undefined;
        case "\r":
            lexer.position++;
            if (isCurrentCharacter(lexer, "\n")) {
                return lexNewLine(compiler, lexer);
            } else {
                error(compiler, "Carriage return must be followed by a NewLine character.", lexer.line);
                lexer.position++
                return undefined;
            }
        case "\n":
            return lexNewLine(compiler, lexer)
        case "\t":
            error(compiler, "compiler does not support tabs for indentation. Please use spaces.", lexer.line);
            lexer.position++
            return undefined;
        case "!":
            lexer.position++;

            if (isCurrentCharacter(lexer, "=")) {
                lexer.position++;
                return { type: "ExclamationMarkEqual", lexeme: "!=", line: lexer.line };
            }
            else if (isCurrentCharacter(lexer, "<")) {
                lexer.position++;
                return { type: "ExclamationMarkLessThan", lexeme: "!<", line: lexer.line };
            }
            else if (isCurrentCharacter(lexer, ">")) {
                lexer.position++;
                return { type: "ExclamationMarkMoreThan", lexeme: "!>", line: lexer.line };
            }
            else {
                return { type: "ExclamationMark", lexeme: character, line: lexer.line };
            }
        case '"':
            return lexString(compiler, lexer);
        default:
            if (isDigit(character)) {
                return lexNumber(lexer);
            }
            else if (isSmallAlphabet(character)) {
                return lexIdentifier(lexer);
            }
            else if (isBigAlphabet(character)) {
                error(compiler, "Big Letters are not allowed in identifiers", lexer.line);
                lexer.position++;
                return undefined;
            }
            error(compiler, "Invalid character `" + character + "`", lexer.line);
            lexer.position++

    }
}



/**
 * Scans source code and converts it into a flat array of tokens.
 * @param {Compiler} compiler Compiler state
 * @param {Lexer} lexer Lexer state
 * @returns {Token[]} Array of tokens
 */
export function lex(compiler, lexer) {
    const tokens = [];

    let leadingSpaces = 0;
    while (true) {
        if (isCurrentCharacter(lexer, " ")) {
            leadingSpaces++;
            lexer.position++
        } else if (isCurrentCharacter(lexer, "\n")) {
            lexer.line++
            lexer.position++
            leadingSpaces = 0;
        } else if (isCurrentCharacter(lexer, "\r")) {
            lexer.position++;
            if (isCurrentCharacter(lexer, "\n")) {
                lexer.line++
                lexer.position++
                leadingSpaces = 0;
            } else {
                error(compiler, "Carriage return must be followed by a NewLine character.", lexer.line);
                lexer.position++;
            }
        } else if (isCurrentCharacter(lexer, "#")) {
            leadingSpaces = 0;
            while (!isAtEnd(lexer) && !isCurrentCharacter(lexer, "\n")) {
                lexer.position++
            }
        } else if (isAtEnd(lexer)) {
            leadingSpaces = 0;
            break;
        } else {
            break;
        }
    }

    if (leadingSpaces !== 0) {
        error(compiler, "Invalid Indentation at the start of the file", lexer.line)
    }

    while (!isAtEnd(lexer)) {
        const token = lexToken(compiler, lexer);
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





