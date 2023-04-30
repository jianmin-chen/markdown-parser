import { escapeHTML } from "./utils.js";

const tag = (name, content = [], attributes = {}) => ({
    name,
    content,
    attributes
});

const renderHTML = element => {
    let pieces = [];

    const renderAttributes = attributes => {
        let result = [];
        if (attributes) {
            for (let name in attributes)
                result.push(` ${name}="${escapeHTML(attributes[name])}"`);
        }
        return result.join("");
    };

    const render = element => {
        if (typeof element === "string") pieces.push(escapeHTML(element));
        else if (element.content === -1)
            pieces.push(
                `<${element.name}${renderAttributes(element.attributes)}/>`
            );
        else {
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

export { tag, renderHTML };
