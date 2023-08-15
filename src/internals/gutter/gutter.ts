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
    this.lineCount = count;
    setNumberOfLines(this.element, count, this.options.renderGutterLine);
    this.refreshStyles();
  }

  private scrollTop: number = 0;
  /**
   * Sets the scroll top of the gutter.
   *
   * @param scrollTop The scroll top of the gutter.
   */
  setScrollTop(scrollTop: number): void {
    // element.scrollTop
    this.scrollTop = scrollTop;
    this.element.style.top = `-${scrollTop}px`;
    this.refreshStyles();
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
   * Gets or sets the line number that is currently highlighted.
   *
   * @returns The line number that is currently highlighted.
   */
  get highlightedLine() {
    return this.options.highlightedLine;
  }
  set highlightedLine(value: number) {
    this.options.highlightedLine = value;
    this.refreshStyles();
  }

  /** Returns the reference span for a given line number. */
  public highlightElement: HTMLElement;

  constructor(opts: Partial<GutterOptions> = {}) {
    this.options = {
      border: false,
      highlightedLine: -1,
      dir: DEFAULT_DIR,
      class: DEFAULT_CLASS,
      width: DEFAULT_WIDTH,
      ...opts
    };
    this.element = createGutterElement(this.options);
    this.highlightElement = createHighlightElement(this.options);
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
    if (this.highlightedLine !== -1) {
      const referenceElement = this.referenceElementForLineNumber(this.highlightedLine);
      if (!referenceElement) {
        this.highlightElement.style.visibility = 'hidden';
      } else {
        this.highlightElement.style.visibility = 'visible';
        this.highlightElement.style.top = `${referenceElement.offsetTop - this.scrollTop}px`;
        this.highlightElement.style.height = `${referenceElement.offsetHeight}px`;
      }
    } else {
      this.highlightElement.style.visibility = 'hidden';
    }
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
 * @param opts The options for the gutter.
 * @returns A DOM element that represents a horizontal highlight.
 */
function createHighlightElement(opts: GutterOptions): HTMLElement {
  const highlight = document.createElement('div');
  highlight.className = opts.class ? `${opts.class}-highlight` : '';
  highlight.style.position = 'absolute';
  highlight.style.left = '0px';
  highlight.style.right = '0px';
  highlight.style.zIndex = '99';
  highlight.innerHTML = '&nbsp;';
  return highlight;
}

/**
 * Constructs the DOM element for the gutter which holds the line number elements.
 *
 * @param opts The options for the gutter.
 * @returns The DOM element for the specified gutter options.
 */
function createGutterElement(opts: GutterOptions): HTMLElement {
  const gutter = document.createElement('div');
  gutter.className = opts.class ?? '';
  gutter.dir = opts.dir;

  gutter.style.position = 'absolute';
  gutter.style.top = '0px';
  gutter.style.zIndex = '50';
  gutter.style.bottom = '0px';
  if (opts.dir === 'ltr') {
    gutter.style.left = '0px';
    gutter.style.right = 'unset';
    gutter.style.textAlign = 'right';
  } else {
    gutter.style.right = '0px';
    gutter.style.left = 'unset';
    gutter.style.textAlign = 'left';
  }
  gutter.style.width = opts.width;
  gutter.style.overflow = 'hidden';

  return gutter;
}

/**
 * Constructs the DOM elements for a single line in the gutter.
 *
 * @returns The gutter line elements.
 */
function createGutterLineElement(): GutterLineElement {
  const gutterLineWrapper = document.createElement('div');
  gutterLineWrapper.style.display = 'block';
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
