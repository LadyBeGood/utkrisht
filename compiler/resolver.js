
/**
 * Creates and returns a `Resolver` object.
 */
export function createResolver() {
    return {
        scopes: []
    }
}



function beginScope(resolver) {
    resolver.scopes.push(undefined);
}

function endScope(resolver) {
    resolver.scopes.pop();
}

/**
 * Declares the name variable `name` in the outermost scope of `resolver`. If
 * the same variable is declared in the same scope, an error will be reported.
 * @param {*} compiler 
 * @param {*} resolver 
 */
function declare(compiler, resolver, name) {
    if (resolver.scope.length > 0) {

    }
}

function resolveExpression() {
    
}


function resolveStatement() {

}

export function resolve(compiler, resolver, statements) {
    for (const statement of statements) {
        resolveStatement(compiler, resolver, statement);
    }
}


