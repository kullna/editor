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

import {domToDocument} from './dom_reader';
import {documentToDom} from './dom_content_writer';
import {LineMetric} from '../line_metric';
import {TextDocument} from '../text_document';
import {mutateSelectionInDom} from './dom_selection_writer';

/**
 * This class provides bi-directional synchronization between the internal text document model and
 * the DOM representation of the text document.
 *
 * It can be used to read the current state of the DOM as a TextDocument, and write changes to the
 * DOM based on a TextDocument.
 *
 * Since writing to the DOM is a potentially expensive operation, we implements a mechanism to
 * simply push the current selection to the DOM without updating the document content itself to
 * handle a trivial optimization case.
 *
 * By making this class the "choakpoint" for all DOM operations we can also use this as a source of
 * truth for the document's current state.
 */
export class DomBridge {
  private _onDocumentSelectionChangedCallbacks: Array<(document: TextDocument) => void> = [];
  private _onDocumentContentAndSelectionChangedCallbacks: Array<(document: TextDocument) => void> =
    [];
  private _onLineMetricsChangedCallbacks: Array<(metrics: LineMetric[]) => void> = [];

  /**
   * Gets or sets the current text document representation.
   *
   * @returns The current text document representation.
   */
  get document(): TextDocument {
    return this._document;
  }
  set document(document: TextDocument) {
    this.pushToDOM(document);
  }
  private _document: TextDocument = new TextDocument(0, 0, '', true);
  private setDocumentWithChangeNotification(document: TextDocument) {
    if (document.strictEquals(this._document)) return;

    const oldDocument = this._document;
    this._document = document;

    if (document.perceptuallyEquals(oldDocument)) {
      this._onDocumentSelectionChangedCallbacks.forEach(callback => callback(document));
    } else {
      this._onDocumentContentAndSelectionChangedCallbacks.forEach(callback => callback(document));
      this.recalculateLineMetrics();
    }
  }

  /**
   * Returns the current position of the various lines in the document.
   *
   * @returns The current position of the various lines in the document.
   */
  get lineMetrics(): LineMetric[] {
    return this._lineMetrics;
  }
  private _lineMetrics: LineMetric[] = [];
  private setLineMetricsWithChangeNotification(metrics: LineMetric[]) {
    if (metrics !== this._lineMetrics) {
      this._lineMetrics = metrics;
      this._onLineMetricsChangedCallbacks.forEach(callback => callback(metrics));
    }
  }

  /**
   * Constructs a new instance of the `DomBridge` class.
   *
   * @param window - The browser window object.
   * @param element - The HTML element representing the text document.
   */
  constructor(
    private readonly window: Window,
    private readonly element: HTMLElement
  ) {
    this._document = this.poll(); // Auto-initialize with DOM state
  }

  /**
   * Polls the current state of the DOM and synchronizes it with the internal text document model.
   *
   * @returns The current text document representation.
   */
  poll(): TextDocument {
    const document = domToDocument(this.window, this.element);
    this.setDocumentWithChangeNotification(document);
    return this.document;
  }

  /**
   * Updates the DOM based on a given text document.
   *
   * @param document - The new text document to reflect in the DOM.
   */
  pushToDOM(document: TextDocument) {
    if (document.perceptuallyEquals(this._document)) {
      mutateSelectionInDom(this.element, document);
    } else {
      documentToDom(this.element, document);
    }
    this.setDocumentWithChangeNotification(document);
  }

  /**
   * This will recalculate the line metrics.
   *
   * Line metrics are already recalculated when the document content changes, but this method should
   * be called when the DOM is resized without changing the document content.
   */
  recalculateLineMetrics() {
    const lineContainers = Array.from(this.element.querySelectorAll('.text-document-line'));
    const lineMetrics: LineMetric[] = lineContainers.map(lineContainer => ({
      top: (lineContainer as HTMLElement).offsetTop,
      height: (lineContainer as HTMLElement).offsetHeight
    }));
    this.setLineMetricsWithChangeNotification(lineMetrics);
  }

  /**
   * Registers a callback to be invoked when the selection within the text document changes.
   *
   * @param callback - The callback to be invoked.
   */
  addDocumentSelectionChangedCallback(callback: (document: TextDocument) => void): void {
    this._onDocumentSelectionChangedCallbacks.push(callback);
  }

  /**
   * Registers a callback to be invoked when the content and/or selection within the text document
   * changes.
   *
   * @param callback - The callback to be invoked.
   */
  addDocumentContentAndSelectionChangedCallback(callback: (document: TextDocument) => void): void {
    this._onDocumentContentAndSelectionChangedCallbacks.push(callback);
  }

  /**
   * Registers a callback to be invoked when the line metrics (i.e., layout details) of the text
   * document change.
   *
   * @param callback - The callback to be invoked.
   */
  addLineMetricsChangeCallback(callback: (metrics: LineMetric[]) => void): void {
    this._onLineMetricsChangedCallbacks.push(callback);
  }
}
