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
 * ## Example: Inserting a Breakpoint
 *
 * To insert a breakpoint, you can use the following code:
 *
 * ```css
 * .breakpoint {
 *   background-color: var(--sd-red);
 *   display: inline-flex;
 *   border-radius: 50%;
 *   width: 0.8em;
 *   height: 0.8em;
 * }
 * ```
 *
 * In the call to {@link createEditor}, you can then pass the following {@link Options.gutter} option:
 *
 * ```ts
 * gutter: {
 *   renderGutterLine: (lineNumber: number, gutterLineElement: GutterLineElement) => {
 *     // Remove any existing children so that we don't add multiple breakpoints.
 *     // And don't have breakpoints where they shouldn't be.
 *     gutterLineElement.accessorySpan.removeAllChildren();
 *
 *     // Insert a breakpoint on line 3.
 *     if (lineNumber === 3) {
 *       const breakpoint = document.createElement('div');
 *       breakpoint.classList.add('breakpoint');
 *       gutterLineElement.accessorySpan.appendChild(breakpoint);
 *     }
 *   };
 * }
 * ```
 *
 * ## Example: Click Handler
 *
 * In the call to {@link createEditor}, you can then pass the following {@link Options.gutter} option:
 *
 * ```ts
 * gutter: {
 *   renderGutterLine: (lineNumber: number, gutterLineElement: GutterLineElement) => {
 *     // Remove any previous click handlers (not implemented here.)
 *     gutterLineElement.gutterLineWrapper.addEventListener('click', () => {
 *       // Do something when the gutter line is clicked.
 *     });
 *   };
 * }
 * ```
 *
 * For an overview of gutter customization, see {@link Gutters}.
 *
 * For details about gutter line elements, see {@link GutterLineElement}.
 *
 * @param lineNumber This is the actual index (+1) of the line in the text of the editor.
 * @param element The DOM elements representing the line number.
 */
export type GutterCustomizer = (lineNumber: number, element: GutterLineElement) => void;
