
/**
 * @typedef { "LeftRoundBracket"
 *          | "RightRoundBracket"
 *          | "LeftSquareBracket"
 *          | "RightSquareBracket"
 *          | "LeftCurlyBracket"
 *          | "RightCurlyBracket"
 *          | "Dot"
 *          | "DotDot"
 *          | "DotDotDot"
 *          | "Comma"
 *          | "Colon"
 *          | "Tilde"
 *          | "Equal"
 *          | "LessThan"
 *          | "MoreThan"
 *          | "And"
 *          | "Plus"
 *          | "Minus"
 *          | "Asterisk"
 *          | "Slash"
 *          | "Bar"
 *          | "ExclamationMark"
 *          | "ExclamationMarkEqual"
 *          | "LessThanEqual"
 *          | "MoreThanEqual"
 *          | "StringLiteral"
 *          | "NumericLiteral"
 *          | "Identifier"
 *          | "Try"
 *          | "Fix"
 *          | "Crash"
 *          | "When"
 *          | "Else"
 *          | "Loop"
 *          | "With"
 *          | "Return"
 *          | "Exit"
 *          | "Skip"
 *          | "Import"
 *          | "Export"
 *          | "Indent"
 *          | "Dedent"
 *          | "NewLine"
 *          | "EndOfFile" } TokenType
 */

/**
 * @typedef {Object} Token
 * @property {TokenType} type The type of the token
 * @property {string} [lexeme] The literal text from the source
 * @property {string | number} [literal] The processed value (for strings/numbers)
 * @property {number} start 
 * @property {number} end
 * @property {boolean} hasLeadingWhitespace
 * @property {boolean} hasTrailingWhitespace
 */

 /**
 * @typedef { "Error"
 *          | "Warning"
 *          | "Information" } DiagnosticType
 */

/**
 * @typedef  {Object} Compiler Compiler state
 * @property {string} source
 * @property {*} logger
 */

/**
 * @typedef  {Object} Lexer Lexer state
 * @property {string} source The source code of the utkrisht file
 * @property {number} position The index of the current character in the source
 * @property {number} line Current line number inside the source
 * @property {number} indentWidth  Number of spaces required for a single level of indentation. Determined while lexing the source.
 * @property {number} nestingDepth Used to emit the correct number of Dedent tokens when returning to outer scopes.
 */

/**
 * @typedef {Object} Parser Parser state
 * @property {Token[]} tokens Tokens produced by the lexer
 * @property {number} position The index of the current token in the tokens
 * @property {Expression | undefined} preParsedExpression Temporary cache for an eagerly parsed expression node inside `parseVariableDeclarationStatementOrExpressionStatement`
*/



/*=============================*/
/* EXPRESSIONS                 */
/*=============================*/

/**
 * @typedef {object} LiteralExpression
 * @property {"LiteralExpression"} type
 * @property { StringLiteral 
 *           | NumericLiteral 
 *           | ProcedureLiteral } value
 */

/**
 * @typedef {object} StringLiteral
 * @property {"StringLiteral"} type
 * @property {string} value
 */

/**
 * @typedef {object} NumericLiteral
 * @property {"NumericLiteral"} type
 * @property {number} value
 */

/**
 * @typedef {object} ProcedureLiteral
 * @property {"ProcedureLiteral"} type
 * @property {Statement[]} body
 */

/**
 * @typedef {Object} UnaryExpression
 * @property {"UnaryExpression"} type
 * @property {Token} operator
 * @property {Expression} right
 */

/**
 * @typedef {Object} GroupingExpression
 * @property {"GroupingExpression"} type
 * @property {Expression} expression
 */

/**
 * @typedef {Object} BinaryExpression
 * @property {"BinaryExpression"} type
 * @property {Expression} left
 * @property {Token} operator
 * @property {Expression} right
 */

/**
 * @typedef {Object} LogicalExpression
 * @property {"LogicalExpression"} type
 * @property {Expression} left
 * @property {Token} operator
 * @property {Expression} right
 */

/**
 * @typedef {Object} CallExpression
 * @property {"CallExpression"} type
 * @property {VariableExpression} caller
 * @property {Expression[]} arguments
 */

/**
 * @typedef {Object} VariableExpression
 * @property {"VariableExpression"} type
 * @property {Token} name
 */

/**
 * @typedef { LiteralExpression 
 *          | UnaryExpression 
 *          | GroupingExpression 
 *          | LogicalExpression
 *          | CallExpression
 *          | VariableExpression
 *          | BinaryExpression } Expression
 */



/*=============================*/
/* STATEMENTS                  */
/*=============================*/

/**
 * @typedef {Object} BlockStatement
 * @property {"BlockStatement"} type
 * @property {Statement[]} body
 */

/**
 * @typedef {object} Parameter
 * @property {Expression} name
 * @property {Expression | undefined} defaultValue
 */

/**
 * @typedef {Object} VariableDeclarationStatement
 * @property {"VariableDeclarationStatement"} type
 * @property {Expression} name
 * @property {Parameter[]} parameters
 * @property {Expression} value
 * @property {Token} operator
 */

/**
 * @typedef {Object} ExpressionStatement
 * @property {"ExpressionStatement"} type
 * @property {Expression} expression
 */

/**
 * @typedef { BlockStatement
 *          | VariableDeclarationStatement
 *          | ExpressionStatement } Statement
 */

