
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
 * @param {*} utkrisht 
 * @param {*} resolver 
 */
function declare(utkrisht, resolver, name) {
    if (resolver.scope.length > 0) {

    }
}

function resolveExpression() {
    
}


function resolveStatement() {

}

export function resolve(utkrisht, resolver, statements) {
    for (const statement of statements) {
        resolveStatement(utkrisht, resolver, statement);
    }
}


