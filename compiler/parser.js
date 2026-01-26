import logger from "./logger";

export function createParser(tokens) {
    return {
        tokens,
        poistion: 0
    };
}

class ParseError extends Error {
    constructor(message, token) {
        super(message);
        this.token = token;
        this.name = "ParseError";
    }
}

function error(utkrisht, message, token) {
    logger.error(utkrisht, message, token.line)
    return new ParseError(message, token)
}

function getCurrentToken(parser) {
    return parser.tokens[parser.poistion];
}

function isCurrentTokenType(parser, type) {
    return getCurrentToken(parser).type === type;
}

function isAtEnd(parser) {
    return parser.tokens[parser.poistion].type === "EndOffile";
}

function synchronise(parser) {
    while (!isAtEnd(parser)) {
        parser.poistion++
        if (getCurrentToken(parser).type === "NewLine") {
            break;
        }
        if (getCurrentToken(parser).type === "Keyword" && ["loop", "when"].includes(getCurrentToken(parser).lexeme)) {
            break;
        }
    }
}

function parseVariableDeclaration(utkrisht, parser) {

}


function parseStatement(utkrisht, parser) {
    if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else if (isCurrentTokenType(parser, "When")) {
        return parseWhenStatement(utkrisht, parser);
    }
    else {
        if (isCurrentTokenType(parser, "Else")) {
            error(utkrisht, "Can not use `else` statement without `when` statement", getCurrentToken(parser).line)
        } else if (isCurrentTokenType(parser, "Fix")) {

        } else if (isCurrentTokenType(parser, "With")) {

        }
    }
}


function parseDeclaration(utkrisht, parser) {
    try {
        if (isCurrentTokenType(parser, "Identifier") && parser.tokens[parser.poistion + 1].type !== "Equal") {
            parseVariableDeclaration(utkrisht, parser);
        } else {
            parseStatement(utkrisht, parser);
        }
    } catch (error) {
        // We are only concerned about parser errors, not bugs in this file.
        if (error instanceof ParseError) {
            synchronise(parser);
            return undefined;
        }

        // If it is a different error, let the developer handle it
        throw error;
    }
}

export function parse(utkrisht, parser) {
    const statements = [];

    while (!isAtEnd(parser)) {
        statements.push(parseDeclaration(utkrisht, parser));
    }

    return statements;
}

