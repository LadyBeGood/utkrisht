import lexer, parser, analyser, transformer, generators
import os, osproc, strutils, sequtils

proc tokensCompiler(input: string): string =
    tokensGenerator lexer input

proc abstractSyntaxTreeCompiler(input: string): string =
    abstractSyntaxTreeGenerator parser lexer input

proc javascriptCompiler(input: string): string =
    generator transformer analyser parser lexer input


proc main() =
    let args = commandLineParams()
    if args.len == 0:
        quit "Usage: uki <input> [output] [--tokens|--ast|--run]"

    let inputPath = args[0].absolutePath()
    if not fileExists(inputPath):
        quit "Error: File not found: " & inputPath

    let outputPath =
        if args.len >= 2 and not args[1].startsWith("--"):
            args[1].absolutePath()
        else:
            inputPath.changeFileExt("js")

    let input = readFile(inputPath)
    let mode = args.filterIt(it.startsWith("--"))
    let output =
        if "--tokens" in mode: tokensCompiler(input)
        elif "--ast" in mode: abstractSyntaxTreeCompiler(input)
        else: javascriptCompiler(input)

    if "--run" in mode:
        let tmp = "uki_temp_run.js"
        writeFile(tmp, output)
        discard execProcess("node " & tmp)
    else:
        writeFile(outputPath, output)

main()




