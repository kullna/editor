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

import {GutterOptions} from './options';

/**
 * The Gutter background.
 *
 * The gutter and its background are separate because one needs to appear above the highlights and
 * the other needs to appear below the highlights. If the highlights appear over the gutter, then
 * the gutter will not be clickable. But if the gutter appears over the highlights, then the
 * highlight will not extend to the edge of the editor. Removing the background entirely solves this
 * problem as well - but then we are forced to make the background of the editor element the gutter
 * background color - which is somewhat counterintuitive, and would leave us without a way to have a
 * border around the gutter.
 */
export class GutterBackground {
  /** The DOM element that represents the gutter. */
  readonly element: HTMLElement;

  /** The options that were used to create the gutter. */
  readonly options: GutterOptions;

  /**
   * Gets or sets the script direction of the gutter.
   *
   * @returns The script direction of the gutter.
   */
  get dir() {
    return this.options.dir;
  }
  set dir(value: 'ltr' | 'rtl') {
    this.options.dir = value;
    this.element.dir = value;
    this.refreshStyles();
  }

  /**
   * Gets or sets whether the gutter has a border or not.
   *
   * @returns Whether the gutter has a border or not.
   */
  get border(): boolean {
    return this.options.border;
  }
  set border(value: boolean) {
    this.options.border = value;
    this.refreshStyles();
  }

  /**
   * Gets or sets whether the gutter has a border or not.
   *
   * @returns Whether the gutter has a border or not.
   */
  get width(): string {
    return this.options.width;
  }
  set width(value: string) {
    this.options.width = value;
    this.refreshStyles();
  }

  constructor(opts: GutterOptions) {
    this.options = opts;
    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.top = '0px';
    this.element.style.bottom = '0px';
    this.element.style.overflow = 'hidden';
    this.refreshStyles();
  }

  /** Refreshes the styles of the gutter (reapplys the styles to the gutter elements). */
  private refreshStyles() {
    this.element.className = this.options.class ?? '';
    if (this.options.dir === 'ltr') {
      this.element.style.left = '0px';
      this.element.style.right = 'unset';
      this.element.style.textAlign = 'right';
      if (this.options.border) {
        this.element.style.borderRight = '1px solid';
        this.element.style.borderLeft = 'unset';
      } else {
        this.element.style.borderRight = 'unset';
        this.element.style.borderRight = 'unset';
      }
    } else {
      this.element.style.right = '0px';
      this.element.style.left = 'unset';
      this.element.style.textAlign = 'left';
      if (this.options.border) {
        this.element.style.borderLeft = '1px solid';
        this.element.style.borderRight = 'unset';
      } else {
        this.element.style.borderLeft = 'unset';
        this.element.style.borderRight = 'unset';
      }
    }
    this.element.style.width = this.options.width;
  }
}
