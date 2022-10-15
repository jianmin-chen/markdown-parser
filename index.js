// TODO in future
// "Rename" feature
// "Download Markdown" & "Download HTML" feature
/*
    document
        .getElementById("download-markdown")
        .addEventListener("click", function (event) {
            // Download Markdown
            let a = document.createElement("a");
            a.setAttribute(
                "href",
                `data:text/markdown;charset=utf-8,${encodeURIComponent(
                    input.value
                )}`
            );
            a.setAttribute("download", `${active.split(" ").join("-")}.md`);
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });

    document
        .getElementById("download-html")
        .addEventListener("click", function (event) {
            // Download HTML
            let a = document.createElement("a");
            a.setAttribute(
                "href",
                `data:text/html;charset=utf-8,${encodeURIComponent(
                    output.innerHTML
                )}`
            );
            a.setAttribute("download", `${active.split(" ").join("-")}.html`);
            a.style.display = "none";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
 */

let input, output, contextmenu;

// Local storage functions
let filename,
    active,
    files = [];

const updateTree = remove => {
    // Update in tree
    document.getElementById("tree").innerHTML = "";
    for (let i = files.length - 1; i >= 0; i--) {
        let file = files[i];
        if (file.innerText === remove) {
            // Remove from tree
            files.splice(i, 1);
            continue;
        } else if (file.innerText === active)
            file.querySelector("button").classList.add("active");
        else if (file.querySelector("button").classList.contains("active"))
            file.querySelector("button").classList.remove("active");
        document.getElementById("tree").appendChild(file);
    }
};

const clearEditor = () => {
    input.disabled = true;
    input.value = "";
    output.innerHTML = "";
};

const deleteButton = () => {
    deleteFile(contextmenu.getAttribute("filename"));
    contextmenu.style.display = "none";
};

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

const deleteFile = filename => {
    let files = localStorage.getItem("markdown-parser");
    if (files) {
        // Delete file by filename
        files = JSON.parse(files);
        if (files[filename] != undefined) {
            delete files[filename];
            localStorage.setItem("markdown-parser", JSON.stringify(files));
            if (active === filename) setActive();
            updateTree(filename);
        } else throw new Error("404 Not Found: File doesn't exist");
    } else throw new Error("404 Not Found: File doesn't exist");
};

const setActive = filename => {
    if (filename) {
        localStorage.setItem("markdown-parser-active", filename);
        active = filename;

        // Update in editor
        input.disabled = false;
        input.value = getMarkdown(filename);
        update();
    } else {
        // Clear everything if there's no file to be set to active
        localStorage.removeItem("markdown-parser-active");
        clearEditor();
    }

    updateTree();
};

const getActive = () => localStorage.getItem("markdown-parser-active");

const addFileToTree = filename => {
    let li = document.createElement("li");
    let button = document.createElement("button");
    button.innerText = escapeHTML(filename);
    button.addEventListener("click", function (event) {
        if (!this.classList.contains("active")) setActive(this.innerText);
    });
    button.addEventListener("contextmenu", function (event) {
        event.preventDefault();

        // Move contextmenu to location of click
        let x = event.clientX,
            y = event.clientY;
        contextmenu.style.top = `${y}px`;
        contextmenu.style.left = `${x}px`;
        contextmenu.style.display = "block";

        // Set attribute on contextmenu with info on file to be deleted
        contextmenu.setAttribute("filename", this.innerText);

        // Add new event listeners to the buttons inside the contextmenu
        document
            .getElementById("delete")
            .removeEventListener("click", deleteButton);
        document
            .getElementById("delete")
            .addEventListener("click", deleteButton);
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
    if (getFiles())
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

    // New file
    contextmenu = document.getElementById("contextmenu");
    document.getElementById("new").addEventListener("click", function (event) {
        // TODO: Replace with custom modal
        let filenameInput = prompt("Name of file?");
        while (!filenameInput || getMarkdown(filenameInput))
            filenameInput = prompt("Try again. Name of file?");

        saveMarkdown("", filenameInput, true);
        setActive(filenameInput);
    });

    // Context menu in file tree
    document.body.addEventListener("click", function (event) {
        if (event.target.offsetParent != contextmenu)
            contextmenu.style.display = "none";
    });
};
