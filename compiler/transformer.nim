import types


proc transformer*(abstractSyntaxTree: seq[Statement]): seq[JavaScriptStatement] =
    var javaScriptAbstractSyntaxTree: seq[JavaScriptStatement] = @[]

    proc expressionTransformer(expression: Expression): JavaScriptExpression =
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
            


    proc statementTransformer(statement: Statement): JavaScriptStatement =
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
            


    for statement in abstractSyntaxTree:
        javaScriptAbstractSyntaxTree.add(statementTransformer(statement))
    
    return javaScriptAbstractSyntaxTree






