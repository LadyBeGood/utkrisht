import * as logger from "./logger.js";

export function createParser(tokens) {
    return {
        tokens,
        position: 0,
        variableExpression: undefined,
        variableExpressionEndPosition: undefined,
        variableAssignment: undefined,
        variableAssignmentEndPosition: undefined,
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
            _arguments.push( { type: "Argument", name: undefined, value: parseExpression(utkrisht, parser) });

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
        expression = { type: "LiteralExpression", value: { type: "BooleanExpression", value: true }};
        parser.position++;
    } else if (isCurrentTokenType(parser, "wrong")) {
        expression = { type: "LiteralExpression", value: { type: "BooleanExpression", value: false }};
        parser.position++;
    } else if (isCurrentTokenType(parser, "StringLiteral")) {
        expression = { type: "LiteralExpression", value: { type: "StringLiteral", value: getCurrentToken(parser).lexeme }};
        parser.position++;
    } else if (isCurrentTokenType(parser, "NumericLiteral")) {
        expression = { type: "LiteralExpression", value: { type: "NumericLiteral", value: Number(getCurrentToken(parser).lexeme) }};
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


function parseWhenStatement(utkrisht, parser) {

}
function parseLoopStatement(utkrisht, parser) {

}
function parseTryStatement(utkrisht, parser) {

}
function parseExitStatement(utkrisht, parser) {

}
function parseStopOrSkipStatement(utkrisht, parser) {

}

function parseVariableAssignmentStatement(utkrisht, parser) {

}

function parseVariableDeclaration(utkrisht, parser) {
    const name = getCurrentToken(parser);

    const parametersOrArguments = [];
    while (isCurrentTokenType(parser, "Identifier")) {
        const name = getCurrentToken(parser);
        parser.position++


    }
}


function parseStatement(utkrisht, parser) {
    if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
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

function handleIdentifier(utkrisht, parser) {
    const startPosition = parser.position;
    const isSingleLineMode = parser.tokens[parser.position + 1].type === "Indent" ? false : true;
    
    const name = getCurrentToken(parser);
    parser.position++;

    const parametersOrArguments = [];

    if (isSingleLineMode) {
        while (true) {
            // Named Argument or Default Parameter Value
            if (isCurrentTokenType(parser, "Identifier") && isNextTokenType(parser, "Colon")) {
                const name = getCurrentToken(parser);
                parser.position += 2;
                const value = parseExpression(utkrisht, parser);
                parametersOrArguments.push({ type: "NamedArgumentOrDefaultParameterValue", name, value });

                if (isCurrentTokenType(parser, "Comma")) {
                    parser.position++;
                    continue;
                } else {
                    break
                }
            }

            if (isCurrentTokenTypeExpressionStart(parser)) {
                const value = parseExpression(utkrisht, parser);
                parametersOrArguments.push({ type: "ParameterOrArgument", value });

                if (isCurrentTokenType(parser, "Comma")) {
                    parser.position++;
                    continue;
                } else {
                    break
                }
            }
        }
    } else {
        expectToken(utkrisht, parser, "Indent");
        parser.position++;

        while (isCurrentTokenType(parser, "Comma")) {
            break;
        }

        expectToken(utkrisht, parser, "Dedent");
    }



    if (isCurrentTokenType(parser, "Tilde")) {
        // Skip Tilde token
        parser.position++;

        const type = "VariableDeclaration";
        const value = parseExpression(utkrisht, parser);
        ignoreToken(parser, "NewLine");

        return { type, name, parameters: parametersOrArguments, value }
    }
    
    else if (isCurrentTokenType(parser, "Equal")) {
        // Skip Equal token
        parser.position++;
        
        const type = "VariableAssignment";
        const value = parseExpression(utkrisht, parser);
        ignoreToken(parser, "Newline");

        parser.variableAssignment = { type, name, parameters: parametersOrArguments, value }
        parser.variableAssignmentEndPosition = parser.position;
        parser.position = startPosition;
    }

    else {
        const type = "VariableExpression";
        parser.variableExpression = { type, name, arguments: parametersOrArguments }
        parser.position = startPosition;
    }
}


function parseDeclaration(utkrisht, parser) {
    try {
        if (isCurrentTokenType(parser, "Identifier")) {
            const x = handleIdentifier(utkrisht, parser);
            if (x !== undefined) {
                return x;
            }
            return parseStatement(utkrisht, parser);
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



