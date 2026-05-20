
// Local imports
import "./utilities/types.js";
import { error } from "./utilities/logger.js";


export function createResolver(statements) {
    return {
        statements,
        currentFunction: undefined,
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





method resolve(stmt: Function, resolver, compiler) =
    ## Resolves a `Function` statement.
    declare(lox, resolver, stmt.name)

    define(resolver, stmt.name)

    resolveFunction(lox, resolver, stmt, FunctionType.Function)



function resolveExpression(compiler, resolver, expression) {
    switch (expression.type) {
        case "BinaryExpression":
            resolveExpression(compiler, resolver, expression.left)
            resolveExpression(compiler, resolver, expression.right)

            break;
        case "UnaryExpression":
            resolveExpression(compiler, resolver, expression.right)

            break;
        case "GroupingExpression":
            resolveExpression(compiler, resolver, expression.expression)

            break;
        case "LiteralExpression":
            // Eat 5 star, do nothing

            break;
        case "CallExpression":
            resolve(compiler, resolver, expression.callee)

            for (const argument of expression.arguments) {
                resolve(compiler, resolver, argument.value)
            }

            break;
        case "VariableExpression":
            if (
                resolver.scopes.length !== 0 && 
                resolver.scopes.at(-1) !== undefined && 
                resolver.scopes.at(-1).has(expression.name.lexeme) && 
                resolver.scopes.at(-1).get(expression.name.lexeme) === false
            ) {
                error(compiler, expression.name, "Can't read local variable in its own initializer.");
            }

            resolveLocal(compiler, resolver, expression.name);

            break;
        
        default:
            throw new Error("Broooo")
    }
}


function resolveStatement(compiler, resolver, statement) {
    switch (statement.type) {
        case "BlockStatement":
            // Resolves a `Block` statement.
            beginScope(resolver)

            for (const _statement of statement.statements) {
                resolveStatement(compiler, resolver, _statement);
            }

            endScope(resolver)

            break;
        case "VariableDeclaration":
            declare(compiler, resolver, statement.name);
            define(resolver, statement.name);

            resolveExpression(compiler, resolver, statement.value)

            break;
        case "VariableAssignment":
            resolveExpression(compiler, resolver, statement.value)
            resolveLocal(compiler, resolver, statement.name)

            break;
        case "ExpressionStatement":
            resolveExpression(compiler, resolver, statement.expression);

            break;
        case "WhenStatement":
            for (const whenClause of statement.whenClauses) {
                resolveExpression(compiler, resolver, whenClause.condition);
            }

            break;
        case "ExitStatement":
            if (resolver.currentFunction === undefined) {
                error(compiler, statement.keyword, "Exit statement is not inside a function")
            }

            if (statement.value) {
                resolveExpression(compiler, resolver, statement.value);
            }

            break;
        default:
            throw new Error("huh?")
    }
}

export function resolve(compiler, resolver) {
    const statements = resolver.statements;

    for (const statement of statements) {
        resolveStatement(compiler, resolver, statement);
    }
}
