
import "./types.js"
import { createLexer, lex } from "./lexer.js";
import { createParser, parse } from "./parser.js";
import { readFileSync } from "node:fs"


/**
 * Creates an `Compiler` object
 * @returns {Compiler}
 */
export function createCompiler(path, logErrors = true, moduleMode = true) {
    return {
        paths: [path],
        errors: [],
        logErrors,
        moduleMode,
        isModule: false,
    };
}



/**
 * Compiles an utkrisht file and its imports.
 * @param {Compiler} compiler Compiler state
 */
export async function compile(compiler) {
    /* =================== *\
    |*       Input         *|
    \* =================== */
    
    let source;
    try {
        source = readFileSync(compiler.paths.at(-1), "utf8");
    } catch (err) {
        console.error("Error reading file: ", err.message);
        process.exit(0);
    }

    /* =================== *\
    |*     Processing      *|
    \* =================== */

    /* Lexical Analysis */
    const lexer = createLexer(source);
    const tokens = lex(compiler, lexer);

    /* Parsing */
    const parser = createParser(tokens);
    const abstractSyntaxTree = parse(compiler, parser, moduleMode);

    if (abstractSyntaxTree.imports !== undefined) {
        compiler.isModule = true;
        
        for (const _import of abstractSyntaxTree.imports) {
            compiler.paths.push(_import.path);

            const moduleAbstractSyntaxTree = compile(compiler);
            abstractSyntaxTree.modules.push(moduleAbstractSyntaxTree);

            compiler.paths.pop();
        }

        compiler.isModule = false;
    }

    if (abstractSyntaxTree.type === "Module") {
        return abstractSyntaxTree;
    }

    /* Resolving */


    /* Semantic Analysis */


    /* Transforming */


    /* Generation */


    /* =================== *\
    |*       Output        *|
    \* =================== */
    

}



