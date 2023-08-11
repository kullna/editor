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

import {type GutterOptions} from './gutter/options';
import {type InputProcessor} from './pipeline';
import {type TextDocument} from './text_editor';

/**
 * The `EditorOptions` interface specifies the options that can be passed to the `Editor`
 * constructor. Many of these are copies of properties from {@link Options} and {@link GutterOptions}
 * and are documented more extensively there.
 *
 * We pay the price of this duplication because we want to make the two interfaces independent of
 * each other. This way, we can change the `Options` interface without breaking the `Editor`
 * interface and vice versa.
 *
 * This allows us some flexibility in the future to change the `EditorOptions` interface without
 * breaking the public API of the library. Hopefully this is a fact that, while annoying, will be of
 * some comfort to you if you are here editing this file.
 */
export interface EditorOptions {
  /**
   * If `window` is defined, the editor will use the given window instead of the global `window`
   * object.
   *
   * @default 'Global window object'
   */
  window: Window;

  /** The `dir` option specifies the direction of prevailing script used in the editor. */
  dir: 'ltr' | 'rtl';

  /**
   * The `language` option specifies the language that is used for syntax highlighting. It does this
   * by adding a class named "language-[language]" to the editor's content element.
   *
   * @default 'text'
   */
  language: string;

  /**
   * The `spellcheck` option specifies whether the editor should spellcheck the text.
   *
   * @default false
   */
  spellcheck: boolean;

  /**
   * The amount of time in milliseconds to wait before calling the highlight function.
   *
   * @default 30
   */
  highlightDebounceMs: number;

  /**
   * The amount of time in milliseconds to wait before updating the undo/redo history when typing.
   *
   * @default 300
   */
  historyDebounceMs: number;

  /** The `gutter` option specifies options for the gutter and line numbers. */
  gutter?: Partial<GutterOptions>;

  /**
   * The `highlight` option specifies a function that is called when the editor is updated. The
   * function is passed the editor element and can be used to highlight the code.
   */
  highlight?: (e: HTMLElement) => void;

  /**
   * The `onUpdate` option specifies a function that is called when the editor is updated. The
   * function is passed the new code.
   *
   * @param code The new code.
   */
  onUpdate?: (code: string) => void;

  /**
   * The `onSelectionFocusChanged` option specifies a function that is called when the editor's
   * selection is updated. The function is passed the current document.
   *
   * @param document The current document.
   */
  onSelectionFocusChanged?: (document: TextDocument) => void;

  /** The keydown pipeline is a list of functions that are called when a keydown event is fired. */
  keydownPipeline?: InputProcessor[] | null;

  /** The keyup pipeline is a list of functions that are called when a keyup event is fired. */
  keyupPipeline?: InputProcessor[] | null;
}
