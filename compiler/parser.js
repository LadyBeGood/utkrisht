
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
        lhs: undefined
    };
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
 * 
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
 * 
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

    error(compiler, "Expected " + expected + ", but " + found, getCurrentToken(parser).line)
}

/**
 * If the type of token at the current position of the parser is of the given type, then increase the position of the parser, and return the token.
 * Otherwise throw a `ParserError`.
 * 
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
 * 
 * @param {Parser} parser Parser state
 * @returns {boolean} 
 */
function isCurrentTokenTypeExpressionStart(parser) {
    return isCurrentTokenType(parser,
        "NumericLiteral",
        "StringLiteral",
        "Identifier",
        "LeftRoundBracket",
        "LeftCurlyBracket",
        "LeftSquareBracket",
        "ExclamationMark"
    )
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
function parsePrimaryExpression(compiler, parser) {
    if (isCurrentTokenType(parser, "StringLiteral")) {
        const stringLiteral = consume(compiler, parser, "StringLiteral").literal;
        return { 
            type: "LiteralExpression", 
            value: { 
                type: "StringLiteral", 
                // This check is only done to satisfy Typescript typechecker
                // We know for sure that `stringLiteral` is a string
                value: typeof stringLiteral === "string" ? stringLiteral : "" 
            } 
        };
    } 
    else if (isCurrentTokenType(parser, "NumericLiteral")) {
        const numericLiteral = consume(compiler, parser, "NumericLiteral").literal;
        return { 
            type: "LiteralExpression", 
            value: { 
                type: "NumericLiteral", 
                // This check is only done to satisfy Typescript typechecker
                // We know for sure that `numericLiteral` is a number
                value: typeof numericLiteral === "number" ? numericLiteral: -1 
            } 
        };
    } 
    else if (isCurrentTokenType(parser, "LeftRoundBracket")) {
        parser.position++;
        
        /** @type {Expression} */
        const expression = { 
            type: "GroupingExpression", 
            expression: parseExpression(compiler, parser) 
        };
        
        consume(compiler, parser, "RightRoundBracket");
        
        return expression;
    } else if (isCurrentTokenType(parser, "Identifier")) {
        return { type: "VariableExpression", name: consume(compiler, parser, "Identifier") };
    } else {
        error(
            compiler,
            isCurrentTokenType(parser, "EndOfFile")
                ? "Expected an expression but reached end of code"
                : "Expected an expression but got " + getCurrentToken(parser).type,
            getCurrentToken(parser).line
        );
    }
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
function parseArgumentsList(compiler, parser) {
    const args = [parseAdditionAndSubstractionExpression(compiler, parser)];

    while (isCurrentTokenType(parser, "Comma")) {
        parser.position++;
        // if (parser.isStatementLevel) {
        //     args.push(parseExpression(compiler, parser))
        // } else {
        args.push(parseAdditionAndSubstractionExpression(compiler, parser))
        // }
    }

    return args;
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
function parseArguments(compiler, parser) {
    let args = [];
    
    if (isCurrentTokenType(parser, "LeftRoundBracket") && isNextTokenType(parser, "RightRoundBracket")) {
        parser.position += 2;
        return args;
    }
        
    args = parseArgumentsList(compiler, parser);
    return args
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
function parseCallExpression(compiler, parser, caller) {
    let args = parseArguments(compiler, parser);
    let expression = {
        type: "CallExpression",
        caller,
        arguments: args,
    };

    if (isCurrentTokenTypeExpressionStart(parser)) {
        expression = parseCallExpression(compiler, parser, expression);
    }

    return expression;
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
function parseMemberExpression(compiler, parser) {
    let expression = parsePrimaryExpression(compiler, parser);

    while (isCurrentTokenType(parser, "Dot")) {
        const operator = consume(compiler, parser, "Dot");
        let property;
        let isComputed;

        if (isCurrentTokenType(parser, "LeftRoundBracket")) {
            parser.position++;
            isComputed = true;
            property = parseExpression(compiler, parser);
            consume(compiler, parser, "RightRoundBracket");
        } else {
            isComputed = false;
            property = parseExpression(compiler, parser);
        }

        expression = {
            type: "MemberExpression",
            expression,
            property,
            isComputed,
        }

    }

    return expression;
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
function parseMemberCallExpression(compiler, parser) {
    const expression = parseMemberExpression(compiler, parser);

    if (isCurrentTokenTypeExpressionStart(parser)) {
        return parseCallExpression(compiler, parser, expression);
    }

    return expression;
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
function parseUnaryExpression(compiler, parser) {
    if (isCurrentTokenType(parser, "ExclamationMark", "Minus")) {
        const operator = getCurrentToken(parser);
        parser.position++
        const right = parseUnaryExpression(compiler, parser);
        return { type: "UnaryExpression", operator, right };
    }

    return parseMemberCallExpression(compiler, parser);
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
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

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
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

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
function parseComparisonExpression(compiler, parser) {
    let expression = parser.lhs ?? parseAdditionAndSubstractionExpression(compiler, parser);

    while (isCurrentTokenType(parser, "MoreThan", "LessThan", "MoreThanEqual", "LessThanEqual")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseAdditionAndSubstractionExpression(compiler, parser);
        expression = { type: "BinaryExpression", left: expression, operator, right }
    }

    return expression;
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
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


/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
function parseLogicalAndExpression(compiler, parser) {
    let expression = parseEqualityAndInequalityExpression(compiler, parser);
    
    while (isCurrentTokenType(parser, "And")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseEqualityAndInequalityExpression(compiler, parser);
        expression = { type: "LogicalExpression", left: expression, operator, right};
    }

    return expression;
}


/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
function parseLogicalOrExpression(compiler, parser) {
    let expression = parseLogicalAndExpression(compiler, parser);
    
    while (isCurrentTokenType(parser, "Bar")) {
        const operator = getCurrentToken(parser);
        parser.position++;
        const right = parseLogicalAndExpression(compiler, parser);
        expression = { type: "LogicalExpression", left: expression, operator, right };
    }

    return expression;
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Expression}
 */
function parseExpression(compiler, parser) {
    return parseLogicalOrExpression(compiler, parser);
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Statement}
 */
function parseExpressionStatement(compiler, parser) {
    const expression = parseExpression(compiler, parser);
    expect(compiler, parser, "NewLine", "Dedent", "EndOfFile");
    ignore(parser, "NewLine")
    return { type: "ExpressionStatement", expression };
}

/**
 * 
 * @param {Compiler} compiler 
 * @param {Parser} parser 
 * @returns {Statement}
 */
function parseBlockStatement(compiler, parser) {
    consume(compiler, parser, "Indent");

    /** @type {Statement[]} */
    const statements = [];

    while (!isCurrentTokenType(parser, "EndOfFile") && !isCurrentTokenType(parser, "Dedent")) {
        statements.push(parseStatement(compiler, parser));
    }

    consume(compiler, parser, "Dedent");

    return { type: "BlockStatement", body: statements }
}

// function parseWhenStatement(compiler, parser) {
//     const whenClauses = [];

//     const whenKeyword = getCurrentToken(parser);
//     parser.position++;

//     const condition = parseExpression(compiler, parser);
//     const block = parseBlockStatement(compiler, parser);

//     whenClauses.push({ type: "WhenClause", keyword: whenKeyword, condition, block });

//     while (isCurrentTokenType(parser, "Else")) {
//         const keyword = getCurrentToken(parser);
//         parser.position++;

//         let condition = undefined;
//         if (!isCurrentTokenType(parser, "Indent")) {
//             condition = parseExpression(compiler, parser);
//         }

//         const block = parseBlockStatement(compiler, parser);

//         whenClauses.push({ type: "WhenClause", keyword, condition, block });
//     }

//     return { type: "WhenStatement", whenClauses }
// }

// /**
//  *
//  * @param {Compiler} compiler
//  * @param {Parser} parser
//  * @returns {Expression}
//  */
// function parseBinding(compiler, parser) {
//     expect(compiler, parser, "LeftSquareBracket", "Identifier")

//     // Destructure
//     if (isCurrentTokenType("LeftSquareBracket")) {
//         parser.position++; // consume [
//         const declarations = [];

//         while (!isCurrentTokenType(parser, "RightSquareBracket")) {
//             // Nesting allowed for arrays, but groups still forbidden
//             declarations.push(parseBinding(compiler, parser));

//             if (isCurrentTokenType(parser, "Comma")) {
//                 parser.position++;
//             } else {
//                 break;
//             }
//         }

//         expect(compiler, parser, "RightSquareBracket");
//         parser.position++; // consume ]

//         return { type: "Destructure", declarations };
//     }

//     // Simple Identifier
//     if (isCurrentTokenType("Identifier")) {
//         const value = getCurrentToken(parser);
//         parser.position++;
//         return { type: "Identifier", value };
//     }

// }

// /**
//  *
//  * @param {Compiler} compiler
//  * @param {Parser} parser
//  * @returns {Statement}
//  */
// function parseLoopStatement(compiler, parser) {
//     const loopKeyword = getCurrentToken(parser);
//     let isGrouping = false

//     if (isCurrentTokenType(parser, "LeftRoundBracket")) {
//         isGrouping = true;
//         parser.position++;
//     }

//     const loopClauses = [];
//     while (isCurrentTokenTypeExpressionStart(parser)) {
//         const left = parseExpression(compiler, parser);

//         let withKeyword;
//         let right;
//         if (isCurrentTokenType(parser, "With")) {
//             withKeyword = getCurrentToken(parser);
//             parser.position++

//             right = parseBinding(compiler, parser, true);
//         }

//         loopClauses.push({ type: "LoopClause", withKeyword, left, right })

//         if (isCurrentTokenType(parser, "Comma")) {
//             parser.position++
//         } else {
//             break;
//         }
//     }

//     if (isGrouping) {
//         expect(compiler, parser, "RightRoundBracket");
//         parser.position++;
//     }

//     const block = parseBlockStatement(compiler, parser);

//     return { type: "LoopStatement", loopKeyword, loopClauses, block }
// }

// /**
//  *
//  * @param {Compiler} compiler
//  * @param {Parser} parser
//  * @returns {Statement}
//  */
// function parseTryStatement(compiler, parser) {
//     const tryKeyword = getCurrentToken(parser);
//     parser.position++;

//     const tryBlock = parseBlockStatement(compiler, parser);

//     expect(compiler, parser, "Fix");
//     const fixKeyword = getCurrentToken(parser);
//     parser.position++;

//     const fixBlock = parseBlockStatement(compiler, parser);

//     return { type: "TryStatement", tryKeyword, tryBlock, fixKeyword, fixBlock };
// }

// /**
//  * @param {Compiler} compiler
//  * @param {Parser} parser
//  * @returns {Statement}
//  */
// function parseReturnStatement(compiler, parser) {
//     const keyword = getCurrentToken(parser);
//     parser.position++;

//     let value = undefined;

//     if (!isCurrentTokenType(parser, "NewLine", "Dedent")) {
//         value = parseExpression(compiler, parser);
//     }

//     expect(compiler, parser, "NewLine", "Dedent");
//     ignore(parser, "NewLine");

//     return { type: "ReturnStatement", keyword, value }
// }

// /**
//  *
//  * @param {Compiler} compiler
//  * @param {Parser} parser
//  * @returns {Statement}
//  */
// function parseExitOrSkipStatement(compiler, parser) {
//     const keyword = getCurrentToken(parser);
//     parser.position++;

//     let label = undefined;
//     if (isCurrentTokenType(parser, "Identifier")) {
//         label = getCurrentToken(parser);
//     }

//     expect(compiler, parser, "NewLine", "Dedent");
//     ignore(parser, "NewLine");

//     if (keyword.type === "Exit") {
//         return { type: "ExitStatement", keyword, label }
//     } else {
//         return { type: "SkipStatement", keyword, label }
//     }
// }


// /**
//  * @param {Compiler} compiler Compiler state
//  * @param {Parser} parser Parser state
//  * @returns {Statement | undefined}  statement
//  */
// function parseAssignmentStatement(compiler, parser) {
//     // const left =
// }



/**
 * @param {Compiler} compiler Compiler state 
 * @param {Parser} parser Parser state
 * @returns {Statement} Variable declaration statement
 */
function parseVariableDeclarationOrExpressionStatement(compiler, parser) {
    const left = parseMemberCallExpression(compiler, parser);

    if (isCurrentTokenType(parser, "Equal")) {
        const operator = consume(compiler, parser, "Equal");
        const right = parseExpression(compiler, parser);

        expect(compiler, parser, "NewLine", "EndOfFile");
        ignore(parser, "NewLine");
        
        return {
            type: "VariableDeclarationStatement",
            name: left,
            value: right
        }
    } else {
        parser.lhs = left
        return parseExpressionStatement(compiler, parser);
    }
}




/**
 * @param {Compiler} compiler Compiler state 
 * @param {Parser} parser Parser state
 * @returns {Statement}  statement
 */
function parseStatement(compiler, parser) {
    // if (isCurrentTokenType(parser, "When")) {
    //     return parseWhenStatement(compiler, parser);
    // }    
    // else if (isCurrentTokenType(parser, "Loop")) {
    //     return parseLoopStatement(compiler, parser);
    // }    
    // else if (isCurrentTokenType(parser, "Try")) {
    //     return parseTryStatement(compiler, parser);
    // }    
    // else if (isCurrentTokenType(parser, "Return")) {
    //     return parseReturnStatement(compiler, parser);
    // }    
    // else if (isCurrentTokenType(parser, "Crash")) {
    //     return parseCrashStatement(compiler, parser);
    // }    
    // else if (isCurrentTokenType(parser, "Exit", "Skip")) {
    //     return parseExitOrSkipStatement(compiler, parser);
    // }
    // else if (isCurrentTokenType(parser, "Import")) {
    //     return parseImportStatement(compiler, parser);
    // }
    // else if (isCurrentTokenType(parser, "Export")) {
    //     return parseExportStatement(compiler, parser);
    // }
    // else if (isCurrentTokenType(parser, "Identifier") && isNextTokenType(parser, "Tilde")) {
    //     return parseAssignmentStatement(compiler, parser);
    // }
    // else {
    //     if (isCurrentTokenType(parser, "Else")) {
    //         error(compiler, "Can not use `else` statement without `when` statement", getCurrentToken(parser).line);
    //     } else if (isCurrentTokenType(parser, "Fix")) {
    //         error(compiler, "Can not use `fix` statement without `try` statement", getCurrentToken(parser).line);
    //     } else if (isCurrentTokenType(parser, "With")) {
    //         error(compiler, "Can not use `with` statement without `loop` statement", getCurrentToken(parser).line)
    //     } else {
            return parseVariableDeclarationOrExpressionStatement(compiler, parser);
    //     }
    // }
}


/**
 * Parses the tokens inside `parser` and returns the abstract syntax tree. 
 * 
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


