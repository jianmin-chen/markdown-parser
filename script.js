// TODO in the future
// Add support for tables

// PART OF TOKENIZER

const splitBlock = block => {
    // What we need to process here:
    // :check Italic
    // Bold
    // :check Inline code
    // Links

    if (!block.length) return [];

    let specialChars = ["*", "`"];
    let fragments = [];

    const takeNormal = () => {
        // Slice up until we reach a special character
        let characters = [];
        let i = 0;
        while (!specialChars.includes(block.charAt(i)) && i < block.length) {
            characters.push(block.charAt(i));
            i++;
        }
        block = block.slice(i);
        return characters.join("");
    };

    const sliceUpTo = (char, ignore = false) => {
        // Slice up until we reach a special character
        if (block.length) block = block.slice(1);
        let characters = [];
        let i = 0;
        while (block.charAt(i) != char && i < block.length) {
            characters.push(block.charAt(i));
            i++;
        }
        if (block.length) {
            block = block.slice(1);
            block = block.slice(i);
        }
        if (!ignore) return splitBlock(characters.join("")); // Also tokenize inner parts
        return characters.join(""); // Don't tokenize inner parts. Useful for <code>
    };

    while (block.length) {
        let curr = block.charAt(0);
        if (curr === "*")
            fragments.push({ type: "i", content: sliceUpTo("*") });
        else if (curr === "`")
            fragments.push({ type: "code", content: sliceUpTo("`", true) });
        else fragments.push({ type: "normal", content: takeNormal() });
    }

    return fragments;
};

const processBlock = block => {
    // What we need to process here:
    // :check Headings
    // :check Blockquotes
    // Code blocks
    // :check Horizontal breaks
    // Images
    // Unordered and ordered lists
    block = block.trim();
    let type = "p";
    let header = 0;

    if (block === "---") {
        // Horizontal lines
        block = "";
        type = "hr";
    } else if (block.startsWith("#")) {
        // Headings
        while (block.charAt(0) === "#") {
            block = block.slice(1);
            header++;
        }
        type = `h${header}`;
        block = block.trim();
    } else if (block.startsWith(">")) {
        // Blockquotes
        block = block.slice(1);
        type = "blockquote";
        block = block.trim();
    } else if (block.startsWith("```")) {
        // Code blocks
        block = block.split("\n");
        let lang = block[0].slice(3) || "auto";
        block = block.slice(1, block.length - 1); // Remove last line

        return {
            type: "codeBlock",
            content: block.join("\n"),
            attributes: { lang }
        };
    }

    let token = { type, content: splitBlock(block) };
    return token;
};

// PART OF PARSER

const parse = tokens => {
    if (typeof tokens === "string") return tokens; // Only a string
    let result = tokens.map(token => {
        if (token.type === "normal") return token.content; // Strings
        else if (token.type === "code") return tag("code", token.content);
        else if (token.type === "codeBlock") {
            return tag("pre", token.content, {
                class: `language-${token.attributes.lang} hljs`
            });
        } else return tag(token.type, parse(token.content));
    });
    return result;
};

const tag = (name, content = [], attributes = {}) => {
    // > The secret to successful HTML generation is to treat your HTML document as a data structure instead of a flat piece of text.
    // > JavaScript's objects provide a very easy way to model this:
    // > var linkObject = { name: "a", attributes: { href: "http://www.gokgs.com" }, content: ["Play Go!"] };
    return { name, content, attributes }; // This is smart because content can be recursive when generating HML.
};

const header = (heading, content) => tag(heading, content);

// PART OF RENDERER

const escapeHTML = text => {
    // > When we have created a document, it will have to be reduced to a string.
    // > But building this string from the data structures we have been producing is very straightforward. The important thing is to remember to transform the special characters in the text of our document.
    let replacements = [
        [/&/g, "&amp;"], // Match all ampersands
        [/"/g, "&quot;"], // Match all quotes
        [/</g, "&lt;"], // Match all <
        [/>/g, "&gt;"] // Match all >
    ];

    for (let special of replacements)
        text = text.replace(special[0], special[1]);

    return text;
};

const renderHTML = element => {
    let pieces = [];

    const renderAttributes = attributes => {
        // Convert attributes { href: ... } to escaped strings
        let result = [];
        if (attributes)
            for (let name in attributes)
                result.push(` ${name}="${escapeHTML(attributes[name])}"`);
        return result.join("");
    };

    const render = element => {
        if (typeof element === "string")
            pieces.push(escapeHTML(element)); // Text node
        else if (!element.content || !element.content.length)
            pieces.push(
                `<${element.name}${renderAttributes(element.attributes)}/>`
            );
        // Empty tag, e.g. <br/>
        else {
            // Tag with content - recursive
            pieces.push(
                `<${element.name}${renderAttributes(element.attributes)}>`
            );
            for (let piece of element.content) render(piece);
            pieces.push(`</${element.name}>`);
        }
    };

    render(element);
    return pieces.join("");
};

const parseMarkdown = markdown => {
    // MAIN WRAPPER FUNCTION
    // :check 1. Split the file into paragraphs by cutting it at every empty line.
    // :check 2. Remove the "#" characters from header paragraphs and mark them as headers.
    // 3. Process the text of the paragraphs themselves, splitting them into normal parts and the other Markdown stuff.
    // :check 4. Wrap each piece into the correct HTML tags.
    // :check 5. Combine everything into a single HTML document.

    let blocks = markdown
        .split("\n\n")
        .flatMap(line => (!line.length ? [] : line.split("\n")));
    let fragments = [];

    let inCodeBlock = false;
    let codeFragments = [];
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        if (block.startsWith("```")) {
            if (inCodeBlock) {
                // Exit code block
                codeFragments.push(block);
                fragments.push(codeFragments.join("\n"));
                codeFragments = [];
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
                codeFragments.push(block);
            }
        } else if (inCodeBlock) codeFragments.push(block);
        else fragments.push(block);
    }

    let wrapper = tag("div"); // Contains the output
    for (let fragment of fragments)
        wrapper.content.push(processBlock(fragment));
    wrapper.content = parse(wrapper.content);
    return renderHTML(wrapper);
};

window.onload = () => {
    document
        .getElementById("input")
        .addEventListener("input", function (event) {
            document.getElementById("output").innerHTML = parseMarkdown(
                document.getElementById("input").innerText
            );
            document
                .querySelectorAll(".hljs")
                .forEach(el => hljs.highlightElement(el));
        });
};
