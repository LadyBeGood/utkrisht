import "./types.js"
import * as logger from "./logger.js";

/**
 * Creates the state of parser
 * @param {Token[]} tokens Tokens produced by the lexer
 * @returns {Parser}
 */
export function createParser(tokens) {
    return {
        tokens,
        position: 0,
        imports: [],
        exports: [],
        modules: []
    };
}

/**
 * Used to synchronise the parser
 */
class ParseError extends Error {
    constructor(message, token) {
        super(message);
        this.token = token;
        this.name = "ParseError";
    }
}

/**
 * Creates and returns a ParseError which will be used for parser synchronisation.
 * @param {Interpreter} interpreter Interpreter State
 * @param {string} message The error message 
 * @param {Token} token 
 * @returns {ParseError}
 */
function error(interpreter, message, token) {
    logger.compileTimeError(interpreter, message, token.line)
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
 * @param {Interpreter} interpreter Interpreter state
 * @param {Parser} parser Parser state
 * @param  {...string} types Expected types
 */
function expect(interpreter, parser, ...types) {
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

    throw error(interpreter, "Expected " + expected + ", but " + found, getCurrentToken(parser))
}

/**
 * If the type of token at the current position of the parser is of the given type, then increase the position of the parser, and return the token.
 * Otherwise throw a `ParserError`.
 * @param {Interpreter} interpreter Interpreter state
 * @param {Parser} parser Parser state
 * @param  {...string} type Expected type
 * @returns {Token} Token at the current position of parser
 */
function consume(interpreter, parser, type) {
    expect(interpreter, parser, type);
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


function parseVariableExpression(interpreter, parser) {
    const name = getCurrentToken(parser);
    parser.position++;

    const _arguments = [];
    while (true) {
        if (isCurrentTokenTypeExpressionStart(parser)) {
            _arguments.push({ type: "Argument", name: undefined, value: parseExpression(interpreter, parser) });

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
            const value = parseExpression(interpreter, parser);
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

function parsePrimaryExpression(interpreter, parser) {
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
        expression = { type: "GroupingExpression", expression: parseExpression(interpreter, parser) };
        expect(interpreter, parser, "RightRoundBracket");
        parser.position++;
    } else if (isCurrentTokenType(parser, "Identifier")) {
        expression = parseVariableExpression(interpreter, parser);
    } else {
        throw error(
            interpreter,
            isCurrentTokenType(parser, "EndOfFile")
                ? "Expected an expression but reached end of code"
                : "Expected an expression but got " + getCurrentToken(parser).type
            ,
            getCurrentToken(parser)
        );
    }

    return expression;
}

function parseUnaryExpression(interpreter, parser) {
    if (isCurrentTokenType(parser, "ExclamationMark", "Minus")) {
        const operator = getCurrentToken(parser);
        parser.position++
        const right = parseUnaryExpression(interpreter, parser);
        return { type: "UnaryExpression", operator, right };
    }

    return parsePrimaryExpression(interpreter, parser);
}

function parseMultiplicationAndDivisionExpression(interpreter, parser) {
    let expression = parseUnaryExpression(interpreter, parser);

    while (isCurrentTokenType(parser, "Asterisk", "Slash")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseUnaryExpression(interpreter, parser)
        expression = { type: "BinaryExpression", left: expression, operator, right }
    }

    return expression;
}

function parseAdditionAndSubstractionExpression(interpreter, parser) {
    let expression = parseMultiplicationAndDivisionExpression(interpreter, parser);

    while (isCurrentTokenType(parser, "Plus", "Minus")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseMultiplicationAndDivisionExpression(interpreter, parser);
        expression = { type: "BinaryExpression", left: expression, operator, right }
    }

    return expression;
}

function parseComparisonExpression(interpreter, parser) {
    let expression = parseAdditionAndSubstractionExpression(interpreter, parser);

    while (isCurrentTokenType(parser, "MoreThan", "LessThan", "ExclamationMarkMoreThan", "ExclamationMarkLessThan")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseAdditionAndSubstractionExpression(interpreter, parser);
        expression = { type: "BinaryExpression", left: expression, operator, right }
    }

    return expression;
}

function parseEqualityAndInequalityExpression(interpreter, parser) {
    let expression = parseComparisonExpression(interpreter, parser);

    while (isCurrentTokenType(parser, "Equal", "ExclamationMarkEqual")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseComparisonExpression(interpreter, parser);
        expression = { type: "BinaryExpression", left: expression, operator, right };
    }
    return expression;
}

function parseExpression(interpreter, parser) {
    return parseEqualityAndInequalityExpression(interpreter, parser);
}

function parseExpressionStatement(interpreter, parser) {
    const expression = parseExpression(interpreter, parser);
    expect(interpreter, parser, "NewLine", "Dedent", "EndOfFile");
    ignore(parser, "NewLine")
    return { type: "ExpressionStatement", expression };
}

function parseBlock(interpreter, parser) {
    expect(interpreter, parser, "Indent");
    parser.position++;

    const statements = [];

    while (!isCurrentTokenType(parser, "EndOfFile") && !isCurrentTokenType(parser, "Dedent")) {
        statements.push(parseDeclaration(interpreter, parser));
    }

    expect(interpreter, parser, "Dedent");
    parser.position++;

    return { type: "Block", statements }
}

function parseWhenStatement(interpreter, parser) {
    const whenClauses = [];

    const whenKeyword = getCurrentToken(parser);
    parser.position++;

    const condition = parseExpression(interpreter, parser);
    const block = parseBlock(interpreter, parser);

    whenClauses.push({ type: "WhenClause", keyword: whenKeyword, condition, block });

    while (isCurrentTokenType(parser, "Else")) {
        const keyword = getCurrentToken(parser);
        parser.position++;

        let condition = undefined;
        if (!isCurrentTokenType(parser, "Indent")) {
            condition = parseExpression(interpreter, parser);
        }

        const block = parseBlock(interpreter, parser);

        whenClauses.push({ type: "WhenClause", keyword, condition, block });
    }

    return { type: "WhenStatement", whenClauses }
}

function parseBinding(interpreter, parser) {
    expect(interpreter, parser, "LeftSquareBracket", "Identifier")

    // Destructure
    if (isCurrentTokenType("LeftSquareBracket")) {
        parser.position++; // consume [
        const declarations = [];

        while (!isCurrentTokenType(parser, "RightSquareBracket")) {
            // Nesting allowed for arrays, but groups still forbidden
            declarations.push(parseBinding(interpreter, parser));

            if (isCurrentTokenType(parser, "Comma")) {
                parser.position++;
            } else {
                break;
            }
        }

        expect(interpreter, parser, "RightSquareBracket");
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

function parseLoopStatement(interpreter, parser) {
    const loopKeyword = getCurrentToken(parser);
    let isGrouping = false

    if (isCurrentTokenType(parser, "LeftRoundBracket")) {
        isGrouping = true;
        parser.position++;
    }

    const loopClauses = [];
    while (isCurrentTokenTypeExpressionStart(parser)) {
        const left = parseExpression(interpreter, parser);

        let withKeyword;
        let right;
        if (isCurrentTokenType(parser, "With")) {
            withKeyword = getCurrentToken(parser);
            parser.position++

            right = parseBinding(interpreter, parser, true);
        }

        loopClauses.push({ type: "LoopClause", withKeyword, left, right })

        if (isCurrentTokenType(parser, "Comma")) {
            parser.position++
        } else {
            break;
        }
    }

    if (isGrouping) {
        expect(interpreter, parser, "RightRoundBracket");
        parser.position++;
    }

    const block = parseBlock(interpreter, parser);

    return { type: "LoopStatement", loopKeyword, loopClauses, block }
}

function parseTryStatement(interpreter, parser) {
    const tryKeyword = getCurrentToken(parser);
    parser.position++;

    const tryBlock = parseBlock(interpreter, parser);

    expect(interpreter, parser, "Fix");
    const fixKeyword = getCurrentToken(parser);
    parser.position++;

    const fixBlock = parseBlock(interpreter, parser);

    return { type: "TryStatement", tryKeyword, tryBlock, fixKeyword, fixBlock };
}

function parseExitStatement(interpreter, parser) {
    const keyword = getCurrentToken(parser);
    parser.position++;

    let value = undefined;

    if (!isCurrentTokenType(parser, "NewLine", "Dedent")) {
        value = parseExpression(interpreter, parser);
    }

    expect(interpreter, parser, "NewLine", "Dedent");
    ignore(parser, "NewLine");

    return { type: "ExitStatement", keyword, value }
}

/**
 * 
 * @param {Interpreter} interpreter 
 * @param {Parser} parser 
 * @returns {Statement}
 */
function parseStopOrSkipStatement(interpreter, parser) {
    const keyword = getCurrentToken(parser);
    parser.position++;

    let label = undefined;
    if (isCurrentTokenType(parser, "Identifier")) {
        label = getCurrentToken(parser);
    }

    expect(interpreter, parser, "NewLine", "Dedent");
    ignore(parser, "NewLine");

    if (keyword.type === "Stop") {
        return { type: "StopStatement", keyword, label }
    } else {
        return { type: "SkipStatement", keyword, label }
    }
}

/**
 * 
 * @param {Interpreter} interpreter Interpreter state
 * @param {Parser} parser Parser state
 * @returns {Statement} Variable assignment statement
 */
function parseVariableAssignmentStatement(interpreter, parser) {
    const name = getCurrentToken(parser);
    parser.position++;

    expect(interpreter, parser, "Equal");
    parser.position++;

    const value = parseExpression(interpreter, parser);

    ignore(parser, "NewLine");

    return { type: "Assignment", name, value };
}

/**  
 * This function behaviour may change with new interpreter versions.
 */
function isVariableAssignment(parser) {
    return isNextTokenType(parser, "Equal")
}

/**
 * 
 * @param {Interpreter} interpreter Interpreter state
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function parseStatement(interpreter, parser) {
    if (interpreter.isModule) {
        return undefined;
    }

    if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(interpreter, parser);
    }
    else if (isCurrentTokenType(parser, "Loop")) {
        return parseLoopStatement(interpreter, parser);
    }
    else if (isCurrentTokenType(parser, "Try")) {
        return parseTryStatement(interpreter, parser);
    }
    else if (isCurrentTokenType(parser, "Exit")) {
        return parseExitStatement(interpreter, parser);
    }
    else if (isCurrentTokenType(parser, "Stop", "Skip")) {
        return parseStopOrSkipStatement(interpreter, parser);
    }
    else if (isCurrentTokenType(parser, "Identifier") && isVariableAssignment(parser)) {
        return parseVariableAssignmentStatement(interpreter, parser);
    }
    else {
        if (isCurrentTokenType(parser, "Else")) {
            throw error(interpreter, "Can not use `else` statement without `when` statement", getCurrentToken(parser));
        } else if (isCurrentTokenType(parser, "Fix")) {
            throw error(interpreter, "Can not use `fix` statement without `try` statement", getCurrentToken(parser));
        } else if (isCurrentTokenType(parser, "With")) {
            throw error(interpreter, "Can not use `with` statement without `loop` statement", getCurrentToken(parser))
        } else {
            return parseExpressionStatement(interpreter, parser);
        }
    }
}

/**
 * 
 * @param {Interpreter} interpreter Interpreter state
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function parseVariableDeclaration(interpreter, parser) {
    const name = consume(interpreter, parser, "Identifier");

    const parameters = [];
    while (isCurrentTokenType(parser, "Identifier")) {
        const name = consume(interpreter, parser, "Identifier");

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

    consume(interpreter, parser, "Tilde");

    const value = parseExpression(interpreter, parser);
    ignore(parser, "NewLine");

    return { type: "Declaration", name, parameters, value }
}

/**
 * 
 * @param {Interpreter} interpreter Interpreter state
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
 * @todo
 * @param {Interpreter} interpreter Interpreter state
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function parseImportDeclaration(interpreter, parser) {
    if (!interpreter.moduleMode) {
        error(interpreter, "You cannot import or export modules in this environment", getCurrentToken(parser));
    }

    const importKeyword = consume(interpreter, parser, "Import");

    let path = ""
    while (!isCurrentTokenType(parser, "NewLine", "EndOfFile")) {
        path += consume(interpreter, parser, "Identifier").name + "/";

        expect(interpreter, parser, "Slash", "NewLine", "EndOfFile");
        ignore(parser, "Slash");
    }

    return { type: "ImportDeclaration", importKeyword, path }
}

/**
 * @todo
 * @param {Interpreter} interpreter Interpreter state
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function parseExportDeclaration(interpreter, parser) {
    if (!interpreter.moduleMode) {
        error(interpreter, "You cannot import or export modules in this environment", getCurrentToken(parser));
    }
    const exportKeyword = consume(interpreter, parser, "Export");

    const variable = parseVariableDeclaration(interpreter, parser);

    return { type: "ExportDeclaration", exportKeyword, variable }
}

/**
 * 
 * @param {Interpreter} interpreter Interpreter state
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function parseDeclaration(interpreter, parser) {
    try {
        if (isCurrentTokenType(parser, "Identifier") && isVariableDeclaration(parser)) {
            parseVariableDeclaration(interpreter, parser);

            // These will be implemented in the future
            // } else if (isCurrentTokenType(parser, "Import")) {
            //     parseImportDeclaration(interpreter, parser);
            // } else if (isCurrentTokenType(parser, "Export")) {
            //     parseExportDeclaration(interpreter, parser);

        } else {
            return parseStatement(interpreter, parser);
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
 * Parses the tokens inside `parser` and returns the abstract syntax tree.
 * @param {Interpreter} interpreter Interpreter state
 * @param {Parser} parser Parser state
 * @returns {AbstractSyntaxTree}
 */
export function parse(interpreter, parser) {
    const statements = [];

    while (!isCurrentTokenType(parser, "EndOfFile")) {
        const declaration = parseDeclaration(interpreter, parser);

        if (declaration !== undefined) {
            statements.push(declaration);
        }
    }

    return {
        type: interpreter.isModule ? "Module" : "Program",
        imports: parser.imports,
        exports: parser.exports,
        statements
    };
}



