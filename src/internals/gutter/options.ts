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

import {GutterCustomizer} from './customizer';

/** Options for the gutter which contains line numbers and their accessories. */
export interface GutterOptions {
  /** The width of the gutter. */
  width: string;

  /** The side of the editor to place the gutter on. */
  dir: 'ltr' | 'rtl';

  /**
   * A class to add to the gutter div in the DOM.
   *
   * @remarks
   *   The dir is always set to 'ltr' or 'rtl' depending on the editor's direction because we don't
   *   want the document's direction to change the gutter's direction. LTR code is always read left
   *   to right, and RTL code is always read right to left. This is true regardless of the
   *   document's direction.
   */
  class?: string;

  /** Whether or not to show a border on the gutter. */
  border: boolean;

  /** A function that can be used to customize the gutter line numbers (and their accessories). */
  renderGutterLine?: GutterCustomizer;
}
