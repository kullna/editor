<p align="center"><a href="https://editor.kullna.org/"><img src="https://www.kullna.org/brand/logo.svg" width="150"></a></p>
<h1 align="center">@kullna/editor</h1>
<h3 align="center">A small but feature-rich code editor for the web</h3>

<p align="center"><a href="/">Home</a></p>

# `Editor`

Create a new editor instance using the `KullnaEditor.createEditor(editorElement, options)` method.

Here is an example of how to create a new editor instance, with each of the available options:

```js
const element = document.getElementById('editor');
const editor = KullnaEditor.createEditor(element, {
  tab: '  ',
  indentOn: /[({\[]$/,
  moveToNewLine: /^[)}\]]/,
  spellcheck: false,
  catchTab: true,
  multilineIndentation: false,
  preserveIndent: true,
  addClosing: true,
  history: true,
  window: window,
  highlight: editorTextElement => {
    const code = editorTextElement.textContent;
    code = code.replace('foo', '<span style="color: red">foo</span>');
    editorTextElement.innerHTML = code;
  },
  gutter: {
    width: '55px',
    dir: 'ltr',
    class: 'gutter',
    customizer: (line, element) => {
      element.gutterLineWrapper.classList.add('gutter-line-wrapper');
      element.lineNumberSpan.classList.add('line-number');
      element.accessorySpan.classList.add('accessory');
    }
  }
});
```

You can call the following methods on the editor instance:

## `updateCode(string)`

Updates the text displayed by the editor.

```js
editor.updateCode(`Console.write(line: "Hello, Kullna!")`);
```

## `onUpdate((code: string) => void)`

Callers may supply a function to be invoked whenever the code is updated by the user.

> 💡 **Tip:** The callback is not invoked in response to an invocation of the `updateCode` method.

```js
editor.onUpdate(code => {
  console.log(code);
});
```

## `toString(): string`

Return current code as plain text.

```js
const code = editor.toString();
```

## `destroy()`

Removes event listeners from the DOM.

```js
editor.destroy();
```

# `EditorOptions`

- `tab: string` replaces "tabs" with given string. Default: `\t`.
  - Note: use css rule `tab-size` to customize size.
- `indentOn: RegExp` allows auto indent rule to be customized. Default `/[({\[]$/`.
- `moveToNewLine: RegExp` checks if an extra newline character needs to be added. Default
  `/^[)}]]/`.
- `spellcheck: boolean` enables spell-checking on the editor. Default `false`.
- `catchTab: boolean` intercept Tab keypress and use custom indentation logic. Default: `true`.
- `multilineIndentation: boolean` enables support for indenting (or dedenting) multiple highlighted
  lines at once. Default `false`.
- `preserveIndent: boolean` keep the current indentation level when beginning a new line. Default
  `true`.
- `addClosing: boolean` automatically add closing brackets, quotes. Default `true`.
- `history` maintain undo/redo history. Default `true`.
- `window` window object. Default: `window`.
- `highlight: (element: HTMLElement) => void` a function that can be used to highlight the code.
  Default: `undefined`.
- `gutter: GutterOptions` options for the gutter. Default: `undefined`.

> 💡 **Tip:** The `highlight` parameter accepts a highlighting function whose signature is
> compatible with popular syntax highlighting libraries such as Prism.js, highlight.js, etc. See the
> special sections below for information on integrating with either.

# `GutterOptions`

- `width: string`: The width of the gutter. Default: `55px`.
- `dir: 'ltr' | 'rtl'`: The side of the editor to place the gutter on. Default: `ltr`.
- `class: string`: A class to add to the gutter div in the DOM. Default: `undefined`.
- `customizer: GutterLineNumberCustomizer`: A function that can be used to customize each gutter
  line.

---

# Use with Highlight.js

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/base16/solarized-dark.min.css"
/>
```

```html
<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/highlight.min.js"></script>
```

```js
const editor = KullnaEditor.createEditor(editorElement, {
  language: 'javascript',
  highlight: hljs.highlightElement
});
```

# Use with Prism.js

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css" />
```

```html
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
```

```js
const editor = KullnaEditor.createEditor(editorElement, {
  language: 'javascript',
  highlight: Prism.highlightElement
});
```

---

_The Kullna Editor source, artifacts, and website content are **Copyright (c) 2023 The Kullna
Programming Language Project.** They are free to use and open-source under the terms of the
[GNU Lesser General Public License](https://www.gnu.org/licenses/lgpl-3.0)._

_Portions of this library are [Copyright (c) 2020 Anton Medvedev and others](NOTICE.md) and used
under the terms of the MIT License_
