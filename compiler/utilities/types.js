


/**
 * @typedef { "LeftRoundBracket"
 *          | "RightRoundBracket"
 *          | "LeftSquareBracket"
 *          | "RightSquareBracket"
 *          | "LeftCurlyBracket"
 *          | "RightCurlyBracket"
 *          | "Dot"
 *          | "Comma"
 *          | "Colon"
 *          | "Tilde"
 *          | "Equal"
 *          | "LessThan"
 *          | "MoreThan"
 *          | "At"
 *          | "Dollar"
 *          | "And"
 *          | "Plus"
 *          | "Minus"
 *          | "Asterisk"
 *          | "Slash"
 *          | "Bar"
 *          | "BackSlash"
 *          | "ExclamationMark"
 *          | "ExclamationMarkEqual"
 *          | "ExclamationMarkLessThan"
 *          | "ExclamationMarkMoreThan"
 *          | "StringLiteral"
 *          | "NumericLiteral"
 *          | "Identifier"
 *          | "Try"
 *          | "Fix"
 *          | "When"
 *          | "Else"
 *          | "Loop"
 *          | "With"
 *          | "Yes"
 *          | "No"
 *          | "Return"
 *          | "Exit"
 *          | "Skip"
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
 * @property {number} line The line number where this token appears
 */

/**
 * @typedef {"Error" | "Warning" | "Information"} DiagnosticType
 */

/**
 * @typedef {Object} Diagnostic
 * @property {DiagnosticType} type
 * @property {number} line
 * @property {string} message   
 */

/**
 * @typedef  {Object} Compiler Compiler state
 * @property {string} source
 * @property {Diagnostic[]} diagnostics
 * @property {boolean} isErrorTolerant
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
 */

/**
 * @typedef { "VariableAssignmentStatement"
 *          | "VariableDeclarationStatement"
 *          | "WhenStatement"
 *          | "LoopStatement"
 *          | "TryStatement"
 *          | "ExitStatement"
 *          | "StopStatement"
 *          | "SkipStatement"
 *          | "BlockStatement"
 *          | "ExpressionStatement" } StatementType
 */

/**
 * @typedef {Object} Statement
 * @property {StatementType} type
 */

