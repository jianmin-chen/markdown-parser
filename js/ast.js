const AstType = {
    Heading: "Heading",
    Bold: "Bold",
    Italic: "Italic",
    Blockquote: "Blockquote",
    Ol: "Ol",
    Ul: "Ul",
    CodeBlock: "CodeBlock",
    Code: "Code",
    Hr: "Hr",
    Link: "Link",
    Image: "Image"
};

export class Heading {
    constructor(level, value) {
        this.type = AstType.Heading;
        this.level = level;
        this.value = value;
    }
}

export class Bold {
    constructor(value) {
        this.type = AstType.Bold;
        this.value = value;
    }
}

export class Italic {
    constructor(value) {
        this.type = AstType.Italic;
        this.value = value;
    }
}

export class Blockquote {
    constructor(value) {
        this.type = AstType.Blockquote;
        this.value = value;
    }
}

export class Ol {
    constructor(value) {
        this.type = AstType.Ol;
        this.value = value;
    }
}

export class Ul {
    constructor(value) {
        this.type = AstType.Ul;
        this.value = value;
    }
}

export class CodeBlock {
    constructor(lang, value) {
        this.type = AstType.CodeBlock;
        this.lang = lang;
        this.value = value;
    }
}

export class Code {
    constructor(value) {
        this.type = AstType.Code;
        this.value = value;
    }
}

export class Hr {
    constructor() {
        this.type = AstType.Hr;
    }
}

export class Link {
    constructor(href, alt) {
        this.type = AstType.Link;
        this.href = href;
        this.alt = alt;
    }
}

export class Image {
    constructor(src, alt) {
        this.type = AstType.Image;
        this.src = src;
        this.alt = alt;
    }
}
