

export function createTransformer(abstractSyntaxTree) {
    return {
        statements: abstractSyntaxTree.body
    }
}



function transformExpression(transformer, expression) {
    if (expression.type === "BinaryExpression") {

    } else if (expression.type === "UnaryExpression") {

    } else if (expression.type === "LiteralExpression") {

    }
}

function transformStatement(transformer, statement) {
    if (statement.type === "ExpressionStatement") {

    } else if (statement.type === "WhenStatement") {

    } else if (statement.type === "LoopStatement") {

    }
}



export function transform(transformer) {
    const javascriptAbstractSyntaxTree = [];

    for (const statement of transformer.statements) {
        javascriptAbstractSyntaxTree.push(transformStatement(transformer, statement));
    }

    return javascriptAbstractSyntaxTree;
}

