// Local imports
import "./utilities/types.js"
import { error } from "./utilities/logger.js";

/**
 * Creates a lexer object
 * 
 * @param {string} source Source code of the Utkrisht file
 * @returns {Lexer}
 */
export function createLexer(source) {
    return {
        source,
        position: 0,
        line: 1,
        indentWidth: 0,
        nestingDepth: 0,
    };
}

/**
 * A collection of reserved keywords used by the Utkrisht.
 * These tokens are restricted from being used as identifiers for now.
 */
export const keywords = new Set([
    "when",
    "else",
    "loop",
    "with",
    "exit",
    "skip",
    "try",
    "fix",
    "crash",
    "import",
    "export",
    "return",
]);

/**
 * Return true if lexer has gone through all the characters in the source code.
 * 
 * @param {Lexer} lexer 
 * @returns {boolean}
 */
function isAtEnd(lexer) {
    return lexer.position >= lexer.source.length;
}

/**
 * Checks if the character at the current lexer position matches the expected criteria.
 * 
 * @param {Lexer} lexer Lexer state
 * @param {string | ((character: string) => boolean)} expected The exact character to match or a predicate function.
 * @returns {boolean}
 */
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

/**
 * @param {string} character 
 * @returns {boolean}
 */
function isDigit(character) {
    return "0123456789".includes(character);
}

/**
 * @param {string} character 
 * @returns {boolean}
 */
function isSmallAlphabet(character) {
    return "abcdefghijklmnopqrstuvwxyz".includes(character);
}

/**
 * @param {string} character 
 * @returns {boolean}
 */
function isBigAlphabet(character) {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(character);
}

/**
 * @param {string} character 
 * @returns {boolean}
 */
function isAlphaNumeric(character) {
    return isSmallAlphabet(character) || isDigit(character) || character === "-";
}

/**
 * Lexes a string and returns a Token of `StringLiteral` type, with literal value
 * of the string.
 * 
 * There are 2 types of strings:
 * - Single line string: Easy to lex, no indentation laws are applied
 * - Multiline string: Requires proper indentation and hence makes it more complex to lex.
 * 
 * Compile time errors are produced when:
 * - String does not have a closing double quote
 * - Single line string contains a line break
 * - Multiline string is not properly indented relative to opening quote
 * 
 * @param {Compiler} compiler Compiler state
 * @param {Lexer} lexer Lexer state
 * @returns {Token | undefined}
 */
function lexString(compiler, lexer) {
    const stringStartLine = lexer.line;
    const stringStartPosition = lexer.position;
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

        const literal = lexer.source.slice(stringStartPosition + 1, lexer.position);
        // Skip closing "
        lexer.position++;
        const lexeme = lexer.source.slice(stringStartPosition, lexer.position);

        return { 
            type: "StringLiteral", 
            lexeme, 
            literal, 
            line: stringStartLine 
        };
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

        const literal = lines.join("\n");
        const lexeme = lexer.source.slice(stringStartPosition, lexer.position);

        return { 
            type: "StringLiteral", 
            lexeme, 
            literal, 
            line: stringStartLine 
        };
    }
}

/**
 * Lexes a Number, and returns a `Token` of `NumicLiteral` type with literal value 
 * of the number.
 *
 * @param {Lexer} lexer Lexer state
 * @param {boolean} [isNegative=false] 
 * @returns {Token}
 */
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

    const lexeme = (isNegative ? "-" : "") + lexer.source.slice(numberStartPosition, numberEndPosition);
    const literal = parseFloat(lexeme);

    return { type: "NumericLiteral", lexeme, literal, line: lexer.line }
}

/**
 * Lexes an Identifier which may or may not be a keyword.
 * 
 * @param {Lexer} lexer Lexer state 
 * @returns {Token} Can be of type `Keyword` or `Identifier`
 */
function lexIdentifier(lexer) {
    const identifierStartPosition = lexer.position;
    while (isCurrentCharacter(lexer, isAlphaNumeric)) {
        lexer.position++;
    }
    const identifierEndPosition = lexer.position;

    const lexeme = lexer.source.slice(identifierStartPosition, identifierEndPosition);

    /** @type {TokenType} */
    const type = keywords.has(lexeme) ? /** @type {TokenType} */ (lexeme[0].toUpperCase() + lexeme.slice(1)) : "Identifier"

    return { type, lexeme, line: lexer.line };
}

/**
 * Lexes a NewLine and spaces after it, and also handle indentation tracking.
 * 
 * Indentation Rules:
 * - Indentation must be consistent (same number of spaces per level). No more, no less.
 * - Only one indentation level increase is allowed at a time
 * - Multiple dedents may occur at once
 * - Blank lines and comment-only lines are ignored
 * 
 * Returns:
 * - `{ type: "Indent" }` when indentation increases by one level
 * - `{ type: "Dedent" }[]` when indentation decreases (possibly multiple levels)
 * - `{ type: "NewLine" }` when staying at the same indentation level
 * - `undefined` when the newline should be ignored (blank line, comment, EOF)
 * 
 * @param {Compiler} compiler Compiler state
 * @param {Lexer} lexer Lexer state
 * @returns {Token | Token[] | undefined}
 */
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


    /*==========================*/
    /* Handle Indentation Logic */
    /*==========================*/

    // Case 1: Increased indentation
    if (indentLevel > lexer.nestingDepth) {
        if (indentLevel > lexer.nestingDepth + 1) {
            error(compiler, "Cannot indent multiple levels at once.", lexer.line);
            return undefined;
        }

        lexer.nestingDepth++;
        return { type: "Indent", lexeme: "++++", line: lexer.line };
    }

    // Case 2: Decreased indentation (possibly multiple levels)
    else if (indentLevel < lexer.nestingDepth) {
        // Please also note, there is no newline produced as a statement terminator for the statement
        // when it is immediately followed by a decrease in `indentLevel`. The `Dedent` tokens here act as the
        // statement terminator.

        /** @type {Token[]} */
        const tokens = []
        while (indentLevel < lexer.nestingDepth) {
            lexer.nestingDepth--;
            tokens.push({ 
                type: "Dedent", 
                lexeme: "----", 
                line: lexer.line 
            });
        }
        return tokens;
    }

    // Case 3: Same Indentation level
    else {
        // Since they are on the same level, newline acts as a terminator
        return { type: "NewLine", lexeme: "\n", line: currentLine };
    }

}

/**
 * @param {Lexer} lexer 
 */
function lexComent(lexer) {
    while (!isCurrentCharacter(lexer, "\n") && !isAtEnd(lexer)) {
        lexer.position++
    }
}

/**
 * @param {Compiler} compiler 
 * @param {Lexer} lexer 
 * @returns {Token[]}
 */
function lexComma(compiler, lexer) {
    /** @type {Token[]} */
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

/**
 * @param {Compiler} compiler 
 * @param {Lexer} lexer 
 * @param {TokenType} type 
 * @param {string} character 
 * @returns {Token[]}
 */
function lexOpenBracket(compiler, lexer, type, character) {
    /** @type {Token[]} */
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

    return tokens;
}

/**
 * @param {Compiler} compiler Compiler state
 * @param {Lexer} lexer Lexer state
 * @returns {Token | Token[] | undefined}
 */
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
            error(compiler, "Utkrisht does not support tabs for indentation. Please use spaces.", lexer.line);
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
            error(compiler, "Invalid character \"" + character + "\"", lexer.line);
            lexer.position++

    }
}


/** 
 * Handle leading whitespaces and comments
 * 
 * @param {Compiler} compiler
 * @param {Lexer} lexer  
 */
function handleBeforeLexing(compiler, lexer) {
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
}

/**
 * Adds the remaining `Dedent` tokens and finally the `EndOfFile` Token.
 * 
 * The `EndOfFile` token is helpful in determining the end when parsing these tokens.
 * 
 * @param {Lexer} lexer Lexer state
 * @param {Token[]} tokens 
 */
function handleAfterLexing(lexer, tokens) {
    // Add remaining dedents
    while (lexer.nestingDepth > 0) {
        tokens.push({ 
            type: "Dedent", 
            lexeme: "----", 
            line: lexer.line 
        });
        lexer.nestingDepth--;
    }

    // Add the last token, i.e. EndOfFile
    tokens.push({ 
        type: "EndOfFile", 
        line: lexer.line 
    });
}

/**
 * Scans source code and converts it into an array of tokens.
 * 
 * @param {Compiler} compiler Compiler state
 * @param {Lexer} lexer Lexer state
 * @returns {Token[]} Array of tokens
 */
export function lex(compiler, lexer) {
    const tokens = [];

    handleBeforeLexing(compiler, lexer);

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

    handleAfterLexing(lexer, tokens);

    return tokens;
}





