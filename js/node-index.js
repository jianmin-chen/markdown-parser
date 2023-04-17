// Console based for testing
import fs from "fs";
import { lexer, initLexer, scanTokens } from "./lexer.js";
import util from "util";

let file = process.argv[2];
if (!file) throw new Error("Please include file");

const log = msg => {
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
    // initParser(lexer.tokens);
    log(lexer.tokens);
    // let ast = program();
});
