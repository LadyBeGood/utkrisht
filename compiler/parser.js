import "./types.js"
import * as logger from "./logger.js";

export function createParser(tokens) {
    return {
        tokens,
        position: 0,
    };
}

class ParseError extends Error {
    constructor(message, token) {
        super(message);
        this.token = token;
        this.name = "ParseError";
    }
}

function error(compiler, message, token) {
    logger.error(compiler, message, token.line)
    return new ParseError(message, token)
}

function getCurrentToken(parser) {
    return parser.tokens[parser.position];
}

function getNextToken(parser) {
    return parser.tokens[parser.position + 1];
}

function getTokenTypeAtPosition(parser, position) {
    return parser.tokens[position];
}

function isCurrentTokenType(parser, ...types) {
    for (const type of types) {
        if (getCurrentToken(parser).type === type) {
            return true;
        }
    }
    return false;
}

function isNextTokenType(parser, ...types) {
    for (const type of types) {
        if (getNextToken(parser).type === type) {
            return true;
        }
    }
    return false;
}

function isTokenTypeAtPosition(parser, position, ...types) {
    for (const type of types) {
        if (getTokenTypeAtPosition(parser, position).type === type) {
            return true;
        }
    }
    return false;
}


function isAtEnd(parser) {
    return parser.tokens[parser.position].type === "EndOfFile";
}

function ignoreToken(parser, ...tokens) {
    if (isCurrentTokenType(parser, ...tokens)) {
        parser.position++;
    }
}

function expectToken(compiler, parser, ...tokens) {
    if (isCurrentTokenType(parser, ...tokens)) {
        return;
    }

    const expected =
        tokens.length === 1
            ? tokens[0]
            : "one of [" + tokens.join(", ") + "]"
        ;

    const found =
        isCurrentTokenType(parser, "EndOfFile")
            ? "reached end of code"
            : "got " + getCurrentToken(parser).type
        ;

    throw error(compiler, "Expected " + expected + ", but " + found, getCurrentToken(parser))
}


function synchronise(parser) {
    while (!isAtEnd(parser)) {
        parser.position++
        // if (isCurrentTokenType(parser, "NewLine")) {
        //     break;
        // }
        if (isCurrentTokenType(parser, "Loop", "When")) {
            break;
        }
    }
}


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
    if (parser.variableExpression !== undefined) {
        parser.position = parser.variableExpressionEndPosition;

        parser.variableExpression = undefined;
        parser.variableExpressionEndPosition = undefined;

        return parser.variableExpression;
    }
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

    return { type: "VariableExpression", name, _arguments }
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
        expectToken(compiler, parser, "RightRoundBracket");
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
        expression = { left: expression, operator, right }
    }

    return expression;
}

function parseAdditionAndSubstractionExpression(compiler, parser) {
    let expression = parseMultiplicationAndDivisionExpression(compiler, parser);

    while (isCurrentTokenType(parser, "Plus", "Minus")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseMultiplicationAndDivisionExpression(compiler, parser);
        expression = { left: expression, operator, right }
    }

    return expression;
}


function parseComparisonExpression(compiler, parser) {
    let expression = parseAdditionAndSubstractionExpression(compiler, parser);

    while (isCurrentTokenType(parser, "MoreThan", "LessThan", "ExclamationMarkMoreThan", "ExclamationMarkLessThan")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseAdditionAndSubstractionExpression(compiler, parser);
        expression = { left: expression, operator, right }
    }

    return expression;
}

function parseEqualityAndInequalityExpression(compiler, parser) {
    let expression = parseComparisonExpression(compiler, parser);

    while (isCurrentTokenType(parser, "Equal", "ExclamationMarkEqual")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseComparisonExpression(compiler, parser);
        expression = { left: expression, operator, right };
    }
    return expression;
}

function parseExpression(compiler, parser) {
    return parseEqualityAndInequalityExpression(compiler, parser);
}

function parseExpressionStatement(compiler, parser) {
    const expressionStatement = parseExpression(compiler, parser);
    expectToken(compiler, parser, "NewLine", "Dedent", "EndOfFile");
    ignoreToken(parser, "NewLine")
    return expressionStatement;
}

function parseBlock(compiler, parser) {
    expectToken(compiler, parser, "Indent");
    parser.position++;

    const statements = [];

    while (!isAtEnd(parser) && !isCurrentTokenType(parser, "Dedent")) {
        statements.push(parseDeclaration(compiler, parser));
    }

    expectToken(compiler, parser, "Dedent");
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
    expectToken(compiler, parser, "LeftSquareBracket", "Identifier")

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

        expectToken(compiler, parser, "RightSquareBracket");
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
        expectToken(compiler, parser, "RightRoundBracket");
        parser.position++;
    }

    const block = parseBlock(compiler, parser);

    return { type: "LoopStatement", loopKeyword, loopClauses, block }
}


function parseTryStatement(compiler, parser) {
    const tryKeyword = getCurrentToken(parser);
    parser.position++;

    const tryBlock = parseBlock(compiler, parser);

    expectToken(compiler, parser, "Fix");
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

    expectToken(compiler, parser, "NewLine", "Dedent");
    ignoreToken(parser, "NewLine");

    return { type: "ExitStatement", keyword, value }
}

function parseStopOrSkipStatement(compiler, parser) {
    const keyword = getCurrentToken(parser);
    parser.position++;

    let label = undefined;
    if (isCurrentTokenType(parser, "Identifier")) {
        label = getCurrentToken(parser);
    }

    expectToken(compiler, parser, "NewLine", "Dedent");
    ignoreToken(parser, "NewLine");

    if (keyword.type === "Stop") {
        return { type: "StopStatement", keyword, label }
    } else {
        return { type: "SkipStatement", keyword, label }
    }
}

function parseVariableAssignmentStatement(compiler, parser) {
    const name = getCurrentToken(parser);
    parser.position++;

    expectToken(compiler, parser, "Equal");
    parser.position++;

    const value = parseExpression(compiler, parser);

    ignoreToken(parser, "NewLine");

    return { type: "Assignment", name, value };
}


/**  
 * This function behaviour may change with new compiler versions.
 */
function isVariableAssignment(parser) {
    return isNextTokenType(parser, "Equal")
}

function parseStatement(compiler, parser) {
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


function parseVariableDeclaration(compiler, parser) {
    const name = getCurrentToken(parser);
    parser.position++;

    const parameters = [];
    while (isCurrentTokenType(parser, "Identifier")) {
        const name = getCurrentToken(parser);
        parser.position++

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

    expectToken(compiler, parser, "Tilde");
    parser.position++;

    const value = parseExpression(compiler, parser);
    ignoreToken(parser, "NewLine");

    return { type: "Declaration", name, parameters, value }
}


function isVariableDeclaration(parser) {
    let curlyBracketNestingDepth = 0;
    let squareBracketNestingDepth = 0;

    while (!isAtEnd(parser)) {
        if (isCurrentTokenType(parser, "LeftCurlyBracket")) {
            curlyBracketNestingDepth++;
        } else if (isCurrentTokenType(parser, "LeftSquareBracket")) {
            squareBracketNestingDepth++;
        } else if (isCurrentTokenType(parser, "RightCurlyBracket")) {
            curlyBracketNestingDepth--;
        } else if (isCurrentTokenType(parser, "RightSquareBracket")) {
            squareBracketNestingDepth--;
        }

        if (curlyBracketNestingDepth === 0 && squareBracketNestingDepth === 0) {
            if (isCurrentTokenType(parser, "NewLine")) {
                return false;
            } else if (isCurrentTokenType(parser, "Tilde")) {
                return true;
            }
        }
    }
}


function parseDeclaration(compiler, parser) {
    try {
        if (isCurrentTokenType(parser, "Identifier") && isVariableDeclaration(parser)) {
            parseVariableDeclaration(compiler, parser);
        } else {
            return parseStatement(compiler, parser);
        }
    } catch (error) {
        // We are only concerned about parser errors, not bugs in this file.
        if (error instanceof ParseError) {
            synchronise(parser);
            return undefined;
        }

        // If it is a different error, let the developer handle it
        throw error;
    }
}


/**
 * Parses the tokens inside `parser` and returns an array of statements.
 * @returns {Statement[]}
 */
export function parse(/** @type {Compiler} */ compiler, /** @type {Parser} */ parser) {
    const statements = [];

    while (!isAtEnd(parser)) {
        statements.push(parseDeclaration(compiler, parser));
    }

    return statements;
}



