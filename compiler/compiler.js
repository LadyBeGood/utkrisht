
// Local imports
import "./types.js"
import { createLexer, lex } from "./lexer.js";
import { createParser, parse } from "./parser.js";
import { createResolver, resolve } from "./resolver.js";
import { createExecutor, interpret } from "./executor.js";


/**
 * Creates an `Compiler` object
 * @returns {Interpreter}
 */
export function createInterpreter(source, logErrors = true) {
    return {
        source,
        compileTimeErrors: [],
        runTimeErrors: [],
    };
}



/**
 * Compiles an utkrisht file and its imports.
 * @param {Interpreter} interpreter Compiler state
 */
export async function interpret(interpreter) {

    /* Lexical Analysis */
    const lexer = createLexer(source);
    const tokens = lex(interpreter, lexer);

    /* Parsing */
    const parser = createParser(tokens);
    const statements = parse(interpreter, parser, moduleMode);

    /* Resolving */
    const resolver = createResolver(statements);
    resolve(resolver);

    /* Interpreting */
    const executor = createExecutor(statements);
    execute(executor);

}



