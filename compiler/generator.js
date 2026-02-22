import "./utilities/types.js"

export function createGenerator(javascriptStatements) {
    return {
        javascriptStatements,
        indentLevel: 0
    }
}

function generateExpression(generator, expression) {
    if (expression.type === "LiteralExpression") {
        if (expression.value.type === "BooleanLiteral") {

        } else if (expression.value.type === "StringLiteral") {
            
        } else if (expression.value.type === "NumericLiteral") {
            
        } else {
            throw new Error("Unknown Literal type")
        }
    } else if (expression.type === "BinaryExpression") {

    }
}

function generateStatement(generator, statement) {
    if (statement.type === "ExpressionStatement") {
        return generateExpression(generator, statement.expression);
    }
}


export function generate(generator) {
    const output = []

    for (const statement of generator.javascriptStatements) {
        output.push(generateStatement(generator, statement));
    }

    return output
}

