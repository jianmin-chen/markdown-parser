import { lexer, initLexer, scanTokens } from "./lexer";

const parseMarkdown = markdown => {
    initLexer(markdown);
    scanTokens();
    console.log(lexer);
};

export default parseMarkdown;
