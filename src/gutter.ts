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
 * Options for the gutter which contains line numbers and their accessories.
 */
export interface GutterOptions {
  /**
   * The width of the gutter.
   */
  width: string;
  /**
   * The side of the editor to place the gutter on.
   */
  dir: 'ltr' | 'rtl';
  /**
   * A class to add to the gutter div in the DOM.
   * @remarks The dir is always set to 'ltr' or 'rtl' depending on the editor's direction
   * because we don't want the document's direction to change the gutter's direction.
   * LTR code is always read left to right, and RTL code is always read right to left.
   * This is true regardless of the document's direction.
   */
  class?: string;
  /**
   * A function that can be used to customize the gutter line numbers (and their accessories).
   */
  customizer?: GutterLineNumberCustomizer;
}

/**
 * Each gutter line is composed of a wrapper, a line number span, and an accessory span.
 */
export interface GutterLineElement {
  /**
   * Wraps all of the children while, in total, represent a line number in the gutter.
   */
  gutterLineWrapper: HTMLElement;
  /**
   * Hosts the actual line number text.
   */
  lineNumberSpan: HTMLElement;
  /**
   * The accessory span is basically designed to be a place to put icons signifying
   * a breakpoint or bookmark or whatever have you exist on that line.
   */
  accessorySpan: HTMLElement;
}

/**
 * This is the type of function that can be passed to the Gutter options
 * which provides callers a chance to customize gutter appearance and
 * behavior signifigantly.
 * @param lineNumber This is the actual index (+1) of the line in the text of the editor.
 * @param element The DOM elements representing the line number.
 */
export type GutterLineNumberCustomizer = (lineNumber: number, element: GutterLineElement) => void;

/**
 * The Gutter interface represents the gutter in the DOM which contains line numbers and their accessories.
 */
export interface Gutter {
  /**
   * The DOM element that represents the gutter.
   */
  readonly element: HTMLElement;
  /**
   * The options that were used to create the gutter.
   */
  readonly options: GutterOptions;
  /**
   * Sets the number of lines in the gutter.
   * @remarks Should be called whenther the number of lines in the source text changes.
   */
  setNumberOfLines: (count: number) => void;
  /**
   * Used to update the content of the line number span for a given line.
   * @remarks Should be called whenever the client wants to add or remove an accessory.
   */
  updateLineNumber: (lineNumber: number) => void;
}

/**
 * This interface is used to add a gutterLineElement property to HTMLElements.
 * We tag gutter line elements with this property so that we can easily
 * find them later when we need to update their content.
 */
interface GutterAnnotatedHTMLElement extends HTMLElement {
  /**
   * The gutter line element that this element is a part of.
   */
  gutterLineElement?: GutterLineElement;
}

/**
 * Creates a gutter for a parent editor.
 * @param options The options for the gutter.
 * @returns The gutter.
 */
export function createGutter(options?: Partial<GutterOptions>): Gutter {
  const opts: GutterOptions = {
    dir: 'ltr',
    class: '',
    width: '55px',
    ...options
  };
  const element = createGutterElement(opts);
  return {
    element,
    options: opts,
    setNumberOfLines: (count: number) => setNumberOfLines(element, count, opts.customizer),
    updateLineNumber: (lineNumber: number) => {
      if (opts.customizer === undefined) {
        return;
      }
      updateLineNumber(element, lineNumber, opts.customizer);
    }
  };
}

/**
 * Constructs the DOM element for the gutter which holds the line number elements.
 * @param opts The options for the gutter.
 * @returns The DOM element for the specified gutter options.
 */
function createGutterElement(opts: GutterOptions): HTMLElement {
  const gutter = document.createElement('div');
  gutter.className = opts.class ?? '';
  gutter.dir = opts.dir;

  gutter.style.position = 'absolute';
  gutter.style.top = '0px';
  gutter.style.bottom = '0px';
  if (opts.dir === 'ltr') {
    gutter.style.left = '0px';
    gutter.style.textAlign = 'right';
  } else {
    gutter.style.right = '0px';
    gutter.style.textAlign = 'left';
  }
  gutter.style.width = opts.width;
  gutter.style.overflow = 'hidden';

  return gutter;
}

/**
 * Constructs the DOM elements for a single line in the gutter.
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
 * @param parent The gutter element.
 * @param lineNumber The line number to add (1-based).
 * @param customizer The customizer function to use to customize the line number.
 * @returns The gutter line element that was added.
 */
function addLineNumber(
  parent: HTMLElement,
  lineNumber: number,
  customizer?: GutterLineNumberCustomizer
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
 * @param parent The gutter element.
 * @param count The number of lines to have in the gutter.
 * @param customizer The customizer function to use to customize the line numbers.
 */
function setNumberOfLines(
  parent: HTMLElement,
  count: number,
  customizer?: GutterLineNumberCustomizer
): void {
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
 * @param parent The gutter element.
 * @param lineNumber The line number to update (1-based).
 * @param customizer The customizer function to use to customize the line number.
 */
function updateLineNumber(
  parent: HTMLElement,
  lineNumber: number,
  customizer: GutterLineNumberCustomizer
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
