#!/usr/bin/env node

import { interpret } from "../compiler/compiler.js"



export async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.error("Usage node uki <input.uki>");
        process.exit(0);
    }

    await interpret(args[0]);
}

if (import.meta.main) {
    main();
}

