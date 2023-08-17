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

import {Highlight} from './internals/highlights';
import {TextDocument} from './internals/text_editor';

/**
 * # Kullna Editor
 *
 * ## A small but feature-rich code editor for the web.
 *
 * Create a new editor instance using the {@link createEditor} function, passing in a CSS selector
 * and an {@link Options} object.
 *
 * ```js
 * import {createEditor} from '@kullna/editor';
 *
 * const editor = createEditor('#editor', {
 *   language: 'javascript',
 *   highlightElement: hljs.highlightElement
 * });
 * editor.spellcheck = false;
 * editor.code = 'print("Hello, world!")';
 * ```
 *
 * See the Package Documentation {@link @kullna/editor} for more information.
 */
export interface KullnaEditor {
  /** Gets or sets the current text content of the editor. */
  get code(): string;
  set code(code: string);

  /** Gets or sets the text of the document along with the selection information. */
  get document(): TextDocument;
  set document(document: TextDocument);

  /**
   * Changes the function to be called when the editor's text content is updated.
   *
   * @param callback The callback to invoke when the editor's text content is updated. The callback
   *   is not invoked when the editor's text content is updated via the `code` property.
   */
  onUpdate(callback: (code: string) => void): void;

  /**
   * Changes the function to be called when the editor's selection is updated.
   *
   * @param callback The callback to invoke when the editor's selection is updated. The callback is
   *   not invoked when the editor's selection is updated via the `code` property.
   */
  onSelectionFocusChanged(callback: (document: TextDocument) => void): void;

  /** Creates a new highlight (a bar over top of an entire line). */
  createHighlight(): Highlight;

  /** Determines whether the editor wraps text or allows it to scroll horizontally. */
  get wrapsText(): boolean;
  set wrapsText(wrapsText: boolean);

  /**
   * Gets or sets whether spellchecking is enabled.
   *
   * 💡 **Note:** This isn't set to `false` by default because the implementation changes the
   * setting document-wide, and we think it's important you know that. This is also why it's not
   * part of the settings. We want you to set it explicitly.
   *
   * **Default:** `true`.
   */
  get spellcheck(): boolean;
  set spellcheck(spellcheck: boolean);

  /** Gets or sets whether the editor is readonly. */
  get readonly(): boolean;
  set readonly(readonly: boolean);

  /**
   * The programming language of the editor's content. This is used to determine the syntax
   * highlighting strategy by common libraries like Highlight.js and Prism.js.
   */
  get language(): string;
  set language(language: string);

  /** Gets or sets the direction of the editor (LTR or RTL). */
  get dir(): string;
  set dir(dir: string);

  /**
   * Marks a line as invalid, causing the gutter to re-render it, potentially with new
   * customizations. See: {@link Gutters.GutterCustomizer}
   */
  invalidateGutterLine(line: number): void;

  /** Removes elements from the DOM and releases all DOM event hooks. */
  destroy(): void;
}
