// TODO in the future
// Add a custom right-click menu in the file tree, with Rename and Delete
// Add "Download Markdown" and "Download HTML" features

let input, output;

// Local storage functions
// TODO: Transfer to API - that's why I'm writing this with async functions when there's no need for async functions
let filename,
    active,
    files = [];

const saveMarkdown = (markdown, filename = getActive(), isNew = false) => {
    let files = localStorage.getItem("markdown-parser");
    if (files)
        localStorage.setItem(
            "markdown-parser",
            JSON.stringify({
                ...JSON.parse(files),
                [filename]: markdown
            })
        );
    else
        localStorage.setItem(
            "markdown-parser",
            JSON.stringify({ [filename]: markdown })
        );

    if (isNew) addFileToTree(filename);
};

const getMarkdown = filename => {
    let files = localStorage.getItem("markdown-parser");
    if (files) return JSON.parse(files)[filename];
};

const getFiles = () => {
    let files = localStorage.getItem("markdown-parser");
    if (files) return Object.keys(JSON.parse(files));
};

const setActive = filename => {
    localStorage.setItem("markdown-parser-active", filename);
    active = filename;

    // Update in tree
    for (let file of files) {
        if (file.innerText === active)
            file.querySelector("button").classList.add("active");
        else if (file.querySelector("button").classList.contains("active"))
            file.querySelector("button").classList.remove("active");
        document.getElementById("tree").appendChild(file);
    }

    // Update in editor
    input.value = getMarkdown(filename);
    update();
};

const getActive = () => localStorage.getItem("markdown-parser-active");

const addFileToTree = filename => {
    let li = document.createElement("li");
    let button = document.createElement("button");
    button.innerText = escapeHTML(filename);
    button.addEventListener("click", function (event) {
        if (!this.classList.contains("active")) setActive(this.innerText);
    });
    if (active === filename) button.classList.add("active");
    li.appendChild(button);
    files.push(li);
};

const initState = () => {
    active = getActive();
    files = [];
    for (let filename of getFiles()) {
        // Create a list item > button for each file in the "tree"
        addFileToTree(filename);
    }

    setActive(active);
};

const update = () => {
    // ? Notice the use of update() multiple times below in the event listeners. I've observed a couple of interesting things:
    // ? * If I only place update() in keydown, then it bounces and passes in all characters except for the one the user just typed in
    // ? * If I only place update() in input, then Backspace doesn't work
    output.innerHTML = parseMarkdown(input.value);
    output.querySelectorAll(".hljs").forEach(el => hljs.highlightElement(el));

    // Save to storage
    saveMarkdown(input.value);
};

window.onload = () => {
    input = document.getElementById("input");
    output = document.getElementById("output");
    if (getActive())
        initState(); // Only initiailize state if there is data being stored
    else input.disabled = true;

    // * Obviously, storing and comparing state might be more efficient
    input.addEventListener("input", update);

    let tabs = 0;
    input.addEventListener("keydown", function (event) {
        let start = this.selectionStart;
        let end = this.selectionEnd;

        // Emulate tabbing
        if (event.key === "Tab") {
            event.preventDefault();
            // Set textarea value to text before caret + tab + text after caret
            this.value = `${this.value.substring(
                0,
                start
            )}    ${this.value.substring(end)}`;
            this.selectionStart = this.selectionEnd = start + 4;
            tabs += 4;
        } else if (event.key === "Enter") {
            event.preventDefault();
            // Set textarea value to text before caret + newline + current # of tabs + text after caret
            this.value = `${this.value.substring(0, start)}\n${" ".repeat(
                tabs
            )}${this.value.substring(end)}`;
            this.selectionStart = this.selectionEnd =
                start + "\n".length + tabs;
        } else if (event.key === "Backspace") {
            event.preventDefault();
            let prev = this.value.substring(start - tabs, start);
            if (tabs && prev === " ".repeat(tabs)) {
                // Go back a tab
                tabs -= 4;
                this.value = `${this.value.substring(
                    0,
                    start - 4
                )}${this.value.substring(end)}`;
                this.selectionStart = this.selectionEnd = start - 4;
            } else if (prev != undefined) {
                // Go back as usual
                this.value = `${this.value.substring(
                    0,
                    start - 1
                )}${this.value.substring(end)}`;
                this.selectionStart = this.selectionEnd = start - 1;
            }
            update();
        } else update();
    });

    document.getElementById("new").addEventListener("click", function (event) {
        // TODO: Replace with custom modal
        let filenameInput = prompt("Name of file?");
        while (!filenameInput || getMarkdown(filenameInput))
            filenameInput = prompt("Try again. Name of file?");

        saveMarkdown("", filenameInput, true);
        setActive(filenameInput);
        if (input.disabled) input.disabled = false;
    });
};
