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
 * The Kullna Editor is a small but feature-rich code editor for the web. It is designed to be
 * simple to use, but also powerful enough to be used in a wide variety of projects. It accomplishes
 * this flexibility by providing a simple API designed to be composable and extensible.
 *
 * This package contains the editor interface {@link KullnaEditor}, as well as the {@link Options}
 * interface, which is used to configure the editor via the {@link createEditor} function. If you haven't integrated the editor into your
 * project yet, see the [Quick Start](/pages/QUICK_START.html) for more information.
 *
 * ## Extending the Editor
 *
 * The editor has several primary extension points.
 *
 * 1. **{@link KullnaEditor} Events**:
 *    - {@link KullnaEditor.onUpdate}: Called when the text changes.
 *    - {@link KullnaEditor.onSelectionFocusChanged}: Called when the selection focus changes.
 * 2. **{@link Gutters} Management**:
 *    - {@link Gutters.GutterLineElement}: Represents a line in the editor's gutter.
 *    - {@link Gutters.GutterCustomizer}: Customizes the gutter appearance and behavior.
 * 3. **{@link Processors}**:
 *    - {@link Processors.InputProcessor}: Processes the editor's input.
 *    - {@link Processors.DefaultProcessors}: Contains default input processors.
 *    - {@link Text.TextDocument}: Represents the editor's text.
 *    - {@link Text.TextEditorViewKeyboardEvent}: Represents the editor's keyboard events.
 *
 * With these extension points, you can customize the way the editor handles input and what it does
 * when the text changes. You can also customize the gutter to your needs, including adding
 * tap-targets or icons for breakpoints.
 */

import {EditorOptions} from './internals/editor_options';
import {Editor} from './internals/editor';
import {DefaultProcessors} from './internals/pipeline';
import {KullnaEditor} from './kullna_editor';
import {Options} from './options';

export {KullnaEditor, Options};
export * as Text from './internals/text_editor';
export * as Gutters from './internals/gutter';
export * as Highlights from './internals/highlights';
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
 * import {createEditor} from '@kullna/editor';
 *
 * const editor = createEditor('#editor', {
 *   language: 'javascript',
 *   // This tells the editor to use Highlight.JS for syntax highlighting:
 *   highlightElement: hljs.highlightElement,
 *   // This tells the editor to show a gutter with line numbers and a border:
 *   gutter: {
 *     border: true,
 *     class: 'gutter'
 *   }
 * });
 * // Warning! Disabling spellcheck will disable spellcheck for the entire page.
 * editor.spellcheck = false;
 * editor.wrapsText = true;
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
    highlight: options.highlightElement,
    keydownPipeline,
    keyupPipeline: options.keyupPipeline ?? []
  };
  if (options.gutter) {
    editorOptions.gutter = options.gutter;
  }
  if (options.language) {
    editorOptions.language = options.language;
  }

  return new Editor(parent, editorOptions);
}
