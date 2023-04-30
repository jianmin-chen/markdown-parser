const TokenType = {
    Eof: "Eof",
    Newline: "Newline",
    Space: "Space",
    Text: "Text",
    Heading: "Heading",
    Asterisk: "Asterisk",
    Blockquote: "Blockquote",
    Period: "Period",
    Number: "Number",
    Tick: "Tick",
    LeftBracket: "LeftBracket",
    RightBracket: "RightBracket",
    LeftParen: "LeftParen",
    RightParen: "RightParen",
    Exclaim: "Exclaim",
    Dash: "Dash",
    Tilde: "Tilde",
    Caret: "Caret",
    Underscore: "Underscore",
    Tab: "Tab",
    Ignore: "Ignore"
};

const special = [
    "\n",
    "\t",
    "*",
    "\\",
    "`",
    "[",
    "]",
    "!",
    "~",
    "^",
    "(",
    ")",
    "_"
];

let lexer = {
    current: 0,
    lineCurrent: 0,
    line: 1,
    source: "",
    tokens: []
};

const initLexer = source => {
    lexer.current = 0;
    lexer.lineCurrent = 0;
    lexer.source = source;
    lexer.tokens = [];
    lexer.line = 1;
};

const advance = () => {
    if (lexer.current >= lexer.source.length) return "\0";
    lexer.lineCurrent++;
    return lexer.source[lexer.current++];
};

const peek = () => {
    if (lexer.current >= lexer.source.length) return "\0";
    return lexer.source[lexer.current];
};

const peekNext = () => {
    if (lexer.current + 1 >= lexer.source.length) return "\0";
    return lexer.source[lexer.current + 1];
};

const newToken = (type, value, text) => ({
    type,
    value,
    text,
    line: lexer.line,
    column: lexer.lineCurrent
});

const addToken = (type, value, text) =>
    lexer.tokens.push(newToken(type, value, text));

const scanTokens = () => {
    while (lexer.current < lexer.source.length) scanToken();
    addToken(TokenType.Eof, "", "");
    return lexer.tokens;
};

const scanToken = () => {
    const codeOf = character => character.charCodeAt(0);

    const isNumeric = str => {
        let code = str.charCodeAt(0);
        return code >= codeOf("0") && code <= codeOf("9");
    };

    const number = () => {
        let text = "";
        while (isNumeric(peek())) {
            text += advance();
        }
        if (peek() === "." && isNumeric(peekNext())) {
            text += advance();
            while (isNumeric(peek())) {
                text += advance();
            }
        }
        addToken(TokenType.Number, parseFloat(text), text);
    };

    const text = () => {
        let text = "";
        while (
            peek() !== "\n" &&
            peek() !== "\0" &&
            !special.includes(peek())
        ) {
            text += advance();
        }
        if (text.length) addToken(TokenType.Text, text, text);
    };

    let character = advance();
    switch (character) {
        case "#":
            addToken(TokenType.Heading, "#", "#");
            break;
        case "*":
            addToken(TokenType.Asterisk, "*", "*");
            break;
        case ".":
            addToken(TokenType.Period, ".", ".");
            break;
        case "`":
            addToken(TokenType.Tick, "`", "`");
            break;
        case ">":
            addToken(TokenType.Blockquote, ">", ">");
            break;
        case "[":
            addToken(TokenType.LeftBracket, "[", "[");
            break;
        case "]":
            addToken(TokenType.RightBracket, "]", "]");
            break;
        case "(":
            addToken(TokenType.LeftParen, "(", "(");
            break;
        case ")":
            addToken(TokenType.RightParen, ")", ")");
            break;
        case "!":
            addToken(TokenType.Exclaim, "!", "!");
            break;
        case "-":
            addToken(TokenType.Dash, "-", "-");
            break;
        case "~":
            addToken(TokenType.Tilde, "~", "~");
            break;
        case "^":
            addToken(TokenType.Caret, "^", "^");
            break;
        case "_":
            addToken(TokenType.Underscore, "_", "_");
            break;
        case "\\":
            addToken(TokenType.Ignore, "\\", "\\");
            break;
        case "\r":
            break;
        case "\t":
            addToken(TokenType.Tab, "", "");
            break;
        case "\n":
            // Move to new line
            addToken(TokenType.Newline, "", "");
            lexer.line++;
            lexer.lineCurrent = 0;
            break;
        case " ":
            addToken(TokenType.Space, " ", " ");
            break;
        default:
            // Normal text?
            if (isNumeric(character)) {
                lexer.current--;
                number();
            } else {
                lexer.current--;
                text();
            }
    }
};

export { TokenType, lexer, initLexer, scanTokens };
