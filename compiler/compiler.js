// Local imports
import "./utilities/types.js"
import { createLexer, lex } from "./lexer.js";
import { createParser, parse } from "./parser.js";
// import { createChecker, checker } from "./checker.js";
// import { createTransformer, transform } from "./transformer.js"
// import { createGenerator, generate } from "./generator.js";
import { EndProgram } from "./utilities/logger.js"

/**
 * Creates an `Compiler` object
 * @param {string} source 
 * @param {*} [logger=console]
 * @returns {Compiler} Compiler state
 */
export function createCompiler(source, logger = console) {
    return {
        source,
        logger,
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

        // /* Resolving */
        // const resolver = createResolver(statements);
        // resolve(compiler, resolver);

        // /* Analysing */
        // const analyser = createAnalyser(statements);
        // analyse(compiler, analyser);

        // /* Transforming */
        // const transformer = createTransformer(statements);
        // const javascriptStatements = transform(compiler, transformer);

        // /* Generating */
        // const generator = createGenerator(javascriptStatements);
        // const output = generate(compiler, generator);

        return { tokens, statements };
    } catch (error) {
        if (error instanceof EndProgram) {
            // No operations
            return {tokens: [], statements: []}
        } else {
            // rethrow it if it is a different error
            throw error
        }
    }
}


const compiler = createCompiler(`
# statement level
# aaa
# aaa bbb
# aaa 10
# aaa "hi"
# aaa bbb, ccc
# aaa bbb, "hi", 10
# 
# aaa bbb: ccc
# aaa bbb: ccc, ddd: eee
# aaa bbb: 10, ccc: "hi"
# aaa 10, bbb: "hi"
# 
# aaa()
# aaa bbb()
# aaa bbb ccc
# aaa bbb ccc, ddd
# aaa (bbb ccc), ddd
# 
# aaa 10 + 20
# 
# # expressions
# (aaa)
# (aaa bbb)
# (aaa 10)
# (aaa "hi")
# (aaa bbb, ccc)
# (aaa bbb, "hi", 10)
# 
# (aaa bbb: ccc)
# (aaa bbb: ccc, ddd: eee)
# (aaa bbb: 10, ccc: "hi")
# (aaa 10, bbb: "hi")
# 
# (aaa())
# (aaa bbb())
# (aaa bbb, ccc)
# (aaa bbb ccc)
# (aaa bbb ccc, ddd)
# (aaa (bbb ccc), ddd)
# 
# (aaa (10 + 20))

# aaa = 10
# (aaa = 10)
# aaa bbb, ccc = 0
# aaa bbb < 10
# aaa bbb = 10
aaa = 10
`)

const { tokens, statements } = compile(compiler);


console.log(JSON.stringify(tokens, null, 4))
console.log(JSON.stringify(statements, null, 4))

