#!/usr/bin/env node

import { compile } from "../compiler/compiler.js"


/**
 * Reads a file from the disk and compiles it through the Utkrisht compiler.  
 * @param {string} path The relative system path to the `.uki` file.
 */
async function compileFile(path) {
    let source;
    try {
        source = readFileSync(path, "utf8");
    } catch (err) {
        console.error("Error reading file: ", err.message);
        process.exit(0);
    }

    const compiler = createCompiler(source);
    compile(compiler);
}



export async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.error("Usage node uki <input.uki>");
        process.exit(0);
    }

    await compileFile(args[0]);
}

