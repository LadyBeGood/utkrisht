import std/unittest
import ../lexer
import ../types   # where TokenKind, Token are defined

suite "Lexer basic tokens":

    test "identifier":
        let tokens = lexer("hello")
        check tokens.len == 2
        check tokens[0].tokenKind == TokenKind.Identifier
        check tokens[0].lexeme == "hello"
        check tokens[1].tokenKind == TokenKind.EndOfFile

    test "keyword recognition":
        let tokens = lexer("when else loop")
        check tokens[0].tokenKind == TokenKind.When
        check tokens[1].tokenKind == TokenKind.Else
        check tokens[2].tokenKind == TokenKind.Loop

    test "numeric literal":
        let tokens = lexer("123 45.6")
        check tokens[0].tokenKind == TokenKind.NumericLiteral
        check tokens[0].lexeme == "123"
        check tokens[1].tokenKind == TokenKind.NumericLiteral
        check tokens[1].lexeme == "45.6"

    test "negative number":
        let tokens = lexer("-10")
        check tokens[0].tokenKind == TokenKind.NumericLiteral
        check tokens[0].lexeme == "-10"

    test "string literal":
        let tokens = lexer("\"hello world\"")
        check tokens[0].tokenKind == TokenKind.StringLiteral
        check tokens[0].lexeme == "hello world"



suite "Lexer punctuation":

    test "operators":
        let tokens = lexer("a + b * c")

        check tokens[1].tokenKind == TokenKind.Plus
        check tokens[3].tokenKind == TokenKind.Asterisk

    test "comparison operators":
        let tokens = lexer("!< !> !=")
        check tokens[0].tokenKind == TokenKind.ExclamationLessThan
        check tokens[1].tokenKind == TokenKind.ExclamationMoreThan
        check tokens[2].tokenKind == TokenKind.ExclamationEqual



suite "EOF token":

    test "EOF is always last":
        let tokens = lexer("a")
        check tokens[^1].tokenKind == TokenKind.EndOfFile
