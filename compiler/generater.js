

export function createExecutor() {
    return {
        globals: []
    }
}

class RuntimeError extends Error {
    constructor(token, message) {
        this.message = message;
        this.token = token;
        this.parent = undefined;
    }
}

function evaluateUnaryExpression(interpreter, expression) {

}

function evaluateExpressionStatement(interpreter, expression) {
    if (expression.type === "Unary") {
        evaluateUnaryExpression(interpreter, expression);
    } else if (expression.type === "Unary") {

    } else if (expression.type === "Unary") {

    } else if (expression.type === "Unary") {

    } else if (expression.type === "Unary") {

    } else if (expression.type === "Unary") {

    } else {
        throw new Error("This statement has not been implemented");
    }
}

function evaluate(interpreter, statement) {
    if (statement.type === "ExpressionStatement") {
        evaluateExpressionStatement(interpreter, statement.expression);
    }
}



function execute(executor) {
    try {
        for (const statement of interpreter.statements) {
            evaluate(interpreter, statement);
        }
    } catch (error) {
        if (error instanceof RuntimeError) {

        } else {
            throw error
        }
    }
}