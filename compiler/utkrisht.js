#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { createLexer, lex } from "./lexer.js";
import { createParser, parse } from "./parser.js";

export function createUtkrisht() {
    return {
        hadError: false
    };
}


function run(utkrisht, source) {
    const lexer = createLexer(source);
    const tokens = lex(utkrisht, lexer);

    console.log(JSON.stringify(tokens, null, 4))
    if (utkrisht.hadError) {
        return;
    }
    // const parser = createParser(tokens);
    // const statements = parse(utkrisht, parser);

    // console.log(JSON.stringify(statements, null, 4));
}


function runFile(path) {
    let data;
    try {
        data = readFileSync(path, "utf8");
    } catch (err) {
        console.error("Error reading file: ", err.message);
        process.exit(0);
    }

    const utkrisht = createUtkrisht();

    run(utkrisht, data);
}

export function main() {
    const args = process.argv.slice(2);

    if (args.length > 1) {
        console.error("Usage node uki <input.uki>");
        process.exit(0);
    }

    runFile(args[0]);
}

main();

