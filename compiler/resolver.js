
// Local imports
import "./utilities/types.js";
import { error } from "./utilities/logger.js";


export function createResolver(statements) {
    return {
        statements,
        currentFunction: "None",
        scopes: []
    }
}

function beginScope(resolver) {
    resolver.scopes.push(new Map());
}

function endScope(resolver) {
    resolver.scopes.pop();
}

function declare(compiler, resolver, token) {
    if (resolver.scopes.length === 0) return;

    const scope = resolver.scopes.at(-1);

    if (scope.has(token.lexeme)) {
        error(compiler, "Already a variable with this name in this scope.", token.line);
    } else {
        scope.set(token.lexeme, false);
    }
}

function define(resolver, token) {
    if (resolver.scopes.length === 0) return;

    resolver.scopes.at(-1)[token.lexeme] = true
}

function resolveLocal(compiler, resolver, expression, token) {
    for (let i = resolver.scopes.length - 1; i >= 0; i--) {
        if (scopes[i].has(token.lexeme)) {
            interpreter.resolve(expr, scopes.size() - 1 - i);
            return;
        }
    }
        if not(isNil(resolver.scopes[i])) and
             hasKey(resolver.scopes[i], name.lexeme):

            expr.hash = hashes2.hash(expr)

            resolve(lox, expr, hi - i)

            break
}

function resolveFunction(compiler, resolver, function: Function,
                                         kind: FunctionType) =
    ## Resolve the function’s body.
    let enclosingFunction = resolver.currentFunction

    resolver.currentFunction = kind

    beginScope(resolver, len(function.params))

    for param in function.params:
        declare(lox, resolver, param)

        define(resolver, param)

    resolve(lox, resolver, function.body)

    endScope(resolver)

    resolver.currentFunction = enclosingFunction


method resolve(expr: Expr, resolver, compiler) {.base.} =
    ## Base method that raises `CatchableError` exception when `expr` has not had
    ## its method implemented.
    raise newException(CatchableError, "Method without implementation override")

method resolve(expr: Variable, resolver, compiler) =
    ## Resolves a `Variable` expression. Reports an error if the variable is
    ## declared but not defined.
    if not(len(resolver.scopes) == 0) and not(isNil(resolver.scopes[^1])) and
         hasKey(resolver.scopes[^1], expr.name.lexeme) and
         (resolver.scopes[^1][expr.name.lexeme] == false):
        error(lox, expr.name, "Can't read local variable in its own initializer.")

    resolveLocal(lox, resolver, expr, expr.name)

method resolve(expr: Assign, resolver, compiler) =
    ## Resolves an `Assign` expression.
    resolve(expr.value, resolver, lox)

    resolveLocal(lox, resolver, expr, expr.name)

method resolve(expr: Binary, resolver, compiler) =
    ## Resolves a `Binary` expression.
    resolve(expr.left, resolver, lox)
    resolve(expr.right, resolver, lox)

method resolve(expr: Call, resolver, compiler) =
    ## Resolves a `Call` expression.
    resolve(expr.callee, resolver, lox)

    for argument in expr.arguments:
        resolve(argument, resolver, lox)

method resolve(expr: Get, resolver, compiler) =
    ## Resolves a `Get` expression.
    resolve(expr.obj, resolver, lox)

method resolve(expr: Grouping, resolver, compiler) =
    ## Resolves a `Grouping` expression.
    resolve(expr.expression, resolver, lox)

method resolve(expr: Literal, resolver, compiler) =
    ## Resolves a `Literal` expression.
    discard

method resolve(expr: Logical, resolver, compiler) =
    ## Resolves a `Logical` expression.
    resolve(expr.left, resolver, lox)
    resolve(expr.right, resolver, lox)

method resolve(expr: Set, resolver, compiler) =
    ## Resolves a `Set` expression.
    resolve(expr.value, resolver, lox)
    resolve(expr.obj, resolver, lox)

method resolve(expr: Super, resolver, compiler) =
    ## Resolves a `Super` expression. Reports error if "super" is used outside of
    ## a class or in a class with no superclass.
    if resolver.currentClass == ClassType.None:
        error(lox, expr.keyword, "Can't use 'super' outside of a class.")
    elif resolver.currentClass != ClassType.Subclass:
        error(lox, expr.keyword, "Can't use 'super' in a class with no superclass.")

    resolveLocal(lox, resolver, expr, expr.keyword)

method resolve(expr: This, resolver, compiler) =
    ## Resolves a `This` expression. Reports error if "this" is used outside of a
    ## class.
    if resolver.currentClass == ClassType.None:
        error(lox, expr.keyword, "Can't use 'this' outside of a class.")
    else:
        resolveLocal(lox, resolver, expr, expr.keyword)

method resolve(expr: Unary, resolver, compiler) =
    ## Resolves an `Unary` expression.
    resolve(expr.right, resolver, lox)

method resolve(stmt: Stmt, resolver, compiler) {.base.} =
    ## Base method that raises `CatchableError` exception when `stmt` has not had
    ## its method implemented.
    raise newException(CatchableError, "Method without implementation override")

method resolve(stmt: Block, resolver, compiler) =
    ## Resolves a `Block` statement.
    beginScope(resolver)

    resolve(lox, resolver, stmt.statements)

    endScope(resolver)

method resolve(stmt: Class, resolver, compiler) =
    ## Resolves a `Class` statement. Reports error if a class inherits itself.
    let enclosingClass = resolver.currentClass

    resolver.currentClass = ClassType.Class

    declare(lox, resolver, stmt.name)

    define(resolver, stmt.name)

    let notIsNilStmtSuperclass = not isNil(stmt.superclass)

    if notIsNilStmtSuperclass:
        if stmt.name.lexeme == stmt.superclass.name.lexeme:
            error(lox, stmt.superclass.name, "A class can't inherit from itself.")

        resolver.currentClass = ClassType.Subclass

        resolve(stmt.superclass, resolver, lox)

        beginScope(resolver, 1)

        resolver.scopes[^1][newStringWithHash("super")] = true

    beginScope(resolver, 1)

    resolver.scopes[^1][newStringWithHash("this")] = true

    for `method` in stmt.methods:
        var declaration = FunctionType.Method

        if `method`.name.lexeme.data == "init":
            declaration = FunctionType.Initializer

        resolveFunction(lox, resolver, `method`, declaration)

    endScope(resolver)

    if notIsNilStmtSuperclass:
        endScope(resolver)

    resolver.currentClass = enclosingClass

method resolve(stmt: Var, resolver, compiler) =
    ## Resolves a `Var` statement.
    declare(lox, resolver, stmt.name)

    if not isNil(stmt.initializer):
        resolve(stmt.initializer, resolver, lox)

    define(resolver, stmt.name)

method resolve(stmt: Function, resolver, compiler) =
    ## Resolves a `Function` statement.
    declare(lox, resolver, stmt.name)

    define(resolver, stmt.name)

    resolveFunction(lox, resolver, stmt, FunctionType.Function)

method resolve(stmt: Expression, resolver, compiler) =
    ## Resolves an `Expression` statement.
    resolve(stmt.expression, resolver, lox)

method resolve(stmt: If, resolver, compiler) =
    ## Resolves an `If` statement.
    resolve(stmt.condition, resolver, lox)
    resolve(stmt.thenBranch, resolver, lox)

    if not isNil(stmt.elseBranch):
        resolve(stmt.elseBranch, resolver, lox)

method resolve(stmt: Print, resolver, compiler) =
    ## Resolves a `Print` statement.
    resolve(stmt.expression, resolver, lox)

method resolve(stmt: types.Return, resolver, compiler) =
    ## Resolves a `Return` statement. Reports an error if "return" is called from
    ## top-level code or tries to return a value from an initializer.
    if resolver.currentFunction == FunctionType.None:
        error(lox, stmt.keyword, "Can't return from top-level code.")

    if not isNil(stmt.value):
        if resolver.currentFunction == FunctionType.Initializer:
            error(lox, stmt.keyword, "Can't return a value from an initializer.")

        resolve(stmt.value, resolver, lox)

method resolve(stmt: While, resolver, compiler) =
    ## Resolves a `While` statement.
    resolve(stmt.condition, resolver, lox)
    resolve(stmt.body, resolver, lox)



export function resolve(compiler, resolver) {
    const statements = resolver.statements;

    for (const statement of statements) {
        resolveStatement(compiler, resolver, statement)
    }
}
