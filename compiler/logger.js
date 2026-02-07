import "./types.js";

/**
 * Reports a syntax or runtime error to the console.
 * @param {Compiler} compiler Compiler state
 * @param {string} message The error message.
 * @param {number} line Error location.
 * @returns {void}
 */
export function error(compiler, message, line) {
    if (compiler.emitError) {
        const red = "\x1b[31m";
        const reset = "\x1b[0m";
        console.error(`${red}Error on line ${line}${reset}: ${message}`)
    }

    compiler.errors.push({ line, message })
    compiler.hadError = true;
}





