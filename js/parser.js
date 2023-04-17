let parser = {
    tokens: [],
    current: 0
};

const initParser = tokens => {
    parser.tokens = tokens;
    parser.current = 0;
};

const peekTok = () => {
    if (parser.current >= parser.tokens.length) return null;
    return parser.tokens[parser.current].type;
};

const peekAfterTok = () => {
    if (parser.current >= parser.tokens.length) return null;
    return parser.tokens[parser.current + 1].type;
};

const eat = type => {
    if (peekTok() === type) return parser.tokens[parser.current++];
    parser.current++; // Skip the token
};

const headingDecl = () => {};

const stmt = () => {
    let token = eat(peekTok());
    switch (token.type) {
        case TokenType.Heading:
            headingDecl();
        case TokenType.Asterisk:
            if (peekTok() === TokenType.Asterisk) {
                // Bold
            }
        // Italic
        case TokenType.Blockquote:
            if (peekTok() === TokenType.Space) {
            }
        case TokenType.Tick:
            if (
                peekTok() === TokenType.Tick &&
                peekAfterTok() === TokenType.Tick
            ) {
                // Code block
            }
        // Inline code
        case TokenType.Tab:
        // Potential code block
        case TokenType.Underscore:
            if (peekTok() === TokenType.Underscore) {
                // Bold
            }
        // Italic
        case TokenType.Plus:
            if (peekTok() === TokenType.Space) {
                // Potential unordered list
            }
        case TokenType.Caret:
        // Potential superscript
        case TokenType.Tilde:
        // Potential strikethrough
        case TokenType.Dash:
            if (peekTok() === TokenType.Space) {
                // Potential unordered list
            }
        case TokenType.Exlaim:
        // Potential image
        case TokenType.LeftBracket:
        // Potential link
        case TokenType.Number:
        // Potential number
    }
};

const parse = () => {
    let list = [];
    while (peekTok() !== TokenType.Eof) list.push(stmt());
    return list;
};
