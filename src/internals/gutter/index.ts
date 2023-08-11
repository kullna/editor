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
 * Gutters, typically seen as vertical lines on the left of an editor's text,
 * serve to display line numbers, breakpoints, and other pertinent details.
 *
 * ## Customizing the Gutter
 *
 * You can tailor the gutter using both CSS and JavaScript.
 *
 * ### CSS Customization
 *
 * We recommend the following settings for the gutter, defining its background, text,
 * and border colors:
 *
 * ```css
 * background-color: #f0f0f0;
 * border-color: #d0d0d0;
 * color: #606060;
 * ```
 *
 * ### JavaScript Customization
 *
 * Beyond CSS, you can modify the gutter using JavaScript. This is achieved by providing a `GutterCustomizer` to the `renderGutterLine` option within {@link Options.gutter}. This function lets you modify the `GutterLineElement` in the DOM, facilitating additions like breakpoints and other gutter features.
 *
 * For additional details, refer to {@link GutterCustomizer}.
 *
 * ## Development Notes
 *
 * 💡 **Note:** **Management by `@kullna/editor`**: The editor handles creating and maintaining
 *  the DOM elements within the gutter. This approach anticipates future optimization
 * where we aim to manage gutter elements more efficiently by reusing them, rather than
 *  creating new ones every time the line count in the editor changes. This strategy
 * requires the editor to have complete control over these gutter elements. Presently,
 * the gutter also determines the line's location within the editor, crucial for line
 * numbers and highlighting - however, this source of truth will shift to the internals
 * of the selection bridge in the future, as it knows the line's location within the
 * editor already, and defininitively.
 */

export {GutterLineElement} from './line';
export {GutterCustomizer} from './customizer';
