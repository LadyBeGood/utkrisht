import "./types.js";

export function styledLog(type, message, line) {
    const red = "\x1b[31m";
    const reset = "\x1b[0m";

    switch (type) {
        case "Error":
            console.error("Error: " + data)
            break;
        case "Warning":
            console.warn("Warning: " + data)
            break;
        case "Information":
            console.info("Information: " + data)
            break;
        default:
            throw new Error("Unknown error type");
    }

    throw new End();
}

/**
 * Reports errors to the console.
 * @param {Compiler} interpreter Compiler state
 * @param {string} message The error message.
 * @param {number} line Error location.
 * @returns {void}
 */
export function compileTimeError(interpreter, message, line) {
    if (interpreter.emitError) {
        styledLog("Error", message, line)
    } else {
        interpreter.errors.push({ line, message })
    }
}

/**
 * 
 * @param {Compiler} interpreter Compiler state
 * @param {RuntimeError} error 
 */
export function runTimeError(interpreter, error) {
    const line = error.token.line;
    const message = error.message;

    if (interpreter.emitError) {
        styledLog("Error", message, line)
    } else {
        interpreter.errors.push({ line, message })
    }
}



