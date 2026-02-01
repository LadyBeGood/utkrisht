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

function error(utkrisht, message, token) {
    logger.error(utkrisht, message, token.line)
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

function expectToken(utkrisht, parser, ...tokens) {
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

    throw error(utkrisht, "Expected " + expected + ", but " + found, getCurrentToken(parser))
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


function parseVariableExpression(utkrisht, parser) {
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
            _arguments.push({ type: "Argument", name: undefined, value: parseExpression(utkrisht, parser) });

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
            const value = parseExpression(utkrisht, parser);
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

function parsePrimaryExpression(utkrisht, parser) {
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
        expression = { type: "GroupingExpression", expression: parseExpression(utkrisht, parser) };
        expectToken(utkrisht, parser, "RightRoundBracket");
        parser.position++;
    } else if (isCurrentTokenType(parser, "Identifier")) {
        expression = parseVariableExpression(utkrisht, parser);
    } else {
        throw error(
            utkrisht,
            isCurrentTokenType(parser, "EndOfFile")
                ? "Expected an expression but reached end of code"
                : "Expected an expression but got " + getCurrentToken(parser).type
            ,
            getCurrentToken(parser)
        );
    }

    return expression;
}

function parseUnaryExpression(utkrisht, parser) {
    if (isCurrentTokenType(parser, "ExclamationMark", "Minus")) {
        const operator = getCurrentToken(parser);
        parser.position++
        const right = parseUnaryExpression(utkrisht, parser);
        return { type: "UnaryExpression", operator, right };
    }

    return parsePrimaryExpression(utkrisht, parser);
}


function parseMultiplicationAndDivisionExpression(utkrisht, parser) {
    let expression = parseUnaryExpression(utkrisht, parser);

    while (isCurrentTokenType(parser, "Asterisk", "Slash")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseUnaryExpression(utkrisht, parser)
        expression = { left: expression, operator, right }
    }

    return expression;
}

function parseAdditionAndSubstractionExpression(utkrisht, parser) {
    let expression = parseMultiplicationAndDivisionExpression(utkrisht, parser);

    while (isCurrentTokenType(parser, "Plus", "Minus")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseMultiplicationAndDivisionExpression(utkrisht, parser);
        expression = { left: expression, operator, right }
    }

    return expression;
}


function parseComparisonExpression(utkrisht, parser) {
    let expression = parseAdditionAndSubstractionExpression(utkrisht, parser);

    while (isCurrentTokenType(parser, "MoreThan", "LessThan", "ExclamationMarkMoreThan", "ExclamationMarkLessThan")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseAdditionAndSubstractionExpression(utkrisht, parser);
        expression = { left: expression, operator, right }
    }

    return expression;
}

function parseEqualityAndInequalityExpression(utkrisht, parser) {
    let expression = parseComparisonExpression(utkrisht, parser);

    while (isCurrentTokenType(parser, "Equal", "ExclamationMarkEqual")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseComparisonExpression(utkrisht, parser);
        expression = { left: expression, operator, right };
    }
    return expression;
}

function parseExpression(utkrisht, parser) {
    return parseEqualityAndInequalityExpression(utkrisht, parser);
}

function parseExpressionStatement(utkrisht, parser) {
    const expressionStatement = parseExpression(utkrisht, parser);
    expectToken(utkrisht, parser, "NewLine", "Dedent", "EndOfFile");
    ignoreToken(parser, "NewLine")
    return expressionStatement;
}

function parseBlock(utkrisht, parser) {
    expectToken(utkrisht, parser, "Indent");
    parser.position++;

    const statements = [];

    while (!isAtEnd(parser) && !isCurrentTokenType(parser, "Dedent")) {
        statements.push(parseDeclaration(utkrisht, parser));
    }

    expectToken(utkrisht, parser, "Dedent");
    parser.position++;

    return { type: "Block", statements }
}

function parseWhenStatement(utkrisht, parser) {
    const whenClauses = [];

    const whenKeyword = getCurrentToken(parser);
    parser.position++;

    const condition = parseExpression(utkrisht, parser);
    const block = parseBlock(utkrisht, parser);

    whenClauses.push({ type: "WhenClause", keyword: whenKeyword, condition, block });

    while (isCurrentTokenType(parser, "Else")) {
        const keyword = getCurrentToken(parser);
        parser.position++;

        let condition = undefined;
        if (!isCurrentTokenType(parser, "Indent")) {
            condition = parseExpression(utkrisht, parser);
        }

        const block = parseBlock(utkrisht, parser);

        whenClauses.push({ type: "WhenClause", keyword, condition, block });
    } 

    return { type: "WhenStatement", whenClauses }
}


function parseBinding(utkrisht, parser) {
    expectToken(utkrisht, parser, "LeftSquareBracket", "Identifier")

    // Destructure
    if (isCurrentTokenType("LeftSquareBracket")) {
        parser.position++; // consume [
        const declarations = [];

        while (!isCurrentTokenType(parser, "RightSquareBracket")) {
            // Nesting allowed for arrays, but groups still forbidden
            declarations.push(parseBinding(utkrisht, parser));

            if (isCurrentTokenType(parser, "Comma")) {
                parser.position++;
            } else {
                break;
            }
        }

        expectToken(utkrisht, parser, "RightSquareBracket");
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

function parseLoopStatement(utkrisht, parser) {
    const loopKeyword = getCurrentToken(parser);
    let isGrouping = false
    
    if (isCurrentTokenType(parser, "LeftRoundBracket")) {
        isGrouping = true;
        parser.position++;
    }

    const loopClauses = [];
    while(isCurrentTokenTypeExpressionStart(parser)) {
        const left = parseExpression(utkrisht, parser);

        let withKeyword;
        let right;
        if (isCurrentTokenType(parser, "With")) {
            withKeyword = getCurrentToken(parser);
            parser.position++

            right = parseBinding(utkrisht, parser, true);
        }

        loopClauses.push({ type: "LoopClause", withKeyword, left, right })

        if (isCurrentTokenType(parser, "Comma")) {
            parser.position++
        } else {
            break;
        }
    }

    if (isGrouping) {
        expectToken(utkrisht, parser, "RightRoundBracket");
        parser.position++;
    }

    const block = parseBlock(utkrisht, parser);

    return { type: "LoopStatement", loopKeyword, loopClauses, block }
}


function parseTryStatement(utkrisht, parser) {
    const tryKeyword = getCurrentToken(parser);
    parser.position++;

    const tryBlock = parseBlock(utkrisht, parser);

    expectToken(utkrisht, parser, "Fix");
    const fixKeyword = getCurrentToken(parser);
    parser.position++;

    const fixBlock = parseBlock(utkrisht, parser);

    return { type: "TryStatement", tryKeyword, tryBlock, fixKeyword, fixBlock };
}


function parseExitStatement(utkrisht, parser) {
    const keyword = getCurrentToken(parser);
    parser.position++;

    let value = undefined;
    
    if (!isCurrentTokenType(parser, "NewLine", "Dedent")) {
        value = parseExpression(utkrisht, parser);
    }

    expectToken(utkrisht, parser, "NewLine", "Dedent");
    ignoreToken(parser, "NewLine");

    return { type: "ExitStatement", keyword, value }
}

function parseStopOrSkipStatement(utkrisht, parser) {
    const keyword = getCurrentToken(parser);
    parser.position++;

    let label = undefined;
    if (isCurrentTokenType(parser, "Identifier")) {
        label = getCurrentToken(parser);
    }

    expectToken(utkrisht, parser, "NewLine", "Dedent");
    ignoreToken(parser, "NewLine");

    if (keyword.type === "Stop") {
        return { type: "StopStatement", keyword, label}
    } else {
        return { type: "SkipStatement", keyword, label}
    }
}

function parseVariableAssignmentStatement(utkrisht, parser) {
    const name = getCurrentToken(parser);
    parser.position++;

    expectToken(utkrisht, parser, "Equal");
    parser.position++;

    const value = parseExpression(utkrisht, parser);

    ignoreToken(parser, "NewLine");

    return { type: "Assignment", name, value };
}


/**  
 * This function behaviour may change with new Utkrisht versions.
 */
function isVariableAssignment(parser) {
    return isNextTokenType(parser, "Equal")
}

function parseStatement(utkrisht, parser) {
    if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "Loop")) {
        return parseLoopStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "Try")) {
        return parseTryStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "Exit")) {
        return parseExitStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "Stop", "Skip")) {
        return parseStopOrSkipStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "Identifier") && isVariableAssignment(parser)) {
        return parseVariableAssignmentStatement(utkrisht, parser);
    }
    else {
        if (isCurrentTokenType(parser, "Else")) {
            throw error(utkrisht, "Can not use `else` statement without `when` statement", getCurrentToken(parser));
        } else if (isCurrentTokenType(parser, "Fix")) {
            throw error(utkrisht, "Can not use `fix` statement without `try` statement", getCurrentToken(parser));
        } else if (isCurrentTokenType(parser, "With")) {
            throw error(utkrisht, "Can not use `with` statement without `loop` statement", getCurrentToken(parser))
        } else {
            return parseExpressionStatement(utkrisht, parser);
        }
    }
}


function parseVariableDeclaration(utkrisht, parser) {
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

        parameters.push( { type: "Parameter", name, defaultValue })
        if (isCurrentTokenType(parser, "Comma")) {
            parser.position++;
        } else {
            break;
        }
    }

    expectToken(utkrisht, parser, "Tilde");
    parser.position++;

    const value = parseExpression(utkrisht, parser);
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


function parseDeclaration(utkrisht, parser) {
    try {
        if (isCurrentTokenType(parser, "Identifier") && isVariableDeclaration(parser)) {
            parseVariableDeclaration(utkrisht, parser);
        } else {
            return parseStatement(utkrisht, parser);
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

export function parse(utkrisht, parser) {
    const statements = [];

    while (!isAtEnd(parser)) {
        statements.push(parseDeclaration(utkrisht, parser));
    }

    return statements;
}



