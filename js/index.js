import { initLexer, scanTokens } from "./lexer";
import { parse } from "./parser";
import render from "./render";

const parseMarkdown = markdown => {
    // Lexer -> parser -> evaluator, aka renderer
    initLexer(markdown);
    scanTokens();
    let ast = parse();
    return render(ast);
};

export default parseMarkdown;
