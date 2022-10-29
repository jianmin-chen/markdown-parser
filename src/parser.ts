// PART OF TOKENIZER

const splitBlock: Function = (block: string, inner: boolean = false) => {
    // What we need to process here:
    // :check Italic
    // :check Bold
    // :check Inline code
    // :check Links

    let specialChars: Array<string> = ["*", "`"];
    let fragments = [];

    const takeNormal: Function = (): string => {
        // Slice up until we reach a special character
        let characters: Array<string> = [];
        let i: number = 0;
        while (!specialChars.includes(block.charAt(0)) && i < block.length) {
            characters.push(block.charAt(i));
            i++;
        }
        block = block.slice(i);
        return characters.join("");
    };

    const sliceUpTo: Function = (phrase: string, ignore: boolean = false) => {
        if (block.length) block = block.slice(phrase.length);
        let characters: Array<string> = [];
        let i: number = 0;
        while (
            block.slice(i, i + phrase.length) != phrase &&
            i < block.length
        ) {
            characters.push(block.charAt(i));
            i++;
        }
        if (block.length) {
            block = block.slice(phrase.length);
            block = block.slice(i);
        }
        if (!ignore) return splitBlock(characters.join("")); // Also tokenize inner parts
        return characters.join(""); // Don't tokenize inner parts. Useful for <code>
    };

    if (!block.length) return [];
    else if (block.startsWith("* ") && !inner)
        // Unordered list item
        return { type: "li", content: splitBlock(block.slice(2)) };
    else if (block.search(/[0-9]+\./) === 0)
        // Ordered list item
        return {
            type: "li",
            content: splitBlock(block.slice(block.match(/[0-9]+\./)[0].length))
        };

    while (block.length) {
        let curr: string = block.charAt(0);
        if (curr === "*") {
            // Determine if italic, bold, mix of both, or unordered list
            // ! Not the best way to do it, but I couldn't think of a smarter way. Something in my mind tells me recursion, but I have no idea how to go about it. Clues?
            if (block.length > 2 && block.slice(0, 3) === "***")
                fragments.push({
                    type: "boldItalic",
                    content: sliceUpTo("***")
                });
            else if (block.length > 1 && block.slice(0, 2) === "**")
                fragments.push({ type: "b", content: sliceUpTo("**") });
            else fragments.push({ type: "i", content: sliceUpTo("*") });
        } else if (curr === "`")
            fragments.push({ type: "code", content: sliceUpTo("`", true) });
        else fragments.push({ type: "normal", content: takeNormal() });
    }

    return fragments;
};

const processBlock = (block: string | number) => {
    // What we need to process here:
    // :check Headings
    // :check Blockquotes
    // :check Code blocks
    // :check Horizontal breaks
    // Images
    // :check Unordered and ordered lists

    block = typeof block === "string" ? block.trim() : block;
    let type: string = "p";
    let header: number = 0;

    if (block === "---") {
        // Horizontal lines
        block = -1; // * -1 represents no content (vs. purposely placed empty string)
        type = "hr";
    } else if (typeof block === "string" && block.startsWith("#")) {
        // Headings
        let fragment: string = block;
        while (fragment.charAt(0) === "#") {}
    }
};
