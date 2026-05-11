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
 * 
 * @param {DiagnosticType} type 
 * @param {string} message 
 * @param {number} line 
 */
export function styledLog(type, message, line) {
    const red = "\x1b[31m";
    const reset = "\x1b[0m";

    switch (type) {
        case "Error":
            console.error("Error: " + message)
            break;
        case "Warning":
            console.warn("Warning: " + message)
            break;
        case "Information":
            console.info("Information: " + message)
            break;
        default:
            throw new Error("Unknown error type");
    }

    throw new EndProgram()
}

/**
 * Reports errors to the console or stores it inside `compiler.diagnostics`
 * @param {Compiler} compiler Compiler state
 * @param {string} message The error message.
 * @param {number} line Error location.
 * @returns {void}
 */
export function error(compiler, message, line) {
    compiler.diagnostics.push({ type: "Error", line, message })

    if (!compiler.isErrorTolerant) {
        styledLog("Error", message, line)
    }
}

/**
 * Reports warnings to the console or stores it inside `compiler.diagnostics`
 * @param {Compiler} compiler Compiler state
 * @param {string} message The error message.
 * @param {number} line Error location.
 * @returns {void}
 */
export function warn(compiler, message, line) {
    compiler.diagnostics.push({ type: "Warning", line, message })

    if (!compiler.isErrorTolerant) {
        styledLog("Warning", message, line)
    }
}

/**
 * Reports information to the console or stores it inside `compiler.diagnostics`
 * @param {Compiler} compiler Compiler state
 * @param {string} message The error message.
 * @param {number} line Error location.
 * @returns {void}
 */
export function info(compiler, message, line) {
    compiler.diagnostics.push({ type: "Information", line, message })

    if (!compiler.isErrorTolerant) {
        styledLog("Information", message, line)
    }
}

