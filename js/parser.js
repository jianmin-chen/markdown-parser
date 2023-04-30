import { TokenType } from "./lexer.js";
import { tag } from "./render.js";

let parser = {
    tokens: [],
    current: 0
};

const initParser = tokens => {
    parser.tokens = tokens;
    parser.current = 0;
};

const peek = () => {
    if (parser.current >= parser.tokens.length) return null;
    return parser.tokens[parser.current];
};

const peekTok = () => {
    if (parser.current >= parser.tokens.length) return null;
    return parser.tokens[parser.current].type;
};

const peekAfterTok = () => {
    if (parser.current >= parser.tokens.length) return null;
    return parser.tokens[parser.current].type;
};

const eat = type => {
    if (peekTok() === type) return parser.tokens[parser.current++];
    return null;
};

const headingDecl = () => {
    let level = 0;
    while (eat(TokenType.Heading)) level++;
    if (!eat(TokenType.Space)) return `${"#".repeat(level)}`;
    let body = [];
    while (peekTok() !== TokenType.Newline) {
        body.push(inline());
    }
    eat(TokenType.Newline);
    return tag(`h${level}`, body);
};

const boldDecl = () => {
    eat(TokenType.Asterisk);
    eat(TokenType.Asterisk);
    let body = [];
    while (peekTok() !== TokenType.Asterisk) body.push(inline());
    eat(TokenType.Asterisk);
    eat(TokenType.Asterisk);
    return tag("b", body);
};

const italicDecl = () => {
    eat(TokenType.Asterisk);
    let body = [];
    while (peekTok() !== TokenType.Asterisk) body.push(inline());
    eat(TokenType.Asterisk);
    return tag("i", body);
};

const linkDecl = () => {
    eat(TokenType.LeftBracket);
    let text = [];
    while (peekTok() !== TokenType.RightBracket) text.push(inline());
    eat(TokenType.RightBracket);
    eat(TokenType.LeftParen);
    let link = eat(peekTok()).value;
    eat(TokenType.RightParen);
    return tag("a", text, {
        href: link,
        target: "_blank"
    });
};

const blockquoteDecl = () => {
    eat(TokenType.Blockquote);
    eat(TokenType.Space);
    let body = [];
    while (
        peekTok() !== TokenType.Newline &&
        peekTok() !== TokenType.Eof &&
        peekAfterTok() !== TokenType.Blockquote
    ) {
        body.push(stmt());
    }
    eat(TokenType.Newline);
    return tag("blockquote", body);
};

const paragraphDecl = () => {
    let body = [];
    while (peekTok() !== TokenType.Newline) body.push(inline());
    eat(TokenType.Newline);
    return tag("p", body);
};

const inline = () => {
    let token = eat(peekTok());
    console.log(token);
    switch (token.type) {
        case TokenType.Asterisk:
            if (peekTok() === TokenType.Asterisk) return boldDecl();
            return italicDecl();
        case TokenType.LeftBracket:
            return linkDecl();
        default:
            return token.value;
    }
};

const stmt = () => {
    switch (peekTok()) {
        case TokenType.Heading:
            return headingDecl();
        case TokenType.Asterisk:
            if (peek().column === 1 && peekAfterTok() === TokenType.Space)
                return ulDecl();
        case TokenType.Blockquote:
            if (peek().column === 1) return blockquoteDecl();
        case TokenType.Newline:
            eat(TokenType.Newline);
        case TokenType.Dash:
            if (
                peekTok() === TokenType.Dash &&
                peekAfterTok() === TokenType.Dash
            ) {
                eat(TokenType.Dash);
                eat(TokenType.Dash);
                eat(TokenType.Dash);
                eat(TokenType.Newline);
                return tag("hr", -1);
            }
        default:
            // Just plaintext
            return paragraphDecl();
    }
};

const parse = () => {
    // One thing that differentiates this from most parsers is that you have to deal with incomplete Markdown and treat them as plain text.
    let list = [];
    while (peekTok() !== TokenType.Eof) list.push(stmt());
    return list;
};

export { initParser, parse };
