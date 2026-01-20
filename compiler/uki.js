import { readFileSync } from "node:fs";
import { error } from "logger.js";
import { createLexer, lex } from "lexer.js";
import { createParser, parse } from "parser.js";

export function createUki() {
    return {
        hadError: false
    };
}


function run(utkrisht, source) {
    const lexer = createLexer(source);
    const tokens = lex(utkrisht, lexer);

    const parser = createParser(tokens);
    const statements = parse(utkrisht, parser);

    console.log(statements);
}


function runFile(path) {
    let data;
    try {
        data = readFileSync(path, "utf8");
    } catch (err) {
        console.error("Error reading file: ", err.message);
        process.exit(0);
    }

    const uki = createUki();

    run(uki, data)
}

export function main() {
    const args = process.argv.slice(2);

    if (args.length > 1) {
        console.error("Usage node uki <input.uki>")
        process.exit(0);
    }

    runFile(args[0]);
}

main();
