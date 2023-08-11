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

import {GutterCustomizer} from './internals/gutter';
import {InputProcessor} from './internals/pipeline';

export {type InputProcessor} from './internals/pipeline';

/**
 * # Options
 *
 * These are the options for configuring a new {@link KullnaEditor} when calling {@link createEditor}.
 *
 * 💡 **Note:** Additional options are available for configuring the editor after initialization.
 * See the documentation for {@link KullnaEditor} for more information.
 *
 * Below is a comprehensive example of how to use these options. All of these options are optional,
 * but they are included here for your reference:
 *
 * ```js
 * const element = document.getElementById('editor');
 * const editor = KullnaEditor.createEditor(element, {
 *     window,
 *     tab: '  ',
 *     language: 'javascript',
 *     highlightElement: hljs.highlightElement,
 *     dir: 'ltr',
 *     maxUndoHistory: 300,
 *     gutter: {
 *         width: '55px',
 *         dir: 'ltr',
 *         class: 'gutter',
 *         customizer: (line, element) => {
 *             // Customize the line numbers in the gutter
 *         },
 *     },
 *     onUpdate: () => {
 *         // Handle changes to the editor's text
 *     },
 *     // TODO: onCursorUpdate(document: TextDocument) => void { }
 *     tabProcessor: {
 *         replacement: DefaultProcessors.tab({...
 *         })
 *     },
 *     enterProcessor: {
 *         indentOn: /[({\[]$/,
 *         moveToNewLine: /^[)}\]]/,
 *         preserveIndentation: true,
 *         replacement ? : DefaultProcessors.enter({...
 *         })
 *     },
 *     keydownProcessor: {
 *         replacement: DefaultProcessors.keydown({...
 *         })
 *     }
 * });
 * ```
 */
export interface Options {
  /** If `window` is specified, the editor will use it instead of the global `window` object. */
  window: Window;

  /**
   * The `dir` option specifies the direction of the prevailing script in the editor. This is useful
   * for languages like Arabic which read right to left.
   *
   * 💡 **Note:** Most properties which can be set after initialization are generally not included
   * in the options, but this value is unlikely to change over the lifetime of the editor, so it is
   * included here even though it can be changed after initialization at will.
   */
  dir: 'ltr' | 'rtl';

  /**
   * The `tab` option specifies the string that is inserted when the user presses the tab key.
   *
   * 💡 **Note:** this value is used across many different processors, so it is included here. For
   * example, when the user presses the tab key, the tab processor inserts this value. When the user
   * presses the enter key, the newline processor inserts this value at the beginning of the new
   * line if the previous line ends with an open bracket. When we configure the default keydown
   * pipeline, we need this value to be consistent across all processors. So it has been "elevated"
   * from the processor configurations to here.
   */
  tab: string;

  /**
   * The syntax highlighting function. This function is called whenever the editor's text changes
   * and syntax highlighting needs to be re-applied.
   *
   * 💡 **Note:** Do not use this callback as a replacement for the `onChange` callback. The
   * highlight function may be deferred to a later time, and may not be called immediately after the
   * text changes. Use the `onChange` callback for that.
   *
   * 💡 **Note:** Currently the entire contents of the source will be available to the highlighter.
   * This may not remain true in the future, but we will add a setting to control this behavior if
   * it changes.
   *
   * @param element The element to highlight. Its textContents will be the source code to highlight.
   *   The function should replace the element's innerHTML with the highlighted source code.
   */
  highlightElement?: (element: HTMLElement) => void;

  /**
   * The maximum number of recent changes to keep in the history.
   *
   * **Default:** `300`
   */
  maxUndoHistory?: number;

  /** Settings for the Gutter. See {@link Gutters} */
  gutter?: {
    /**
     * The CSS class to apply to the gutter's DOM element.
     *
     * This is useful for applying styles to the gutter, such as background, foreground, and border
     * colors.
     */
    class?: string;

    /**
     * The width of the gutter as a CSS value (e.x.: `'55px'`)
     *
     * **Default:** `'55px'`.
     */
    width?: string;

    /**
     * Whether to show a border between the gutter and the editor's text.
     *
     * **Default:** `false`.
     */
    border?: boolean;

    /**
     * A function that is called for each line in the gutter. It is passed the line number and the
     * DOM element for the line. You may use this function to customize the line numbers in the
     * gutter.
     */
    renderGutterLine?: GutterCustomizer;
  };

  /**
   * When specified, all options related to default input processors will be ignored, and the
   * specified processors will be used instead.
   *
   * You may build your own pipelines by reusing the default processors, by writing your own, or by
   * writing your own which include the default processors.
   *
   * This pipeline handles keypresses before they have been inserted into the editor's text.
   */
  keydownPipeline?: InputProcessor[];

  /**
   * Like {@link keydownPipeline}, but handles keypresses after they have been inserted into the
   * editor's text.
   */
  keyupPipeline?: InputProcessor[];

  /**
   * The default keydown pipeline (see {@link Processors}) includes support for automatically
   * inserting custom tab characters when the user presses the tab key, for handling shift-tab to
   * unindent, and for handling multi-line tabbing.
   *
   * **TODO:** And for handling the backspace key at the beginning of a line.
   *
   * This processor can be excluded from the pipeline by setting the `enabled` option to `false`,
   * or, by specifying a replacement for the bracket processor.
   *
   * 💡 **Note:** These options are ignored if a custom {@link keydownPipeline} is being used.
   */
  tabProcessor: {
    /** The replacement for the tab processor. */
    replacement?: InputProcessor;

    /**
     * If `enabled` is true, the editor will insert custom tab characters when the user presses the
     * tab key, and handle shift-tab to unindent, as well as multi-line selections.
     *
     * **Default:** `true`.
     */
    enabled: boolean;
  };

  /**
   * The default keydown pipeline (see {@link Processors}) includes support for automatic
   * indentation, and for inserting additional indentation when the preceeding line ends with an
   * open bracket. There is also support for moving text after the cursor to the next line when the
   * user presses the enter key. This is useful for automatically converting the closing bracket to
   * the next line. These functions are implemented in {@link DefaultProcessors#enterProcessor}.
   *
   * The characters (or sequence of characters) which trigger indentation are specified by the
   * `indentOn` option.
   *
   * The characters (or sequence of characters) which trigger automatically moving following text to
   * the next line are specified by the `moveToNewLine` option.
   *
   * This processor can be excluded from the pipeline by setting the `enabled` option to `false`,
   * or, by specifying a replacement for the bracket processor.
   *
   * 💡 **Note:** These options are ignored if a custom {@link keydownPipeline} is being used.
   */
  newlineProcessor: {
    /** The replacement for the newline processor. */
    replacement?: InputProcessor;

    /**
     * If `enabled` is true, the editor will preserve the indentation of the current line on the
     * next line when pressing enter.
     *
     * **Default:** `true`.
     */
    enabled: boolean;

    /**
     * The `incrementIndentationOn` option specifies a regular expression that is used to determine
     * whether the editor should indent the new line further when the user presses the enter key.
     *
     * Typically this is open brackets, but it can be any character or sequence of characters.
     *
     * **Default:** `/[({[]$/`
     */
    incrementIndentationOn?: RegExp;

    /**
     * The `moveToNewLine` option specifies a regular expression that is used to determine whether
     * the editor should move the cursor to the beginning of the next line when the user presses the
     * enter key.
     *
     * Typically this is closing brackets, but it can be any character or sequence of characters.
     *
     * **Default:** `/^[)}\]]/`
     */
    moveToNewLine?: RegExp;
  };

  /**
   * The default keydown pipeline (see {@link Processors}) includes support for inserting closing
   * brackets and for "typing over" closing brackets. These functions are implemented by the
   * `bracketProcessor` in {@link Processors.DefaultProcessors}.
   *
   * This processor can be excluded from the pipeline by setting the `enabled` option to `false`,
   * or, by specifying a replacement for the bracket processor.
   *
   * 💡 **Note:** These options are ignored if a custom {@link keydownPipeline} is being used.
   */
  bracketProcessor: {
    /** The replacement for the bracket processor. */
    replacement?: InputProcessor;

    /**
     * If `true`, the editor will automatically add closing brackets, quotes, etc. when typing, and
     * will "type-over" closing brackets, quotes, etc.
     *
     * **Default:** `true`.
     */
    enabled: boolean;
  };
}
