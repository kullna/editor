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

// skipcq: JS-C1003: Wildcard Imports
import * as Gutter from './gutter';

/**
 * The `EditorOptions` interface specifies the options that can be
 * passed to the `Editor` constructor.
 */
export interface EditorOptions {
  /**
   * The `tab` option specifies the string that is inserted when the
   * user presses the tab key.
   */
  tab: string;
  /**
   * The `indentOn` option specifies a regular expression that is used
   * to determine whether the editor should indent the new line further
   * when the user presses the enter key.
   */
  indentOn: RegExp;
  /**
   * The `moveToNewLine` option specifies a regular expression that is
   * used to determine whether the editor should move the cursor to the
   * beginning of the next line when the user presses the enter key.
   */
  moveToNewLine: RegExp;
  /**
   * The `spellcheck` option specifies whether the editor should
   * spellcheck the text.
   */
  spellcheck: boolean;
  /**
   * The `catchTab` option specifies whether the editor should catch
   * the tab key and prevent it from moving focus to the next element
   * as well as allowing the user to indent the current line or insert
   * a tab character.
   * This setting is currently enabled by default.
   */
  catchTab: boolean;
  /**
   * Enabling `multilineIndentation` allows users to select blocks of
   * text and indent (or dedent) them with the tab (or shift-tab) key.
   * This setting is currently disabled by default.
   *
   * Note that this feature does not currently work with Firefox, and
   * will be disabled automatically if the browser does not support it.
   */
  multilineIndentation: boolean;
  /**
   * If `preserveIdent` is true, the editor will preserve the
   * indentation of the current line on the next line when pressing enter.
   */
  preserveIdent: boolean;
  /**
   * If `addClosing` is true, the editor will automatically add closing
   * brackets, quotes, etc. when typing.
   */
  addClosing: boolean;
  /**
   * If `history` is true, the editor will keep track of the user's
   * history and allow them to undo/redo changes.
   */
  history: boolean;
  /**
   * If `window` is defined, the editor will use the given window
   * instead of the global `window` object.
   */
  window: typeof window;
  /**
   * The `contentClass` option specifies the class name that is added
   * to the editor's content element.
   */
  contentClass: string;
  /**
   * The `gutter` option specifies options for the gutter and line
   * numbers.
   */
  gutter: Partial<Gutter.GutterOptions>;
  /**
   * The `language` option specifies the language that is used for
   * syntax highlighting. It does this by adding a class named "language-[language]"
   * to the editor's content element.
   */
  language: string;
  /**
   * The `highlight` option specifies a function that is called when
   * the editor is updated. The function is passed the editor element
   * and can be used to highlight the code.
   */
  highlight?: (e: HTMLElement) => void;
  /**
   * The `dir` option specifies the direction of prevailing script
   * used in the editor.
   */
  dir: 'ltr' | 'rtl';
}
