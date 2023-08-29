<p align="center"><a href="https://editor.kullna.org/"><img src="https://www.kullna.org/brand/logo.svg" width="150"></a></p>
<h1 align="center">@kullna/editor</h1>
<h3 align="center">A small but feature-rich code editor for the web</h3>
<p align="center"><img src="https://editor.kullna.org/assets/images/screenshot.png" style="image-rendering: pixelated;" width="698" alt="screenshot"></p>
<p align="center">
    <a href="https://editor.kullna.org/demo.html">🔍 Demos</a> •
    <a href="https://editor.kullna.org/modules.html">📖 Docs</a> •
    <a href="https://editor.kullna.org/pages/CONTRIBUTING.html">🙌 Contribute</a>
</p>
<p align="center">
    <a href="https://github.com/kullna/editor">
        <img src="https://img.shields.io/badge/GitHub-Open_Source-d33682" alt="@kullna/editor on GitHub">
    </a>
</p>
<p align="center">
    <a href="https://cdn.jsdelivr.net/npm/@kullna/editor/dist/kullna-editor.min.js">
        <img src="https://img.shields.io/badge/CDN-JSDelivr-2aa198" alt="CDN">
    </a>
    <a href="https://www.npmjs.com/package/@kullna/editor">
        <img src="https://img.shields.io/npm/v/@kullna/editor?color=dc322f" alt="npm">
    </a>
<a href="https://app.fossa.com/projects/git%2Bgithub.com%2Fkullna%2Feditor?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2Fkullna%2Feditor.svg?type=shield"/></a>
    <img src="https://deno.bundlejs.com/?q=@kullna/editor&badge=small" alt="npm bundle size">
    <a href="https://www.gnu.org/licenses/lgpl-3.0">
        <img src="https://img.shields.io/badge/License-LGPL_v3-b58900.svg" alt="License: LGPL v3">
    </a>
    <a href="https://www.codefactor.io/repository/github/kullna/editor">
        <img src="https://www.codefactor.io/repository/github/kullna/editor/badge" alt="CodeFactor">
    </a>
    <a href="https://discord.kullna.org/">
        <img src="https://img.shields.io/badge/Join-Discord-6c71c4" alt="Join us on Discord">
    </a>
</p>
<p><br/></p>

`@kullna/editor` is a browser-based code editor component developed and maintained by
[The Kullna Programming Language Project](http://www.kullna.org/).

As we were working on the Kullna IDE, we found the need for a reliable `contenteditable` code
editing surface with features like syntax highlighting, indentation management, line highlighting,
and a customizable gutter for adding breakpoints and bookmarks. For us, an essential requirement was
support for Right-to-Left (RTL) languages too.

Most of the existing editors were either too heavy and didn't work with RTL, or too simple and
didn't include sufficient features for our needs. We wanted a simple yet versatile editor that we
could easily extend to meet our specific needs, and which didn't break foundational features like
RTL support in the process. One that, if we needed to, we could maintain ourselves.

To address this gap, we're introducing `@kullna/editor`. A simple yet versatile code editor,
designed with extensibility in mind and built-in RTL support. If you're looking for a lightweight
code editor for your web application, we hope you'll find `@kullna/editor` useful, and we welcome
your feedback and contributions.


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fkullna%2Feditor.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fkullna%2Feditor?ref=badge_large)

## Features

- 🎨 **Syntax Highlighting**: Integrate with Highlight.JS, Prism, or design your custom solution.
- ⏪ **Undo/Redo**: Offers customizable undo/redo levels.
- ✂️ **Copy-Paste**: Ensure consistent cross-browser cut, copy, and paste operations in an
  XSS-secure way.
- 🎁 **Wrapping**: Wrap text, and keep line numbers and highlights in sync.
- 🖊️ **Bracket Management**: Automatic close-bracket and close-quote insertion, with type-over
  capability.
- ➡️ **Code Indentation**: Flexible code indentation using tab or shift-tab. Supports multi-line
  selections.
- 🧐 **Active Line Highlighting**: Spotlight the active line or indicate the debugger's current
  execution point.
- 🔧 **Customizable Gutter**: Define your gutter contents like breakpoint or bookmark labels while
  benefiting from our rendering strategies.
- 🖱️ **Input Processors**: Intuitive APIs designed to allow you to extend the input processing logic
  to meet your needs.
- 🌍 **Full RTL Support**: Dedicated support for right-to-left languages.

## Why @kullna/editor?

- 🎯 **Just Right**: Striking a balance between simplicity and flexibility.
- 🌐 **Modern APIs**: No more browser compatibility headaches.
- 📚 **Flexibility**: Integrate auto-complete, inline help, or other custom input event logic.
- 🚀 **Active Maintenance**: Continuously developed for the Kullna IDE.
- 💪 **RTL & I18N**: Comprehensive support without compromise.
- 👥 **Join Us**: We're open to contributions!

## Contribute

We envision a community-driven evolution for `@kullna/editor`. Your feedback, ideas, and
contributions can shape the future of this editor, making it even more versatile and user-friendly.
If our vision resonates with yours, consider contributing.

👉 [Read the Contributing Page](https://editor.kullna.org/pages/CONTRIBUTING.html) for more details.

---

The Kullna Editor source, artifacts, and website content are **Copyright (c) 2023
[The Kullna Programming Language Project](https://www.kullna.org/).**

They are free to use and open-source under the terms of the
[GNU Lesser General Public License](https://www.gnu.org/licenses/lgpl-3.0).