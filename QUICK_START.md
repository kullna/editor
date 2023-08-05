# Quick Start

## Basic Setup from CDN

### _css_

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/base16/solarized-dark.min.css"
/>
```

### _js_

```html
<script src="https://cdn.jsdelivr.net/npm/@kullna/editor/dist/kullna-editor.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/highlight.min.js"></script>
```

### _html_

```html
<div id="editor"></div>
```

### _init_

```js
const editor = KullnaEditor.createEditor('#editor', {
  language: 'javascript',
  highlightElement: hljs.highlightElement
});
editor.spellcheck = false;
editor.code = 'print("Hello, world!")';
```

💡 **Tip:** Check out the other options in the [Documentation](/interfaces/Options.html).

## Styling

We recommend the use of the [Source Code Pro](https://fonts.google.com/specimen/Source+Code+Pro)
font for the editor. You can include it in your page like this:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap"
/>
```

We are also partial to Highlight.js's Solarized Dark theme for syntax highlighting. You can include
it in your page like this:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/base16/solarized-dark.min.css"
/>
```

Finally, we like the following styles for a small embedded editor. This example gives you a good
starting point for customizing the editor to your needs:

```html
<style>
  .editor {
    border-radius: 6px;
    font-family: 'Source Code Pro', monospace;
    font-size: 14px;
    font-weight: 400;
    min-height: 240px;
    line-height: 20px;
  }

  .editor > div {
    padding: 10px;
  }

  .gutter {
    background-color: #002b36;
    color: #839496;
  }
</style>
```

## Use with Highlight.js

### _css_

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/base16/solarized-dark.min.css"
/>
```

### _js_

```html
<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/highlight.min.js"></script>
```

### _init_

```js
const editor = KullnaEditor.createEditor(editorElement, {
  language: 'javascript',
  highlightElement: hljs.highlightElement
});
```

## Use with Prism.js

### _css_

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css" />
```

### _js_

```html
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
```

### _init_

```js
const editor = KullnaEditor.createEditor(editorElement, {
  language: 'javascript',
  highlightElement: Prism.highlightElement
});
```
