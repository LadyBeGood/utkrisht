Statement [
    ContainerAssignmentStatement {
        identifier: Token {
            kind: Identifier
            lexeme: "name"
            line: 1
        }
        parameters: Token []
        expression: LiteralExpression {
            value: StringLiteral {
                value: "hello world"
            }
        }
    }
    ExpressionStatement {
        expression: ContainerExpression {
            identifier: Token {
                kind: Identifier
                lexeme: "write"
                line: 2
            }
            arguments: Argument [
                Argument {
                    nil
                    ContainerExpression {
                        identifier: Token {
                            kind: Identifier
                            lexeme: "name"
                            line: 2
                        }
                        arguments: Expression []
                    }
                }
            ]
        }
    }
]