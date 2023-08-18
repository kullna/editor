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
 * #editor .gutter {
 *   background-color: #002b36;
 *   border-color: #93a1a1;
 *   color: #93a1a1;
 * }
 * ```
 *
 * Set the class the gutter uses by providing a `class` option to {@link Options.gutter}:
 *
 * ```js
 * const editor = createEditor('#editor', {
 *   gutter: {
 *     class: 'gutter'
 *   }
 * });
 * ```
 *
 * To customize the width of the gutter, use the Javascript API:
 *
 * ```js
 * const editor = createEditor('#editor', {
 *   gutter: {
 *     width: '100px'
 *   }
 * });
 * ```
 *
 * ### JavaScript Customization
 *
 * Beyond CSS, you can modify the gutter using JavaScript. This is achieved by providing a `GutterCustomizer` to the `renderGutterLine` option within {@link Options.gutter}. This function lets you modify the `GutterLineElement` in the DOM, facilitating additions like breakpoints and other gutter features.
 *
 * For additional details, including examples, refer to {@link GutterCustomizer}.
 */

export {GutterLineElement} from './line';
export {GutterCustomizer} from './customizer';
