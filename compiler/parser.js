
// Local imports
import "./utilities/types.js"
import { error } from "./utilities/logger.js";  

/**
 * Creates the state of parser
 * 
 * @param {Token[]} tokens Tokens produced by the lexer
 * @returns {Parser}
 */
export function createParser(tokens) {
    return {
        tokens,
        position: 0,
    };
}

/**
 * Used to synchronise the parser
 */
class ParserError extends Error {
    /**
     * @param {Compiler} compiler 
     * @param {string} message 
     * @param {Token} token 
     */
    constructor(compiler, message, token) {
        super(message);
        this.token = token;
        this.name = "ParserError";

        error(compiler, message, token.line)
    }
}


/**
 * Returns the token at current position of parser
 * 
 * @param {Parser} parser Parser State
 * @returns {Token}
 */
function getCurrentToken(parser) {
    return parser.tokens[parser.position];
}

/**
 * Returns the token immediately after current position of parser
 * 
 * @param {Parser} parser Parser State
 * @returns {Token}
 */
function getNextToken(parser) {
    return parser.tokens[parser.position + 1];
}

/**
 * Returns the token at a given position
 * 
 * @param {Parser} parser Parser State
 * @param {number} position Position of token
 * @returns {Token}
 */
function getTokenAtPosition(parser, position) {
    return parser.tokens[position];
}

/**
 * Checks if type of token at the current position of parser is among given types. 
 * 
 * @param {Parser} parser Parser state
 * @param  {...TokenType} types Expected types
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
 * 
 * @param {Parser} parser Parser state
 * @param  {...TokenType} types Expected types
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
 * 
 * @param {Parser} parser Parser state
 * @param {number} position 
 * @param  {...TokenType} types Expected types
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
 * @param  {...TokenType} types Expected types
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
 * @param  {...TokenType} types Expected types
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

    throw new ParserError(compiler, "Expected " + expected + ", but " + found, getCurrentToken(parser))
}

/**
 * If the type of token at the current position of the parser is of the given type, then increase the position of the parser, and return the token.
 * Otherwise throw a `ParserError`.
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @param  {TokenType} type Expected type
 * @returns {Token} Token at the current position of parser
 */
function consume(compiler, parser, type) {
    expect(compiler, parser, type);
    const token = getCurrentToken(parser);
    parser.position++;
    return token
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

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns 
 */
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

function parseBlockStatement(compiler, parser) {
    expect(compiler, parser, "Indent");
    parser.position++;

    const statements = [];

    while (!isCurrentTokenType(parser, "EndOfFile") && !isCurrentTokenType(parser, "Dedent")) {
        statements.push(parseStatement(compiler, parser));
    }

    expect(compiler, parser, "Dedent");
    parser.position++;

    return { type: "BlockStatement", statements }
}

function parseWhenStatement(compiler, parser) {
    const whenClauses = [];

    const whenKeyword = getCurrentToken(parser);
    parser.position++;

    const condition = parseExpression(compiler, parser);
    const block = parseBlockStatement(compiler, parser);

    whenClauses.push({ type: "WhenClause", keyword: whenKeyword, condition, block });

    while (isCurrentTokenType(parser, "Else")) {
        const keyword = getCurrentToken(parser);
        parser.position++;

        let condition = undefined;
        if (!isCurrentTokenType(parser, "Indent")) {
            condition = parseExpression(compiler, parser);
        }

        const block = parseBlockStatement(compiler, parser);

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

    const block = parseBlockStatement(compiler, parser);

    return { type: "LoopStatement", loopKeyword, loopClauses, block }
}

function parseTryStatement(compiler, parser) {
    const tryKeyword = getCurrentToken(parser);
    parser.position++;

    const tryBlock = parseBlockStatement(compiler, parser);

    expect(compiler, parser, "Fix");
    const fixKeyword = getCurrentToken(parser);
    parser.position++;

    const fixBlock = parseBlockStatement(compiler, parser);

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
function parseExitOrSkipStatement(compiler, parser) {
    const keyword = getCurrentToken(parser);
    parser.position++;

    let label = undefined;
    if (isCurrentTokenType(parser, "Identifier")) {
        label = getCurrentToken(parser);
    }

    expect(compiler, parser, "NewLine", "Dedent");
    ignore(parser, "NewLine");

    if (keyword.type === "Exit") {
        return { type: "StopStatement", keyword, label }
    } else {
        return { type: "SkipStatement", keyword, label }
    }
}


/**
 * @param {Compiler} compiler Compiler state 
 * @param {Parser} parser Parser state
 * @returns {Statement | undefined}  statement
 */
function parseIdentifierLedStatement(compiler, parser) {
    
}



/**
 * @param {Compiler} compiler Compiler state 
 * @param {Parser} parser Parser state
 * @returns {Statement | undefined}  statement
 */
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
        return parseExitOrSkipStatement(compiler, parser);
    }    
    else if (isCurrentTokenType(parser, "Identifier")) {
        return parseIdentifierLedStatement(compiler, parser);
    }    
    else {
        if (isCurrentTokenType(parser, "Else")) {
            throw new ParserError(compiler, "Can not use `else` statement without `when` statement", getCurrentToken(parser));
        } else if (isCurrentTokenType(parser, "Fix")) {
            throw new ParserError(compiler, "Can not use `fix` statement without `try` statement", getCurrentToken(parser));
        } else if (isCurrentTokenType(parser, "With")) {
            throw new ParserError(compiler, "Can not use `with` statement without `loop` statement", getCurrentToken(parser))
        } else {
            return parseExpressionStatement(compiler, parser);
        }    
    }    
}    


/**
 * Parses the tokens inside `parser` and returns the abstract syntax tree. 
 * @param {Compiler} compiler Compiler state
 * @param {Parser} parser Parser state
 * @returns {Statement[]}
 */
export function parse(compiler, parser) {
    const statements = [];

    while (!isCurrentTokenType(parser, "EndOfFile")) {
        const statement = parseStatement(compiler, parser);
        
        if (statement !== undefined) {
            statements.push(statement);
        }    
    }    

    return statements
}    
