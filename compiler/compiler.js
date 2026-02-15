
// Local imports
import "./utilities/types.js"
import { createLexer, lex } from "./lexer.js";
import { createParser, parse } from "./parser.js";
import { createResolver, resolve } from "./resolver.js";
import { createAnalyser, analyse } from "./analyser.js"
import { createTransformer, transform } from "./transformer.js"
import { createGenerater, generate } from "./generater.js";


/**
 * Creates an `Compiler` object
 * @returns {Compiler}
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
 * @param {Compiler} compiler Compiler state
 */
export function compile(compiler) {

    /* Lexical Analysis */
    const lexer = createLexer(source);
    const tokens = lex(compiler, lexer);

    /* Parsing */
    const parser = createParser(tokens);
    const statements = parse(compiler, parser, moduleMode);

    /* Resolving */
    const resolver = createResolver(statements);
    resolve(resolver);

    /* Interpreting */
    const executor = createExecutor(statements);
    execute(executor);

}



