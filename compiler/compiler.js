#!/usr/bin/env bun

import "./types.js"
import { createLexer, lex } from "./lexer.js";
import { createParser, parse } from "./parser.js";



/**
 * Creates an `Compiler` object
 * @returns {Compiler}
 */
export function createCompiler(logError = true) {
    return {
        errors: [],
        logError,
    };
}



/**
 * Compile the utkrisht file
 * @param {Compiler} compiler Compiler state
 * @param {string} source The source code of the utkrisht file
 */
function compile(compiler, source) {
    const lexer = createLexer(source);
    const tokens = lex(compiler, lexer);

    console.log(JSON.stringify(tokens, null, 4))
    if (compiler.hadError) {
        return;
    }
    // const parser = createParser(tokens);
    // const statements = parse(utkrisht, parser);

    // console.log(JSON.stringify(statements, null, 4));
}



/**
 * Reads a file from the disk and compiles it through the Utkrisht compiler.  
 * @param {string} path The relative system path to the `.uki` file.
 */
async function compileFile(path) {
    const file = Bun.file(path);

    // Check if file exists using Bun API
    if (!(await file.exists())) {
        console.error(`Error: File not found at "${path}"`);
        Bun.exit(1);
    }

    let source;
    try {
        source = await file.text();
    } catch (err) {
        console.error("Error reading file: ", err.message);
        Bun.exit(0);
    }

    const compiler = createCompiler();

    compile(compiler, source);
}



export async function main() {
    const args = Bun.argv.slice(2);

    if (args.length !== 1) {
        console.error("Usage node uki <input.uki>");
        Bun.exit(0);
    }

    await compileFile(args[0]);
}

if (import.meta.main) {
    main()
}


export function _utkrisht() {

}