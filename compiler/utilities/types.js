


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
 *          | "Right"
 *          | "Wrong"
 *          | "Exit"
 *          | "Stop"
 *          | "Skip"
 *          | "Indent"
 *          | "Dedent"
 *          | "NewLine"
 *          | "EndOfFile" } TokenType
 */

/**
 * @typedef {Object } Token
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
 * @prop {DiagnosticType} type
 * @prop {number} line
 * @prop {string} message   
 */

/**
 * @typedef  {Object} Compiler Compiler state
 * @prop {string} source
 * @prop {Diagnostic[]} diagnostics
 * @prop {boolean} isErrorTolerant
 */


/**
 * @typedef  {Object} Lexer Lexer state
 * @prop {string} source The source code of the utkrisht file
 * @prop {number} position The index of the current character in the source
 * @prop {number} line Current line number inside the source
 * @prop {number} indentWidth  Number of spaces required for a single level of indentation. Determined while lexing the source.
 * @prop {number} nestingDepth Used to emit the correct number of Dedent tokens when returning to outer scopes.
 */


/**
 * @typedef {Object} Parser Parser state
 * 
 */
