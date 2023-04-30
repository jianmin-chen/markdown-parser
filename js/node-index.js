// Console based for testing
import fs from "fs";
import { lexer, initLexer, scanTokens } from "./lexer.js";
import { initParser, parse } from "./parser.js";
import { renderHTML } from "./render.js";
import util from "util";

let file = process.argv[2];
if (!file) throw new Error("Please include file");

const log = (msg, file) => {
    if (file) {
        fs.writeFile(file, JSON.stringify(msg), err => {});
        return;
    }
    console.log(
        util.inspect(msg, {
            showHidden: true,
            depth: null,
            colors: true
        })
    );
};

fs.readFile(file, "utf-8", (err, data) => {
    if (err) throw new Error(err);
    initLexer(data.toString());
    scanTokens();
    initParser(lexer.tokens);
    // log(lexer.tokens, "output.json");
    let ast = parse();
    let html = [];
    for (let node of ast) {
        html.push(renderHTML(node));
    }
    console.log(html);
});
