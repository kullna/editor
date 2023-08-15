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

import {LineMetric} from '../text_editor/line_metric';
import {GutterCustomizer} from './customizer';
import {GutterLineElement} from './line';
import {GutterOptions} from './options';

/** The default script direction for the gutter. */
const DEFAULT_DIR = 'ltr';

/** The default CSS class for the gutter. */
const DEFAULT_CLASS = 'gutter';

/** The default width for the gutter. */
const DEFAULT_WIDTH = '60px';

/**
 * The Gutter interface represents the gutter in the DOM which contains line numbers and their
 * accessories.
 */
export class Gutter {
  /** The DOM element that represents the gutter. */
  readonly element: HTMLElement;

  /** The options that were used to create the gutter. */
  readonly options: GutterOptions;

  /** The total number of lines with elements. */
  private lineCount: number = 0;

  /**
   * Sets the number of lines in the gutter.
   *
   * Should be called whenther the number of lines in the source text changes.
   *
   * @param count The number of lines in the source text.
   */
  setNumberOfLines(count: number) {
    this.lineCount = Math.max(1, count);
    setNumberOfLines(this.element, this.lineCount, this.options.renderGutterLine);
    this.refreshStyles();
  }

  /**
   * Sets the scroll top of the gutter.
   *
   * @param scrollTop The scroll top of the gutter.
   */
  setScrollTop(scrollTop: number): void {
    this.element.style.top = `-${scrollTop}px`;
    this.refreshStyles();
  }

  /**
   * Updates the highlights with new line information.
   *
   * @param metrics The new line metrics.
   */
  updateLineMetrics(metrics: LineMetric[]) {
    this.setNumberOfLines(metrics.length);
    for (let i = 0; i < metrics.length; i++) {
      const line = metrics[i];
      const gutterLine = this.referenceElementForLineNumber(i + 1);
      if (gutterLine !== null) {
        gutterLine.style.top = `${line.top}px`;
        gutterLine.style.height = `${line.height}px`;
      }
    }
  }

  /**
   * Used to update the content of the line number span for a given line.
   *
   * @remarks
   *   Should be called whenever the client wants to add or remove an accessory.
   * @param lineNumber The line number to update.
   */
  updateLineNumber(lineNumber: number) {
    if (this.options.renderGutterLine === undefined) {
      return;
    }
    updateLineNumber(this.element, lineNumber, this.options.renderGutterLine);
  }

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
    setNumberOfLines(this.element, 0, this.options.renderGutterLine);
    setNumberOfLines(this.element, this.lineCount, this.options.renderGutterLine);
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

  constructor(opts: Partial<GutterOptions> = {}) {
    this.options = {
      border: false,
      dir: DEFAULT_DIR,
      class: DEFAULT_CLASS,
      width: DEFAULT_WIDTH,
      ...opts
    };
    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.zIndex = '50';
    this.element.style.top = '0px';
    this.element.style.bottom = '0px';
    this.element.style.overflow = 'hidden';
    this.setNumberOfLines(1);
    this.refreshStyles();
  }

  /**
   * Returns the reference span for a given line number.
   *
   * @param lineNumber The line number to get the reference span for.
   * @returns The reference span for the given line number.
   */
  referenceElementForLineNumber(lineNumber: number): HTMLElement | null {
    return this.element.childNodes[lineNumber - 1] as HTMLElement | null;
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

/**
 * This interface is used to add a gutterLineElement property to HTMLElements. We tag gutter line
 * elements with this property so that we can easily find them later when we need to update their
 * content.
 */
interface GutterAnnotatedHTMLElement extends HTMLElement {
  /** The gutter line element that this element is a part of. */
  gutterLineElement?: GutterLineElement;
}

/**
 * Constructs the DOM elements for a single line in the gutter.
 *
 * @returns The gutter line elements.
 */
function createGutterLineElement(): GutterLineElement {
  const gutterLineWrapper = document.createElement('span');
  gutterLineWrapper.style.display = 'block';
  gutterLineWrapper.style.position = 'absolute';
  gutterLineWrapper.style.padding = '2px';
  gutterLineWrapper.style.left = '0px';
  gutterLineWrapper.style.right = '0px';
  gutterLineWrapper.style.width = '100%';

  const lineNumberSpan = document.createElement('span');
  gutterLineWrapper.appendChild(lineNumberSpan);

  const accessorySpan = document.createElement('span');
  gutterLineWrapper.appendChild(accessorySpan);

  const element: GutterLineElement = {
    gutterLineWrapper,
    lineNumberSpan,
    accessorySpan
  };

  (gutterLineWrapper as GutterAnnotatedHTMLElement).gutterLineElement = element;

  return element;
}

/**
 * Adds a line number to the gutter.
 *
 * @param parent The gutter element.
 * @param lineNumber The line number to add (1-based).
 * @param customizer The customizer function to use to customize the line number.
 * @returns The gutter line element that was added.
 */
function addLineNumber(
  parent: HTMLElement,
  lineNumber: number,
  customizer?: GutterCustomizer
): GutterLineElement {
  const line = createGutterLineElement();
  line.lineNumberSpan.innerText = `${lineNumber}`;
  if (customizer !== undefined) {
    customizer(lineNumber, line);
  }
  parent.appendChild(line.gutterLineWrapper);
  return line;
}

/**
 * Updates the number of lines in the gutter.
 *
 * @param parent The gutter element.
 * @param count The number of lines to have in the gutter.
 * @param customizer The customizer function to use to customize the line numbers.
 */
function setNumberOfLines(parent: HTMLElement, count: number, customizer?: GutterCustomizer): void {
  const children = parent.children;
  if (children.length < count) {
    for (let i = children.length; i < count; i++) {
      addLineNumber(parent, i + 1, customizer);
    }
  } else if (children.length > count) {
    while (children.length > count) {
      parent.removeChild(children[children.length - 1]);
    }
  }
}

/**
 * Updates the content of the line number span for a given line.
 *
 * @param parent The gutter element.
 * @param lineNumber The line number to update (1-based).
 * @param customizer The customizer function to use to customize the line number.
 */
function updateLineNumber(
  parent: HTMLElement,
  lineNumber: number,
  customizer: GutterCustomizer
): void {
  const children = parent.children;
  if (children.length < lineNumber) {
    return;
  }
  const selection = parent.children[lineNumber - 1];
  const child = selection as HTMLElement;

  if (child !== undefined) {
    let element: GutterLineElement | undefined = (child as GutterAnnotatedHTMLElement)
      .gutterLineElement;
    if (element === undefined) {
      element = {
        gutterLineWrapper: child,
        lineNumberSpan: child.children[0] as HTMLElement,
        accessorySpan: child.children[1] as HTMLElement
      };
    }
    customizer(lineNumber, element);
  }
}
