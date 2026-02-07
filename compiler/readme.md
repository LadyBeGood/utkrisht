


# Compiler Internals

Utkrisht compiler is written in a procedural style and avoids OOP. Compiler stages are implemented as big top-level functions, each containing relevant smaller helper functions.

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

| File | Description |
| :--- | :--- |
| `uki.nim` | Entry point. Serves as a command-line interface. |
| `types.nim` | Contains all type declarations:<br>• `TokenKind`, `Token`<br>• `Literal`s, `Expression`s, `Statement`s<br>• `DataTypes`, `Context`<br>• `JavaScriptLiteral`s, `JavascriptExpression`s, `JavascriptStatement`s |
| `error.nim` | Basic error functionality (echoes error and quits immediately).<br><br>ℹ️ **Note:** Error-tolerant compilation was tried and discarded due to misleading cascading errors and recovery complexity. |
| `lexer.nim` | Lexical analysis. Reports basic syntax errors like invalid characters or bad indentation. |
| `parser.nim` | Recursive descent with Pratt parsing.<br><br>⚠️ **Warning:** Needs revision as some expression syntax has changed. |
| `analyser.nim` | Semantic analysis. The "poster-girl" stage. Handles everything from binding (no hoisting, but supports cyclic imports) to enigma type checking. |
| `transformer.nim` | Transforms Uki AST to JS AST. Targets unspecified ECMAScript specification. |
| `generator.nim` | Contains 4 functions:<br>1. `generator` (exported)<br>2. `tokenGenerator` (internal)<br>3. `tokensGenerator` (exported)<br>4. `abstractSyntaxTreeGenerator` (exported) |

---

## Compiler Pipelines

```text
                                                                                                                ┌────────────────┐
                       ┌────────────────────────────────────────────────────────────────────────────────────────│ tokenGenerator ├──> .js
                       │                                                                                        └────────────────┘
                       │                                                                                  ┌─────────────────────────────┐
                       │                               ┌───────────────────────────────────┬──────────────┤ abstractSyntaxTreeGenerator ├──> .js
                       │                               │                                   │              └─────────────────────────────┘
        ┌───────┐      ^       ┌────────┐              ^           ┌──────────┐            ^              ┌─────────────┐                    ┌───────────┐
.uki >──┤ lexer ├──> tokens >──┤ parser ├──> abstractSyntaxTree >──┤ analyser ├──> abstractSyntaxTree >──┤ transformer ├──> jsAbstractAST >──┤ generator ├──> .js
        └───────┘              └────────┘                          └──────────┘   (with narrowed types)   └─────────────┘                    └───────────┘

```

### Main Compiler Pipeline

It consists of 5 main stages:

```text
        ┌───────┐              ┌────────┐                          ┌──────────┐                           ┌─────────────┐                    ┌───────────┐
.uki >──┤ lexer ├──> tokens >──┤ parser ├──> abstractSyntaxTree >──┤ analyser ├──> abstractSyntaxTree >──┤ transformer ├──> jsAbstractAST >──┤ generator ├──> .js
        └───────┘              └────────┘                          └──────────┘   (with narrowed types)   └─────────────┘                    └───────────┘

```

> [!NOTE]
> Alternate compiler pipelines (below) are meant for debugging. Their output is represented in a JSON-like form and emitted inside `.js` files to enable code folding by editors.

### Token Compiler Pipeline

```text
        ┌───────┐              ┌────────────────┐ 
.uki >──┤ lexer ├──> tokens >──┤ tokenGenerator ├──> .js
        └───────┘              └────────────────┘

```

### Abstract Syntax Tree Compiler Pipeline

```text
        ┌───────┐              ┌────────┐                          ┌─────────────────────────────┐
.uki >──┤ lexer ├──> tokens >──┤ parser ├──> abstractSyntaxTree >──┤ abstractSyntaxTreeGenerator ├──> .js
        └───────┘              └────────┘                          └─────────────────────────────┘

```

### Analysed Abstract Syntax Tree Compiler Pipeline

```text
        ┌───────┐              ┌────────┐                          ┌──────────┐                           ┌─────────────────────────────┐
.uki >──┤ lexer ├──> tokens >──┤ parser ├──> abstractSyntaxTree >──┤ analyser ├──> abstractSyntaxTree >──┤ abstractSyntaxTreeGenerator ├──> .js
        └───────┘              └────────┘                          └──────────┘   (with narrowed types)   └─────────────────────────────┘

```

> [!INFO]
> There is no Javascript AST compiler pipeline because the `generator` creates a 1:1 representation of the Javascript AST anyway.


