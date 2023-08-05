/* Kullna Editor - A small but feature-rich code editor for the web
   Copyright (C) 2022-2023 The Kullna Programming Language Project

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>. */

/**
 * @packageDocumentation # @kullna/editor Documentation
 *
 * Welcome to the documentation for the Kullna Editor!
 *
 * Here you can learn how to customize the editor for use in your own projects.
 *
 * ## Overview
 *
 * The Kullna Editor is a small but feature-rich code editor for the web. It is designed to be
 * simple to use, but also powerful enough to be used in a wide variety of projects. It accomplishes
 * this flexibility by providing a simple API designed to be composable and extensible.
 *
 * This package contains the editor interface {@link KullnaEditor}, as well as the {@link Options}
 * interface, which is used to configure the editor. If you haven't integrated the editor into your
 * project yet, see the {@link KullnaEditor} interface for more information.
 *
 * ## Extending the Editor
 *
 * There are three primary sub-packages:
 *
 * - **{@link Text}** - This package contains the {@link Text.TextDocument} class, which is used to
 *  represent the text in the editor, as well as the {@link Text.TextEditorKeyboardEvent} class,
 * which is used to represent keyboard events in the editor.
 * - **{@link Gutters}** - This package contains the {@link Gutters.GutterLineElement} class, which
 * is used to represent a line in the gutter, as well as the {@link Gutters.GutterCustomizer} class,
 * which is used to customize the gutter.
 * - **{@link Processors}** - This package contains the {@link Processors.InputProcessor} class,
 * which is used to process input in the editor, as well as the {@link Processors.DefaultProcessors}
 * class, which contains the default input processors.
 *
 * ## Customizing the Editor
 *
 * There are two primary ways to customize the editor:
 *
 * - **{@link InputProcessor}** - Input processors are used to process keyboard input in the
 * editor. For example, the {@link DefaultProcessors.TabProcessor} class is used to process the
 * tab key.
 *
 *
 * ## Features
 *
 * **Syntax highlighting**
 *
 * Supply a function with the signature: `(element: HTMLElement) => void` to highlight the content
 * of an element and Kullna Editor will call your function at the right time. See:
 * {@link Options.highlightElement}.
 *
 * 💡 **Note:** This approach is compatible with most syntax highlighting libraries, which usually
 * expose a function that mutates the HTML content of an element with the same function signature.
 * For example, the `highlightElement` function in Highlight.JS.
 *
 * - [Highlight.js API](https://highlightjs.readthedocs.io/en/latest/api.html#highlightelement)
 * - [Prism.js API](https://prismjs.com/docs/Prism.html#.highlightElement)
 *
 * **Undo/Redo**
 *
 * Set the {@link Options.maxUndoHistory} option to configure the number of undo/redo levels.
 *
 * **Cut-Copy-Paste**
 *
 * Cutting, copying, and pasting text work as expected across browsers in an XSS-safe manner.
 *
 * The editor will capture the cut, copy, and paste events and handle them in a way that is
 * consistent across browsers. The editor will also handle the clipboard events in a way that is
 * safe against XSS attacks.
 *
 * 💡 **Note:** The keydown pipeline is not invoked for cut, copy, and paste events. See
 * {@link Processors} for more information.
 *
 * **Bracket Management**
 *
 * Automatically insert closing brackets and quotes, and type-over them seamlessly.
 *
 * The `bracketProcessor` of {@link Processors.DefaultProcessors} is part of the default keydown
 * pipeline. It will automatically insert closing brackets and quotes, and type-over them
 * seamlessly.
 *
 * At initialization time, {@link Options.bracketProcessor} allows this logic to be replaced or
 * extended by supplying a custom {@link Processors.InputProcessor}, customized, or disabled
 * altogether by setting the `enabled` property of to `false`.
 *
 * **Code Indentation**
 *
 * | Indent or unindent lines of code with the tab and shift-tab keys.
 *
 * The `tabProcessor` and `newlineProcessor` of {@link Processors.DefaultProcessors} are part of the
 * default keydown pipeline.
 *
 * The `tabProcessor` will automatically indent or unindent lines of code with the tab and shift-tab
 * keys, including multi-line selections. At initialization time, {@link Options.tabProcessor} allows
 * this logic to be replaced or extended by supplying a custom {@link Processors.InputProcessor},
 * customized, or disabled altogether by setting the `enabled` property of to `false`.
 *
 * The `newlineProcessor` will automatically indent the next line, and possibly move closing
 * brackets to the next line, when the enter key is pressed. At initialization time,
 * {@link Options.newlineProcessor} allows this logic to be replaced or extended by supplying a
 * custom {@link Processors.InputProcessor}, customized, or disabled altogether by setting the
 * `enabled` property of to `false`.
 *
 * **Line Highlighting**
 *
 * **Customizable Gutter**
 *
 * We own the strategy for rendering the gutter - allowing us to continuously improve the
 * foundational features of the editor over time - but you own the rendering of the content. This
 * allows you to customize the gutter to your needs - whether that include tap-targets or icon for
 * breakpoints. The gutter is also fully RTL-aware.
 *
 * **Flexibility**
 *
 * Embed your logic for input events, like auto-complete or inline help.
 *
 * **Full RTL Support**
 *
 * The editor is fully RTL-aware, including the gutter. Setting {@link Options.dir} to `'rtl'` will
 * enable RTL support and cause the editor to render in RTL mode.
 */

import {EditorOptions} from './internals/editor_options';
import {Editor} from './internals/editor';
import {DefaultProcessors} from './internals/pipeline';
import {KullnaEditor} from './kullna_editor';
import {Options} from './options';

export {KullnaEditor, Options};
export * as Text from './internals/text_editor';
export * as Gutters from './internals/gutter';
export * as Processors from './internals/pipeline';

/** The default value for "tab" in {@link Options}. */
const DEFAULT_TAB_CHARACTERS = '  ';

/**
 * # KullnaEditor.createEditor(element, options)
 *
 * Creates a new {@link KullnaEditor} instance.
 *
 * Here is a typical example of how to create an editor:
 *
 * ```js
 * const editor = KullnaEditor.createEditor('#editor', {
 *   language: 'javascript',
 *   highlightElement: hljs.highlightElement
 * });
 * editor.spellcheck = false;
 * editor.code = 'console.log("Hello, world!");';
 * ```
 *
 * For a list of features and options you can change after creating the editor, see the
 * {@link KullnaEditor} interface.
 *
 * For a comprehensive examples of the options and how to use them, see the {@link Options}
 * interface.
 *
 * @param selectorOrElement The parent element into which the editor's contents will be isnerted.
 * @param opt Options for the editor.
 * @returns A new {@link KullnaEditor} instance.
 */
export function createEditor(
  selectorOrElement: HTMLElement | string,
  opt: Partial<Options> = {}
): KullnaEditor {
  const options: Options = {
    window,
    dir: 'ltr',
    // skipcq: JS-0321
    highlightElement: () => {},
    tab: DEFAULT_TAB_CHARACTERS,
    tabProcessor: {
      enabled: true
    },
    newlineProcessor: {
      enabled: true
    },
    bracketProcessor: {
      enabled: true
    },
    gutter: {},
    ...opt
  };

  if (!selectorOrElement) {
    throw Error('KullnaEditor expects a selector or element as first parameter.');
  }

  let parent: HTMLElement | null;
  if (typeof selectorOrElement === 'string') {
    parent = document.querySelector(selectorOrElement);
  } else {
    parent = selectorOrElement;
  }

  if (parent === null) {
    throw Error('Could not resolve the selector passed to KullnaEditor.');
  }

  let keydownPipeline = [];
  if (options.keydownPipeline) {
    keydownPipeline = options.keydownPipeline;
  } else {
    if (options.tabProcessor.enabled) {
      keydownPipeline.push(
        options.tabProcessor.replacement ??
          DefaultProcessors.tabProcessor({tab: options.tab, ...options.tabProcessor})
      );
    }
    if (options.newlineProcessor.enabled) {
      keydownPipeline.push(
        options.newlineProcessor.replacement ??
          DefaultProcessors.newlineProcessor({tab: options.tab, ...options.newlineProcessor})
      );
    }
    if (options.bracketProcessor.enabled) {
      keydownPipeline.push(
        options.bracketProcessor.replacement ?? DefaultProcessors.bracketProcessor()
      );
    }
  }

  const editorOptions: Partial<EditorOptions> = {
    window: options.window,
    dir: options.dir,
    gutter: {
      ...options.gutter
    },
    highlight: options.highlightElement,
    keydownPipeline,
    keyupPipeline: options.keyupPipeline ?? []
  };

  return new Editor(parent, editorOptions);
}
