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
 * @packageDocumentation # Gutters (Dev Version)
 *
 * The Gutter handles creating and maintaining
 * the DOM elements within the gutter. This approach anticipates future optimization
 * where we aim to manage gutter elements more efficiently by reusing them, rather than
 *  creating new ones every time the line count in the editor changes. This strategy
 * requires the editor to have complete control over these gutter elements.
 */
export {GutterLineElement} from './line';
export {GutterCustomizer} from './customizer';
export {Gutter} from './gutter';
export {GutterOptions} from './options';
