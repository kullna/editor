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
 * @packageDocumentation # Gutters
 *
 * Gutters are the vertical lines that appear to the left of the editor's text content (typically). They are used to
 * display line numbers, breakpoints, and other information.
 *
 * > `@kullna/editor` owns the process of creating and managing the dom elements inside the gutter.
 * > This is done because in the future we would like to use
 * > a more complex strategy for managing the gutter elements by reusing them and not creating
 * > new ones every time the editor's line count changes.
 * > To make this possible, we need to have full control over the gutter elements. We're also not
 * > sure how we want to handle line wrapping.
 * > But we are currently making the gutter the source of truth for "where a line is" in the
 * > editor. We need this for things like line numbers, and line highlighting.
 *
 * ## Customizing the gutter
 *
 * The gutter can be customized via CSS and JavaScript.
 *
 * ### Recommended CSS Settings
 *
 * The following CSS settings are recommended for the gutter. They set the background color, text
 * color, and border color (which is only visible if the gutter has a border.)
 *
 * ```css
 * background-color: #f0f0f0;
 * border-color: #d0d0d0;
 * color: #606060;
 * ```
 *
 * ### Customizing the Gutter via JavaScript
 *
 * In addition to CSS, the gutter can be customized via JavaScript. This is done by passing a
 * `GutterCustomizer` to the `renderGutterLine` option of {@link Options.gutter}. The
 * `GutterCustomizer` is a function that takes a `GutterLineElement` and mutates the DOM
 * to customize it. This allows for things like adding breakpoints, and other accessories to the gutter.
 *
 * See {@link GutterCustomizer} for more information.
 */

export {GutterLineElement} from './line';
export {GutterCustomizer} from './customizer';
