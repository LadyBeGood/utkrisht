
// Local imports
import "./utilities/types.js"
import { createLexer, lex } from "./lexer.js";
import { createParser, parse } from "./parser.js";
// import { createResolver, resolve } from "./resolver.js";
import { createAnalyser, analyse } from "./analyser.js"
// import { createTransformer, transform } from "./transformer.js"
// import { createGenerator, generate } from "./generator.js";
import { EndProgram } from "./utilities/logger.js"

/**
 * Creates an `Compiler` object
 * @returns {Compiler} Compiler state
 */
export function createCompiler(source, isErrorTolerant = false) {
    return {
        source,
        diagnostics: [],
        isErrorTolerant,
    };
}


/**
 * Compiles utkrisht code into javascript code.
 * @param {Compiler} compiler Compiler state
 */
export function compile(compiler) {
    try {
        const input = compiler.source;

        /* Lexing */
        const lexer = createLexer(input);
        const tokens = lex(compiler, lexer);

        /* Parsing */
        const parser = createParser(tokens);
        const statements = parse(compiler, parser);

        /* Resolving */
        const resolver = createResolver(statements);
        resolve(compiler, resolver);

        /* Analysing */
        const analyser = createAnalyser(statements);
        analyse(compiler, analyser);

        /* Transforming */
        const transformer = createTransformer(statements);
        const javascriptStatements = transform(compiler, transformer);

        /* Generating */
        const generator = createGenerator(javascriptStatements);
        const output = generate(compiler, generator);

        return output;
    } catch (error) {
        if (error instanceof EndProgram) {
            // No operations
            console.log(error)
        } else {
            // rethrow it if it is a different error
            throw error
        }
    }
}



