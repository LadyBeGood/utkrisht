import strutils, types


proc generator*(abstractSyntaxTree: seq[Statement]): string =
    var output = ""
    #[
    proc expressionGenerator(expression: Expression): JavaScriptExpression =
        if expression of ContainerExpression:
            let expression = ContainerExpression(expression)
            

        elif expression of WhenExpression:
            let expression = WhenExpression(expression)
            

        elif expression of LoopExpression:
            let expression = LoopExpression(expression)
            

        elif expression of TryExpression:
            let expression = TryExpression(expression)
            

        elif expression of BlockExpression:
            let expression = BlockExpression(expression)
            

        elif expression of LiteralExpression:
            let expression = LiteralExpression(expression)
            
            if expression.value of BooleanLiteral:
                let val = BooleanLiteral(expression.value)
                
                
            elif expression.value of StringLiteral:
                let val = StringLiteral(expression.value)
                
                
            elif expression.value of NumericLiteral:
                let val = NumericLiteral(expression.value)
                
            
            

        elif expression of GroupingExpression:
            let expression = GroupingExpression(expression)
            

        elif expression of UnaryExpression:
            let expression = UnaryExpression(expression)
            

        elif expression of RangeExpression:
            let expression = RangeExpression(expression)
            

        elif expression of BinaryExpression:
            let expression = BinaryExpression(expression)
            


    proc statementGenerator(statement: Statement): JavaScriptStatement =
        if statement of ExpressionStatement:
            let statement = ExpressionStatement(statement)
            return

        elif statement of ContainerAssignmentStatement:
            let statement = ContainerAssignmentStatement(statement)
            

        elif statement of ContainerReassignmentStatement:
            let statement = ContainerReassignmentStatement(statement)
            

        elif statement of WhenStatement:
            let statement = WhenStatement(statement)
            

        elif statement of LoopStatement:
            let statement = LoopStatement(statement)
            

        elif statement of TryStatement:
            let statement = TryStatement(statement)
            

        elif statement of ExitStatement:
            let statement = ExitStatement(statement)
            

        elif statement of StopStatement:
            let statement = StopStatement(statement)
            

        elif statement of NextStatement:
            let statement = NextStatement(statement)
            


    for statement in javaScriptAbstractSyntaxTree:
        output.add(statementGenerator(statement))
    ]#
    return output




proc tokenGenerator(token: Token, indentLevel: int = 0): string =
    let indent = "    ".repeat(indentLevel)
    if token == nil:
        return "nil\n"
    
    result.add "Token {\n" 
    result.add indent & "    kind: " & $token.tokenKind & "\n"
    result.add indent & "    lexeme: \"" & (if token.lexeme == "\n": "\\n" else: token.lexeme) & "\"\n"  
    result.add indent & "    line: " & $token.line & "\n"
    result.add indent & "}\n"

proc tokensGenerator*(tokens: seq[Token]): string =
    result.add "Token [\n"
    for token in tokens:
        result.add "    " & tokenGenerator(token, 1)
    result.add "]"



proc abstractSyntaxTreeGenerator*(statements: seq[Statement]): string {.used.} =

    proc statementGenerator(statement: Statement, indentLevel: int = 0): string 

    proc expressionGenerator(expression: Expression, indentLevel: int = 0): string =
        let indent = "    ".repeat(indentLevel)
        
        if expression == nil:
            result.add "nil\n"
        
        elif expression of ContainerExpression:
            let expression = ContainerExpression(expression)
            result.add "ContainerExpression {\n"
            result.add indent & "    identifier: "
            result.add tokenGenerator(expression.identifier, indentLevel + 1)
            if expression.arguments.len() != 0:
                result.add indent & "    arguments: Argument [\n"
                for argument in expression.arguments:
                    result.add indent & "        Argument {\n"
                    result.add indent & "            " & tokenGenerator(argument.identifier, indentLevel + 3)
                    result.add indent & "            " & expressionGenerator(argument.value, indentLevel + 3)
                    result.add indent & "        }\n"
                result.add indent & "    ]\n"
            else:
                result.add indent & "    arguments: Expression []\n"
            result.add indent & "}\n"
            
        elif expression of WhenExpression:
            let expression = WhenExpression(expression)
            result.add "WhenExpression {\n"
            result.add indent & "    dataTypes: " & $expression.dataTypes & "\n"
            result.add indent & "    whenSubExpressions: WhenSubExpression [\n"
            for subExpression in expression.whenSubExpressions:                
                result.add indent & "        WhenSubExpression {\n"
                result.add indent & "            keyword: " & tokenGenerator(subExpression.keyword, indentLevel + 3)
                result.add indent & "            condition: " &  expressionGenerator(subExpression.condition, indentLevel + 3)
                result.add indent & "            expression: " & expressionGenerator(subExpression.expression, indentLevel + 3)
                result.add indent & "        }\n"
            result.add indent & "    ]\n"
            result.add indent & "}\n"
            
        elif expression of LoopExpression:
            let expression = LoopExpression(expression)
            result.add "LoopExpression {\n"
            result.add indent & "    loopKeyword: " & tokenGenerator(expression.loopKeyword, indentLevel + 1)
            result.add indent & "    withExpressions: WithExpression [\n"
            for withExpression in expression.withExpressions:
                result.add indent & "        WithExpression {\n"
                result.add indent & "            withKeyword: " & tokenGenerator(withExpression.withKeyword, indentLevel + 3)
                result.add indent & "            iterable: " & expressionGenerator(withExpression.iterable, indentLevel + 3)
                result.add indent & "            iterableDataType: " & $withExpression.iterableDataType & "\n"
                if withExpression.counters.len() == 0:
                    result.add indent & "            counters: Identifier []\n"
                else:
                    result.add indent & "            counters: Identifier [\n"
                    for counter in withExpression.counters:
                        result.add indent & "                Identifier {\n"
                        result.add indent & "                    " & tokenGenerator(counter, indentLevel + 5)
                        result.add indent & "                }\n"
                    result.add indent & "            ]\n"
                result.add indent & "        }\n"
            result.add indent & "    ]\n"
            result.add indent & "    expression: " & expressionGenerator(expression.expression, indentLevel + 1)
            result.add indent & "}\n"
            
        elif expression of TryExpression:
            let expression = TryExpression(expression)
            result.add "TryExpression {\n"
            result.add indent & "    dataTypes: " & $expression.dataTypes & "\n"
            result.add indent & "    tryKeyword: " & tokenGenerator(expression.tryKeyword, indentLevel + 1)
            result.add indent & "    tryExpression: " & expressionGenerator(expression.tryExpression, indentLevel + 1)
            result.add indent & "    fixExpressions: FixExpression [\n"
            for fixExpression in expression.fixExpressions:
                result.add indent & "        FixExpression {\n"
                result.add indent & "            fixKeyword: " & tokenGenerator(fixExpression.fixKeyword, indentLevel + 3)
                result.add indent & "            identifier: " & tokenGenerator(fixExpression.identifier, indentLevel + 3)
                result.add indent & "            fixExpression: " & expressionGenerator(fixExpression.fixExpression, indentLevel + 3)
                result.add indent & "        }\n"
            result.add indent & "    ]\n"
            result.add indent & "}\n"
        
        elif expression of BlockExpression:
            let expression = BlockExpression(expression)
            result.add "BlockExpression {\n"
            result.add indent & "    statements: Statement [\n"
            for statement in expression.statements:
                result.add statementGenerator(statement, indentLevel + 2)
            result.add indent & "    ]\n"
            result.add indent & "}\n"
        
        elif expression of LiteralExpression:
            let expression = LiteralExpression(expression)
            result.add "LiteralExpression {\n"
            result.add indent & "    value: "
            if expression.value of BooleanLiteral:
                let val = BooleanLiteral(expression.value)
                result.add "BooleanLiteral {\n" 
                result.add indent & "        value: " & $val.value & "\n"
            elif expression.value of StringLiteral:
                let val = StringLiteral(expression.value)
                result.add "StringLiteral {\n" 
                result.add indent & "        value: " & "\"" & $val.value & "\"" & "\n"
            elif expression.value of NumericLiteral:
                let val = NumericLiteral(expression.value)
                result.add "NumericLiteral {\n" 
                result.add indent & "        value: " & $val.value & "\n"
            else:
                result.add "Unknown literal type\n"
            result.add indent & "    }\n"
            result.add indent & "}\n"
        
        elif expression of GroupingExpression:
            let expression = GroupingExpression(expression)
            result.add "GroupingExpression {\n"
            result.add indent & "    expression: " & expressionGenerator(expression.expression, indentLevel + 1)
            result.add indent & "}\n"
        
        elif expression of UnaryExpression:
            let expression = UnaryExpression(expression)
            result.add "UnaryExpression {\n"
            result.add indent & "    operator: " & tokenGenerator(expression.operator, indentLevel + 1)
            result.add indent & "    right: " & expressionGenerator(expression.right, indentLevel + 1)
            result.add indent & "}\n"
            
        elif expression of RangeExpression:
            let expression = RangeExpression(expression)
            result.add "RangeExpression {\n"
            result.add indent & "    start: " & expressionGenerator(expression.start, indentLevel + 1)
            result.add indent & "    firstOperator: " & tokenGenerator(expression.firstOperator, indentLevel + 1)
            result.add indent & "    stop: " & expressionGenerator(expression.stop, indentLevel + 1)
            result.add indent & "    secondOperator: " & tokenGenerator(expression.secondOperator, indentLevel + 1)
            result.add indent & "    step: " & expressionGenerator(expression.step, indentLevel + 1)
            result.add indent & "}\n"
    
        elif expression of BinaryExpression:
            let expression = BinaryExpression(expression)
            result.add "BinaryExpression {\n"
            result.add indent & "    left: " & expressionGenerator(expression.left, indentLevel + 1)
            result.add indent & "    operator: " & tokenGenerator(expression.operator, indentLevel + 1)
            result.add indent & "    right: " & expressionGenerator(expression.right, indentLevel + 1)
            result.add indent & "}\n"
        
        else:
            return "Unknown Expression\n"
    
    proc statementGenerator(statement: Statement, indentLevel: int = 0): string =
        let indent = "    ".repeat(indentLevel)
    
        if statement == nil:
            result.add indent & "nil\n"
    
        elif statement of ExpressionStatement:
            let statement = ExpressionStatement(statement)
            result.add indent & "ExpressionStatement {\n"
            result.add indent & "    expression: " & expressionGenerator(statement.expression, indentLevel + 1)
            result.add indent & "}\n"
            
        elif statement of ContainerAssignmentStatement:
            let statement = ContainerAssignmentStatement(statement)
            result.add indent & "ContainerAssignmentStatement {\n"
            result.add indent & "    identifier: " & tokenGenerator(statement.identifier, indentLevel + 1)
            if statement.parameters.len() != 0:
                result.add indent & "    parameters: Parameter [\n"
                for parameter in statement.parameters:
                    result.add indent & "        Parameter {\n"
                    result.add indent & "            identifier: " & tokenGenerator(parameter.identifier, indentLevel + 3)
                    result.add indent & "            defaultValue: " & expressionGenerator(parameter.defaultValue, indentLevel + 3)
                    result.add indent & "        }\n"
                result.add indent & "    ]\n"
            else:
                result.add indent & "    parameters: Token []\n"
                
            result.add indent & "    expression: " & expressionGenerator(statement.expression, indentLevel + 1)
            result.add indent & "}\n"
        
        elif statement of ContainerReassignmentStatement:
            let statement = ContainerReassignmentStatement(statement)
            result.add indent & "ContainerReassignmentStatement {\n"
            result.add indent & "    identifier: " & tokenGenerator(statement.identifier, indentLevel + 1)
            result.add indent & "    expression: " & expressionGenerator(statement.expression, indentLevel + 1)
            result.add indent & "}\n"
        
        elif statement of WhenStatement:
            let statement = WhenStatement(statement)
            result.add indent & "WhenStatement {\n"
            result.add indent & "    whenSubStatements: WhenSubStatement [\n"
            for subStatement in statement.whenSubStatements:
                result.add indent & "        WhenSubStatement {\n"
                result.add indent & "            keyword: " & tokenGenerator(subStatement.keyword, indentLevel + 3)
                result.add indent & "            condition: " & expressionGenerator(subStatement.condition, indentLevel + 3)
                result.add indent & "            block: " &  expressionGenerator(subStatement.block, indentLevel + 3)
                result.add indent & "        }\n"
            result.add indent & "    ]\n"
            result.add indent & "}\n"
            
        elif statement of LoopStatement:
            let statement = LoopStatement(statement)
            result.add indent & "LoopStatement {\n"
            result.add indent & "    loopKeyword: " & tokenGenerator(statement.loopKeyword, indentLevel + 1)
            result.add indent & "    withStatements: WithStatement [\n"
            for i, withStatement in statement.withStatements:
                result.add indent & "        WithStatement {\n"
                result.add indent & "            withKeyword: " & tokenGenerator(withStatement.withKeyword, indentLevel + 3)
                result.add indent & "            iterable: " & expressionGenerator(withStatement.iterable, indentLevel + 3)
                result.add indent & "            iterableDataType: " & $withStatement.iterableDataType & "\n"
                result.add indent & "            counters: Identifier [\n"
                for counter in withStatement.counters:
                    result.add indent & "                Identifier {\n"
                    result.add indent & "                    " & tokenGenerator(counter, indentLevel + 5)
                    result.add indent & "                }\n"
                result.add indent & "            ]\n"
                result.add indent & "        }\n"
            result.add indent & "    ]\n"
            result.add indent & "    block: " & expressionGenerator(statement.`block`, indentLevel + 1)
            result.add indent & "}\n"
        
        elif statement of TryStatement:
            let statement = TryStatement(statement)
            result.add indent & "TryStatement {\n"
            result.add indent & "    tryKeyword: " & tokenGenerator(statement.tryKeyword, indentLevel + 1)
            result.add indent & "    tryBlock: " & expressionGenerator(statement.tryBlock, indentLevel + 1)
            result.add indent & "    fixStatements: FixStatement [\n"
            for fixStatement in statement.fixStatements:
                result.add indent & "        FixStatement {\n"
                result.add indent & "            fixKeyword: " & tokenGenerator(fixStatement.fixKeyword, indentLevel + 3)
                result.add indent & "            identifier: " & tokenGenerator(fixStatement.identifier, indentLevel + 3)
                result.add indent & "            fixBlock: " & expressionGenerator(fixStatement.fixBlock, indentLevel + 3)
                result.add indent & "        }\n"
            result.add indent & "    ]\n"
            result.add indent & "}\n"
            
        elif statement of ExitStatement:
            let statement = ExitStatement(statement)
            result.add indent & "ExitStatement {\n"
            result.add indent & "    keyword: " & tokenGenerator(statement.keyword, indentLevel + 1)
            result.add indent & "    expression: " & expressionGenerator(statement.expression, indentLevel + 1)
            result.add indent & "}\n"
        
        elif statement of StopStatement:
            let statement = StopStatement(statement)
            result.add indent & "StopStatement {\n"
            result.add indent & "    keyword: " & tokenGenerator(statement.keyword, indentLevel + 1)
            result.add indent & "    counter: " & tokenGenerator(statement.counter, indentLevel + 1)
            result.add indent & "}\n"
        
        elif statement of NextStatement:
            let statement = NextStatement(statement)
            result.add indent & "NextStatement {\n"
            result.add indent & "    keyword: " & tokenGenerator(statement.keyword, indentLevel + 1)
            result.add indent & "    counter: " & tokenGenerator(statement.counter, indentLevel + 1)
            result.add indent & "}\n"

        else:
            return indent & "Unknown Statment\n"
        
    result.add "Statement [\n"
    for statement in statements:
        result.add statementGenerator(statement, 1)
    result.add "]"









