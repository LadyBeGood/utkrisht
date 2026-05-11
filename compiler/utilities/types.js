

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
 * @typedef  {Object } Compiler Compiler state
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
 * 
 */
