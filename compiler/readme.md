


# Compiler Internals

Utkrisht compiler is written in a procedural style and avoids OOP.

> [!IMPORTANT]
> **Status: Under Development**
> This guide lists both current and upcoming features. So far, only these are complete:
> - Lexical analysis
> - Parsing
> - Token generation
> - Abstract syntax tree generation

---

## Files

The compiler is located at the `compiler` folder in the root directory of the GitHub repo.

| File              | Description                                                                                                                                                                                                   |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `compiler.nim`    | Entry point.                                                                                                                                                                                                  |
| `lexer.nim`       | Lexical analysis. Reports basic syntax errors like invalid characters or bad indentation.                                                                                                                     |
| `parser.nim`      | Recursive descent with Pratt parsing.<br><br>**Warning:** Needs revision as some expression syntax has changed.                                                                                               |
| `analyser.nim`    | Semantic analysis. The "poster-girl" stage. Handles everything from binding (no hoisting, but supports cyclic imports) to enigma type checking.                                                               |
| `transformer.nim` | Transforms Uki AST to JS AST. Targets unspecified ECMAScript specification.                                                                                                                                   |
| `generater.nim`   | Contains 4 functions:<br>1. `generator` (exported)<br>2. `tokenGenerator` (internal)<br>3. `tokensGenerator` (exported)<br>4. `abstractSyntaxTreeGenerator` (exported)                                        |

---

## Compiler Pipelines



```text

         +-------+                +--------+                                                    +-------------+                                         +-----------+
.uki >---| lexer |---> tokens >---| parser |---> abstract syntax tree >---+------>------+--->---| transformer |---> javascript abstract syntax tree >---| generator |---> .js
         +-------+                +--------+                              |             |       +-------------+                                         +-----------+
                                                                          |             |
                                                                          v             v
                                                                    +----------+   +----------+
                                                                    | resolver |   | analyser |
                                                                    +----------+   +----------+

```
