


export function createParser(tokens) {
    return {
        tokens,
        poistion: 0
    };
}

function isAtEnd(parser) {
    return parser.tokens[parser.poistion].type === "EndOffile";
}

function parseStatement(utkrisht, parser) {

}

export function parse(utkrisht, parser) {
    const statements = [];
    while (!isAtEnd(parser)) {
        statements.push(parseStatement(utkrisht, parser));
    }
    return statements;
}

