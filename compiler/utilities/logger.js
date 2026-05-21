import "./types.js";

/**
 * Browser Javascript does not have any function equivalent to nodejs' `process.exit()`.
 * Hence we try to mimic that behaviour by throwing an object of this class and catching it.
 */
export class EndProgram {
    constructor(code = 0) {
        this.code = code // This code might be helpful in the future
    }
}


/**
 * @param {Compiler} compiler 
 * @param {DiagnosticType} type 
 * @param {string} message 
 * @param {number} line 
 * @returns {void}
 */
export function styledLog(compiler, type, message, line) {
    const red = "\x1b[31m";
    const reset = "\x1b[0m";

    switch (type) {
        case "Error":
            compiler.logger.error("Error: " + message)
            break;
        case "Warning":
            compiler.logger.warn("Warning: " + message)
            break;
        case "Information":
            compiler.logger.info("Information: " + message)
            break;
        default:
            throw new Error("Unknown error type");
    }
}

/**
 * Reports errors to the console or stores it inside `compiler.diagnostics`
 * @param {Compiler} compiler Compiler state
 * @param {string} message The error message.
 * @param {number} line Error location.
 * @returns {never}
 */
export function error(compiler, message, line) {
    styledLog(compiler, "Error", message, line);
    throw new EndProgram();
}

/**
 * Reports warnings to the console or stores it inside `compiler.diagnostics`
 * @param {Compiler} compiler Compiler state
 * @param {string} message The error message.
 * @param {number} line Error location.
 * @returns {void}
 */
export function warn(compiler, message, line) {
    styledLog(compiler, "Warning", message, line)
}

/**
 * Reports information to the console or stores it inside `compiler.diagnostics`
 * @param {Compiler} compiler Compiler state
 * @param {string} message The error message.
 * @param {number} line Error location.
 * @returns {void}
 */
export function info(compiler, message, line) {
    styledLog(compiler, "Information", message, line)
}

