import "./types.js"
import * as logger from "./logger.js";

export function createParser(tokens) {
    return {
        tokens,
        position: 0,
        imports: [],
        exports: [],
        modules: []
    };
}

class ParseError extends Error {
    constructor(message, token) {
        super(message);
        this.token = token;
        this.name = "ParseError";
    }
}

/**
 * Creates and returns a ParseError which will be used for parser synchronisation.
 * @param {Compiler} compiler Compiler State
 * @param {string} message The error message 
 * @param {Token} token 
 * @returns {ParseError}
 */
function error(compiler, message, token) {
    logger.error(compiler, message, token.line)
    return new ParseError(message, token)
}

/**
 * Returns the token at current position of parser
 * @param {Parser} parser Parser State
 * @returns {Token}
 */
function getCurrentToken(parser) {
    return parser.tokens[parser.position];
}

/**
 * Returns the token immediately after current position of parser
 * @param {Parser} parser Parser State
 * @returns {Token}
 */
function getNextToken(parser) {
    return parser.tokens[parser.position + 1];
}

/**
 * Returns the token at a given position
 * @param {Parser} parser Parser State
 * @param {number} position Position of token
 * @returns {Token}
 */
function getTokenAtPosition(parser, position) {
    return parser.tokens[position];
}

/**
 * Checks if type of token at the current position of parser is among given types. 
 * @param {Parser} parser Parser state
 * @param  {...string} types Expected types
 * @returns 
 */
function isCurrentTokenType(parser, ...types) {
    for (const type of types) {
        if (getCurrentToken(parser).type === type) {
            return true;
        }
    }
    return false;
}

/**
 * Checks if type of token immediately after the current position of parser is among given types. 
 * @param {Parser} parser Parser state
 * @param  {...string} types Expected types
 * @returns 
 */
function isNextTokenType(parser, ...types) {
    for (const type of types) {
        if (getNextToken(parser).type === type) {
            return true;
        }
    }
    return false;
}

/**
 * Checks if type of token at a given position is among given types. 
 * @param {Parser} parser Parser state
 * @param  {...string} types Expected types
 * @returns 
 */
function isTokenTypeAtPosition(parser, position, ...types) {
    for (const type of types) {
        if (getTokenAtPosition(parser, position).type === type) {
            return true;
        }
    }
    return false;
}

/**
 * If the type of token at the current position of the parser is among the given types, then increase the position of the parser.
 * Otherwise do nothing.
 * @param {Parser} parser Parser state
 * @param  {...string} types Expected types
 */
function ignore(parser, ...types) {
    if (isCurrentTokenType(parser, ...types)) {
        parser.position++;
    }
}

/**
 * If the type of token at the current position of the parser is NOT among the given types, then throw a `ParserError`.
 * Otherwise do nothing.
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @param  {...string} types Expected types
 */
function expect(compiler, parser, ...types) {
    if (isCurrentTokenType(parser, ...types)) {
        return;
    }

    const expected =
        types.length === 1
            ? types[0]
            : "one of [" + types.join(", ") + "]"
        ;

    const found =
        isCurrentTokenType(parser, "EndOfFile")
            ? "reached end of code"
            : "got " + getCurrentToken(parser).type
        ;

    throw error(compiler, "Expected " + expected + ", but " + found, getCurrentToken(parser))
}

/**
 * If the type of token at the current position of the parser is of the given type, then increase the position of the parser, and return the token.
 * Otherwise throw a `ParserError`.
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @param  {...string} type Expected type
 * @returns {Token} Token at the current position of parser
 */
function consume(compiler, parser, type) {
    expect(compiler, parser, type);
    const token = getCurrentToken(parser);
    parser.position++;
    return token
}

/**
 * Try to synchronise the parser by moving its position to the next statement.
 * @param {Parser} parser Parser state
 */
function synchronise(parser) {
    while (!isCurrentTokenType(parser, "EndOfFile")) {
        parser.position++
        // if (isCurrentTokenType(parser, "NewLine")) {
        //     break;
        // }
        if (isCurrentTokenType(parser, "Loop", "When")) {
            break;
        }
    }
}

/**
 * Check if the token at the current position of parser can be start of an expression or not.
 * @param {Parser} parser Parser state
 * @returns {boolean} 
 */
function isCurrentTokenTypeExpressionStart(parser) {
    return isCurrentTokenType(parser,
        "NumericLiteral",
        "StringLiteral",
        "Right",
        "Wrong",
        "Identifier",
        "LeftRoundBracket"
    )
}


function parseVariableExpression(compiler, parser) {
    const name = getCurrentToken(parser);
    parser.position++;

    const _arguments = [];
    while (true) {
        if (isCurrentTokenTypeExpressionStart(parser)) {
            _arguments.push({ type: "Argument", name: undefined, value: parseExpression(compiler, parser) });

            if (isCurrentTokenType(parser, "Comma")) {
                parser.position++;
                continue;
            } else {
                break;
            }
        }

        if (isCurrentTokenType(parser, "Identifier") && isNextTokenType(parser, "Colon")) {
            const name = getCurrentToken(parser);
            parser.position++;
            const value = parseExpression(compiler, parser);
            _arguments.push({ type: "Argument", name, value });

            if (isCurrentTokenType(parser, "Comma")) {
                parser.position++;
                continue;
            } else {
                break;
            }
        }

        break;
    }

    return { type: "VariableExpression", name, arguments: _arguments }
}

function parsePrimaryExpression(compiler, parser) {
    let expression;

    if (isCurrentTokenType(parser, "right")) {
        expression = { type: "LiteralExpression", value: { type: "BooleanExpression", value: true } };
        parser.position++;
    } else if (isCurrentTokenType(parser, "wrong")) {
        expression = { type: "LiteralExpression", value: { type: "BooleanExpression", value: false } };
        parser.position++;
    } else if (isCurrentTokenType(parser, "StringLiteral")) {
        expression = { type: "LiteralExpression", value: { type: "StringLiteral", value: getCurrentToken(parser).lexeme } };
        parser.position++;
    } else if (isCurrentTokenType(parser, "NumericLiteral")) {
        expression = { type: "LiteralExpression", value: { type: "NumericLiteral", value: Number(getCurrentToken(parser).lexeme) } };
        parser.position++;
    } else if (isCurrentTokenType(parser, "LeftRoundBracket")) {
        parser.position++;
        expression = { type: "GroupingExpression", expression: parseExpression(compiler, parser) };
        expect(compiler, parser, "RightRoundBracket");
        parser.position++;
    } else if (isCurrentTokenType(parser, "Identifier")) {
        expression = parseVariableExpression(compiler, parser);
    } else {
        throw error(
            compiler,
            isCurrentTokenType(parser, "EndOfFile")
                ? "Expected an expression but reached end of code"
                : "Expected an expression but got " + getCurrentToken(parser).type
            ,
            getCurrentToken(parser)
        );
    }

    return expression;
}

function parseUnaryExpression(compiler, parser) {
    if (isCurrentTokenType(parser, "ExclamationMark", "Minus")) {
        const operator = getCurrentToken(parser);
        parser.position++
        const right = parseUnaryExpression(compiler, parser);
        return { type: "UnaryExpression", operator, right };
    }

    return parsePrimaryExpression(compiler, parser);
}

function parseMultiplicationAndDivisionExpression(compiler, parser) {
    let expression = parseUnaryExpression(compiler, parser);

    while (isCurrentTokenType(parser, "Asterisk", "Slash")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseUnaryExpression(compiler, parser)
        expression = { type: "BinaryExpression", left: expression, operator, right }
    }

    return expression;
}

function parseAdditionAndSubstractionExpression(compiler, parser) {
    let expression = parseMultiplicationAndDivisionExpression(compiler, parser);

    while (isCurrentTokenType(parser, "Plus", "Minus")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseMultiplicationAndDivisionExpression(compiler, parser);
        expression = { type: "BinaryExpression", left: expression, operator, right }
    }

    return expression;
}

function parseComparisonExpression(compiler, parser) {
    let expression = parseAdditionAndSubstractionExpression(compiler, parser);

    while (isCurrentTokenType(parser, "MoreThan", "LessThan", "ExclamationMarkMoreThan", "ExclamationMarkLessThan")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseAdditionAndSubstractionExpression(compiler, parser);
        expression = { type: "BinaryExpression", left: expression, operator, right }
    }

    return expression;
}

function parseEqualityAndInequalityExpression(compiler, parser) {
    let expression = parseComparisonExpression(compiler, parser);

    while (isCurrentTokenType(parser, "Equal", "ExclamationMarkEqual")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseComparisonExpression(compiler, parser);
        expression = { type: "BinaryExpression", left: expression, operator, right };
    }
    return expression;
}

function parseExpression(compiler, parser) {
    return parseEqualityAndInequalityExpression(compiler, parser);
}

function parseExpressionStatement(compiler, parser) {
    const expression = parseExpression(compiler, parser);
    expect(compiler, parser, "NewLine", "Dedent", "EndOfFile");
    ignore(parser, "NewLine")
    return { type: "ExpressionStatement", expression };
}

function parseBlock(compiler, parser) {
    expect(compiler, parser, "Indent");
    parser.position++;

    const statements = [];

    while (!isCurrentTokenType(parser, "EndOfFile") && !isCurrentTokenType(parser, "Dedent")) {
        statements.push(parseDeclaration(compiler, parser));
    }

    expect(compiler, parser, "Dedent");
    parser.position++;

    return { type: "Block", statements }
}

function parseWhenStatement(compiler, parser) {
    const whenClauses = [];

    const whenKeyword = getCurrentToken(parser);
    parser.position++;

    const condition = parseExpression(compiler, parser);
    const block = parseBlock(compiler, parser);

    whenClauses.push({ type: "WhenClause", keyword: whenKeyword, condition, block });

    while (isCurrentTokenType(parser, "Else")) {
        const keyword = getCurrentToken(parser);
        parser.position++;

        let condition = undefined;
        if (!isCurrentTokenType(parser, "Indent")) {
            condition = parseExpression(compiler, parser);
        }

        const block = parseBlock(compiler, parser);

        whenClauses.push({ type: "WhenClause", keyword, condition, block });
    }

    return { type: "WhenStatement", whenClauses }
}

function parseBinding(compiler, parser) {
    expect(compiler, parser, "LeftSquareBracket", "Identifier")

    // Destructure
    if (isCurrentTokenType("LeftSquareBracket")) {
        parser.position++; // consume [
        const declarations = [];

        while (!isCurrentTokenType(parser, "RightSquareBracket")) {
            // Nesting allowed for arrays, but groups still forbidden
            declarations.push(parseBinding(compiler, parser));

            if (isCurrentTokenType(parser, "Comma")) {
                parser.position++;
            } else {
                break;
            }
        }

        expect(compiler, parser, "RightSquareBracket");
        parser.position++; // consume ]

        return { type: "Destructure", declarations };
    }

    // Simple Identifier
    if (isCurrentTokenType("Identifier")) {
        const value = getCurrentToken(parser);
        parser.position++;
        return { type: "Identifier", value };
    }

}

function parseLoopStatement(compiler, parser) {
    const loopKeyword = getCurrentToken(parser);
    let isGrouping = false

    if (isCurrentTokenType(parser, "LeftRoundBracket")) {
        isGrouping = true;
        parser.position++;
    }

    const loopClauses = [];
    while (isCurrentTokenTypeExpressionStart(parser)) {
        const left = parseExpression(compiler, parser);

        let withKeyword;
        let right;
        if (isCurrentTokenType(parser, "With")) {
            withKeyword = getCurrentToken(parser);
            parser.position++

            right = parseBinding(compiler, parser, true);
        }

        loopClauses.push({ type: "LoopClause", withKeyword, left, right })

        if (isCurrentTokenType(parser, "Comma")) {
            parser.position++
        } else {
            break;
        }
    }

    if (isGrouping) {
        expect(compiler, parser, "RightRoundBracket");
        parser.position++;
    }

    const block = parseBlock(compiler, parser);

    return { type: "LoopStatement", loopKeyword, loopClauses, block }
}

function parseTryStatement(compiler, parser) {
    const tryKeyword = getCurrentToken(parser);
    parser.position++;

    const tryBlock = parseBlock(compiler, parser);

    expect(compiler, parser, "Fix");
    const fixKeyword = getCurrentToken(parser);
    parser.position++;

    const fixBlock = parseBlock(compiler, parser);

    return { type: "TryStatement", tryKeyword, tryBlock, fixKeyword, fixBlock };
}

function parseExitStatement(compiler, parser) {
    const keyword = getCurrentToken(parser);
    parser.position++;

    let value = undefined;

    if (!isCurrentTokenType(parser, "NewLine", "Dedent")) {
        value = parseExpression(compiler, parser);
    }

    expect(compiler, parser, "NewLine", "Dedent");
    ignore(parser, "NewLine");

    return { type: "ExitStatement", keyword, value }
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Statement}
 */
function parseStopOrSkipStatement(compiler, parser) {
    const keyword = getCurrentToken(parser);
    parser.position++;

    let label = undefined;
    if (isCurrentTokenType(parser, "Identifier")) {
        label = getCurrentToken(parser);
    }

    expect(compiler, parser, "NewLine", "Dedent");
    ignore(parser, "NewLine");

    if (keyword.type === "Stop") {
        return { type: "StopStatement", keyword, label }
    } else {
        return { type: "SkipStatement", keyword, label }
    }
}

/**
 * 
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @returns {Statement} Variable assignment statement
 */
function parseVariableAssignmentStatement(compiler, parser) {
    const name = getCurrentToken(parser);
    parser.position++;

    expect(compiler, parser, "Equal");
    parser.position++;

    const value = parseExpression(compiler, parser);

    ignore(parser, "NewLine");

    return { type: "Assignment", name, value };
}

/**  
 * This function behaviour may change with new compiler versions.
 */
function isVariableAssignment(parser) {
    return isNextTokenType(parser, "Equal")
}

/**
 * 
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function parseStatement(compiler, parser) {
    if (compiler.isModule) {
        return undefined;
    }

    if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(compiler, parser);
    }
    else if (isCurrentTokenType(parser, "Loop")) {
        return parseLoopStatement(compiler, parser);
    }
    else if (isCurrentTokenType(parser, "Try")) {
        return parseTryStatement(compiler, parser);
    }
    else if (isCurrentTokenType(parser, "Exit")) {
        return parseExitStatement(compiler, parser);
    }
    else if (isCurrentTokenType(parser, "Stop", "Skip")) {
        return parseStopOrSkipStatement(compiler, parser);
    }
    else if (isCurrentTokenType(parser, "Identifier") && isVariableAssignment(parser)) {
        return parseVariableAssignmentStatement(compiler, parser);
    }
    else {
        if (isCurrentTokenType(parser, "Else")) {
            throw error(compiler, "Can not use `else` statement without `when` statement", getCurrentToken(parser));
        } else if (isCurrentTokenType(parser, "Fix")) {
            throw error(compiler, "Can not use `fix` statement without `try` statement", getCurrentToken(parser));
        } else if (isCurrentTokenType(parser, "With")) {
            throw error(compiler, "Can not use `with` statement without `loop` statement", getCurrentToken(parser))
        } else {
            return parseExpressionStatement(compiler, parser);
        }
    }
}

/**
 * 
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function parseVariableDeclaration(compiler, parser) {
    const name = consume(compiler, parser, "Identifier");

    const parameters = [];
    while (isCurrentTokenType(parser, "Identifier")) {
        const name = consume(compiler, parser, "Identifier");

        let defaultValue = undefined;
        if (isCurrentTokenType(parser, "Colon")) {
            parser.position++;
            defaultValue = parseExpression();
        }

        parameters.push({ type: "Parameter", name, defaultValue })
        if (isCurrentTokenType(parser, "Comma")) {
            parser.position++;
        } else {
            break;
        }
    }

    consume(compiler, parser, "Tilde");

    const value = parseExpression(compiler, parser);
    ignore(parser, "NewLine");

    return { type: "Declaration", name, parameters, value }
}

/**
 * 
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function isVariableDeclaration(parser) {
    let position = parser.position;

    let curlyBracketNestingDepth = 0;
    let squareBracketNestingDepth = 0;
    let nestingDepth = 0;

    const statementTerminatorTypes = ["NewLine", "Dedent", "EndOfFile"];

    while (true) {
        if (curlyBracketNestingDepth === 0 && squareBracketNestingDepth === 0 && nestingDepth === 0) {
            if (isTokenTypeAtPosition(parser, position, ...statementTerminatorTypes)) {
                return false;
            } else if (isTokenTypeAtPosition(parser, position, "Tilde")) {
                return true;
            }
        }
        
        if (isTokenTypeAtPosition(parser, position, "LeftCurlyBracket")) {
            curlyBracketNestingDepth++;
        } else if (isTokenTypeAtPosition(parser, position, "LeftSquareBracket")) {
            squareBracketNestingDepth++;
        } else if (isTokenTypeAtPosition(parser, position, "RightCurlyBracket")) {
            curlyBracketNestingDepth--;
        } else if (isTokenTypeAtPosition(parser, position, "RightSquareBracket")) {
            squareBracketNestingDepth--;
        } else if (isTokenTypeAtPosition(parser, position, "Indent")) {
            nestingDepth++;
        } else if (isTokenTypeAtPosition(parser, position, "Dedent")) {
            nestingDepth--;
        }

        position++;
    }
}

/**
 * 
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function parseImportDeclaration(compiler, parser) {
    if (!compiler.moduleMode) {
        error(compiler, "You cannot import or export modules in this environment", getCurrentToken(parser));
    }

    const importKeyword = consume(compiler, parser, "Import");

    let path = ""
    while (!isCurrentTokenType(parser, "NewLine", "EndOfFile")) {
        path += consume(compiler, parser, "Identifier").name + "/";

        expect(compiler, parser, "Slash", "NewLine", "EndOfFile");
        ignore(parser, "Slash");
    }

    return { type: "ImportDeclaration", importKeyword, path }
}

/**
 * 
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function parseExportDeclaration(compiler, parser) {
    if (!compiler.moduleMode) {
        error(compiler, "You cannot import or export modules in this environment", getCurrentToken(parser));
    }
    const exportKeyword = consume(compiler, parser, "Export");

    const variable = parseVariableDeclaration(compiler, parser);

    return { type: "ExportDeclaration", exportKeyword, variable }
}

/**
 * 
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function parseDeclaration(compiler, parser) {
    try {
        if (isCurrentTokenType(parser, "Identifier") && isVariableDeclaration(parser)) {
            parseVariableDeclaration(compiler, parser);
        } else if (isCurrentTokenType(parser, "Import")) {
            parseImportDeclaration(compiler, parser);
        } else if (isCurrentTokenType(parser, "Export")) {
            parseExportDeclaration(compiler, parser);
        } else {
            return parseStatement(compiler, parser);
        }
    } catch (error) {
        // Synchronise only if it is a ParserError
        if (error instanceof ParseError) {
            synchronise(parser);
            return undefined;
        }

        // rethrow it if it is a different error
        throw error;
    }
}


/**
 * Parses the tokens inside `parser` and returns an array of statements.
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @returns {AbstractSyntaxTree}
 */
export function parse(compiler, parser) {
    const statements = [];

    while (!isCurrentTokenType(parser, "EndOfFile")) {
        const declaration = parseDeclaration(compiler, parser);

        if (declaration !== undefined) {
            statements.push(declaration);
        }
    }

    return { 
        type: compiler.isModule ? "Module" : "Program", 
        imports: parser.imports,
        exports: parser.exports,
        statements 
    };
}



