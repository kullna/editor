# Quick Start

## Basic Setup from CDN

### _css_

We recommend the use of the [Source Code Pro](https://fonts.google.com/specimen/Source+Code+Pro)
font for the editor.

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap"
/>
```

And Highlight.JS's Solarized Dark
[Theme](https://github.com/highlightjs/highlight.js/tree/main/src/styles):

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/base16/solarized-dark.min.css"
/>
```

And we'll style our editor DIV to look nice, and use an appropriate font for a code editor:

```html
<style>
  #editor {
    position: relative;
    min-height: 480px;
    min-width: 640px;

    background-color: #073642;

    font-family: 'Source Code Pro', monospace;
    font-size: 12px;
    line-height: 20px;

    border-radius: 10px;
  }

  #editor .gutter {
    background-color: #002b36;
    border-color: #93a1a1;
    color: #93a1a1;
  }
</style>
```

### _js_

We can get @kullna/editor and Highlight.JS from JSDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/@kullna/editor/dist/kullna-editor.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/highlight.min.js"></script>
```

### _html_

We need the element to hold the editor in the DOM:

```html
<div id="editor"></div>
```

### _init_

Initialize the editor, and set your options:

```js
const editor = KullnaEditor.createEditor('#editor', {
  language: 'javascript',
  // This tells the editor to use Highlight.JS for syntax highlighting:
  highlightElement: hljs.highlightElement,
  // This tells the editor to show a gutter with line numbers and a border:
  gutter: {
    border: true,
    class: 'gutter'
  }
});
// Warning! Disabling spellcheck will disable spellcheck for the entire page.
editor.spellcheck = false;
```

Set the code in the editor:

```js
editor.code = 'print("Hello, world!")';
```

Get notified when the code changes:

```js
editor.onUpdate(code => {
  console.log('Code updated:', code);
});
```

Print code on demand:

```js
console.log(editor.code);
```

Create a highlight:

```js
const highlight = editor.createHighlight();
highlight.cssClass = 'highlight';
highlight.lineNumber = 1;
highlight.visible = true;
```

💡 **Tip:** Check out the other options in the [Documentation](/interfaces/Options.html). Also,
check out [Processors](/modules/Processors.html) for handling keyboard events.

---

The Kullna Editor source, artifacts, and website content are **Copyright (c) 2023
[The Kullna Programming Language Project](https://www.kullna.org/).**

They are free to use and open-source under the terms of the
[GNU Lesser General Public License](https://www.gnu.org/licenses/lgpl-3.0).
