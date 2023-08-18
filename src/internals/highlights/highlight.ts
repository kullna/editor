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
 * # Highlight
 *
 * A highlight is a line number that is highlighted across the entire editor.
 *
 * Create a new highlight with `editor.createHighlight()` (see:
 * {@link KullnaEditor.createHighlight}}) and delete it with `highlight.delete()`.
 *
 * Assign a css class to the highlight with `highlight.cssClass` (see: {@link Highlight.cssClass}) to
 * determine things like what background color you'd like the highlight to have.
 *
 * Set the line number of the highlight with `highlight.lineNumber` (see:
 * {@link Highlight.lineNumber}). This will move the highlight to the new line number.
 *
 * Set the visibility of the highlight with `highlight.visible` (see: {@link Highlight.visible}).
 * This will show or hide the highlight.
 *
 * ## Example
 *
 * ```js
 * const highlight = editor.createHighlight();
 * highlight.cssClass = 'highlight';
 * highlight.lineNumber = 1;
 * highlight.visible = true;
 * ```
 *
 * ## Example CSS:
 *
 * ```css
 * .highlight {
 *   /* semi-transparent yellow highlight * /
 *   background-color: #b5890066;
 * }
 * ```
 */
export interface Highlight {
  /** The line number to highlight. */
  get lineNumber(): number;
  set lineNumber(lineNumber: number);

  /** Whether or not the highlight is visible. */
  get visible(): boolean;
  set visible(visible: boolean);

  /** The CSS class to apply to the highlight. */
  get cssClass(): string;
  set cssClass(cssClass: string);

  /** Deletes the highlight. */
  delete(): void;
}
