## About

This is a DIY Markdown parser written from scratch in JavaScript!

Here's what it's able to parse:

* Headings and heading IDs
* Paragraphs
* Italic
* Bold
* Inline code
* Links
* Images
* Code blocks
* Blockquotes
* Horizontal breaks
* Unordered, ordered, and task lists (but not nested ones, currently)

Here's what hasn't been tackled so far:

- [ ] Nested lists
- [ ] Tables
- [ ] Footnotes
- [ ] Definition lists
- [ ] Highlight

In addition, a basic frontend with `localStorage` has been implemented, allowing you to create, (auto) save, rename, and delete Markdown files. For a full-stack version, check out [Markright](https://github.com/jianmin-chen/markright) - a tool I built with this custom Markdown parser that allows me to write notes and organize them by folder on the go.

## Getting started

`git clone` this repository and then run `npm i` to install Prettier and `http-server` (those are the only dependencies other than TypeScript). Then, run `npm start` to whip up a local HTTP server (which uses `http-server`).

You can also see the demo at [https://jianmin-chen.github.io/markdown-parser](https://jianmin-chen.github.io/markdown-parser).

## Thoughts

> *Disclaimer*: This isn't perfect. As I'll mention, I wrote this with little help, for the sake of learning. Most programmers don't do that. We've probably all built off some sort of foundation before, maybe by reading a book, or watching a video, to understand the core underlying concepts. Prior to creating this, I did a bit of that, skimming a few resources for the core terminology but nothing else. Therefore, this is not completely perfect.

I built this as part of a ten-day [challenge](https://events.hackclub.com/10-days-in-public). Read my blog [post](https://www.jianminchen.com/article/general/2022-10-07-markdown-parser) to see my thoughts and process on building this.

### How this works

We have what's known as a *parser*. It transforms the Markdown into (mostly safe) HTML. The main function that's responsible for doing this parsing is `parseMarkdown`, which takes the Markdown, splitting it by each "block" (read: each newline). It also organizes blocks. For example, it organizes the list items in an unordered list as one block.

After this organization is done, we transform the resulting blocks into *"tokens"*. Tokens are just an intermediate representation of the final HTML. For example, here's how an unordered list might look like as a token:

```js
{
    type: "ul",
    content: [
        { type: "li", content: "Item #1" },
        { type: "li", content: "Item #2" }
    ]
}
```

This is super easy to transform into HTML, as we'll see later. For now, let's continue token generation. Basically, we loop through the blocks we've just organized, passing them into a function called `processBlock`. This function takes the block and does some initial token generation. For example, if it receives a heading (i.e., `# This is a heading *one*`), it will strip off the starting `#`, marking it as a heading token. Then, it passes the rest of the content into `splitBlock`, which is responsible for recursive token generation. Staying with the example of the heading, you'll notice that "one" is in italics. In this case, a token would be generated for it by `splitBlock`. The final token would look like:

```js
{
    type: "heading",
    content: [
        "This is a heading ",
        { type: "i", content: "one" }
    ]
}
```

This provides a couple of benefits:

* It's readable. You can actually see how the structure of the generated HTML will look, which is super useful when debugging.
* When you transform it into HTML, you can generate [escaped HTML](https://stackoverflow.com/questions/20727910/what-is-escaped-unescaped-output), which ensures that the generated HTML is safe.

Let's get into transforming these tokens into HTML. Now that the program has an array of these tokens, it passes them into a function called `parse` (confusing name, I'll admit), which creates an HTML tag based on the token. The creation of tags is done by a very simple function, `tag`:

```js
const tag = (name, content = [], attributes = {}) => {
    // > var linkObject = { name: "a", attributes: { href: "http://www.gokgs.com" }, content: ["Play Go!"] };
    return { name, content, attributes }; // This is smart because content can be recursive when generating HTML.
};
```

This only provides a representation of HTML tags, but it is so, so useful. We can describe recursive HTML structures with it very easily. For example, task lists can be described by the following representation:

```js
tag("li", [
    tag("input", -1, {
        disabled: "",
        type: "checkbox",
        ...(token.attributes.checked && { checked: "" })
    }),
    tag("span", parse(token.content))
]);
```

Here, a task item is represented by a list item. The list item has two tags inside: an `input` tag, which has no content (hence the -1 to represent no content) but a couple of attributes: it is disabled, is a checkbox, and is marked as checked if the Markdown has it marked it as checked (i.e., `- [X]`). The `span` tag does have content - the task item - but it doesn't have any attributes. The content inside the `span` tag also gets passed to `parse`, which forms the basis of a recursive HTML structure.

From here, it's pretty straightforward to transform this representation of HTML into actual HTML.

And there you have it! A very basic, but functional Markdown parser.
