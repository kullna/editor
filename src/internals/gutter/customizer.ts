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

import {GutterLineElement} from './line';

/**
 * # Gutter Customization
 *
 * This is the type of function that can be passed to the Gutter options which provides you with
 * chance to customize gutter appearance.
 *
 * ## Inserting a Breakpoint
 *
 * To insert a breakpoint, you can use the following code:
 *
 * ```ts
 * (lineNumber: number, gutterLineElement: GutterLineElement) => {
 *   gutterLineElement.accessorySpan.removeAllChildren();
 *   if (lineNumber === 3) {
 *     const breakpoint = document.createElement('div');
 *     breakpoint.classList.add('breakpoint');
 *     gutterLineElement.accessorySpan.appendChild(breakpoint);
 *   }
 * };
 * ```
 *
 * @param lineNumber This is the actual index (+1) of the line in the text of the editor.
 * @param element The DOM elements representing the line number.
 */
export type GutterCustomizer = (lineNumber: number, element: GutterLineElement) => void;
