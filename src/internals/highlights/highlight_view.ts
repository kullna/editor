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
import {Highlight} from './highlight';

/** Creates a layer for highlights and manages them. */
export class HighlightView {
  readonly highlights: HighlightLineView[] = [];

  /** The current line metrics. */
  lineMetrics: LineMetric[] = [];

  /** The container view for the highlights. */
  highlightContainerView: HTMLElement;

  /**
   * Creates a new highlight manager.
   *
   * @param parent The parent element to append the highlight container to.
   * @param zIndex The z-index of the highlight container.
   */
  constructor(
    parent: HTMLElement,
    readonly zIndex: number
  ) {
    this.highlightContainerView = parent;
  }

  /**
   * Updates the highlights with new line information.
   *
   * @param metrics The new line metrics.
   */
  updateLineMetrics(metrics: LineMetric[]) {
    this.lineMetrics = metrics;
    for (const highlight of this.highlights) {
      highlight.update();
    }
  }

  scrollTop: number = 0;
  /**
   * Sets the scroll top of the gutter.
   *
   * @param scrollTop The scroll top of the gutter.
   */
  setScrollTop(scrollTop: number): void {
    // element.scrollTop
    this.scrollTop = scrollTop;
    for (const highlight of this.highlights) {
      highlight.update();
    }
  }

  /**
   * Creates a new highlight.
   *
   * @returns The new highlight.
   */
  createHighlight(): Highlight {
    const highlight = new HighlightLineView(this);
    this.highlights.push(highlight);
    return highlight;
  }
}

/** A highlight is a line number that is highlighted across the entire editor. */
class HighlightLineView implements Highlight {
  private readonly highlightElement: HTMLElement;

  constructor(private readonly manager: HighlightView) {
    this.highlightElement = createHighlightElement(manager.zIndex);
    this.manager.highlightContainerView.appendChild(this.highlightElement);
  }

  /** @inheritDoc */
  get lineNumber(): number {
    return this._lineNumber;
  }
  set lineNumber(lineNumber: number) {
    this._lineNumber = lineNumber;
    this.update();
  }
  private _lineNumber: number = 0;

  /** @inheritDoc */
  get visible(): boolean {
    return this._visible;
  }
  set visible(visible: boolean) {
    this._visible = visible;
    this.update();
  }
  private _visible: boolean = false;

  /** @inheritDoc */
  get cssClass(): string {
    return this._cssClass;
  }
  set cssClass(cssClass: string) {
    this._cssClass = cssClass;
    this.highlightElement.className = cssClass;
  }
  private _cssClass: string = '';

  /** @inheritDoc */
  delete() {
    this.highlightElement.remove();
    const index = this.manager.highlights.indexOf(this);
    if (index !== -1) {
      this.manager.highlights.splice(index, 1);
    }
  }

  /** Called by the manager when new line metrics are available. */
  update() {
    const metric = this.manager.lineMetrics[this._lineNumber - 1];
    if (!metric || !this._visible) {
      this.highlightElement.style.visibility = 'hidden';
    } else {
      this.highlightElement.style.visibility = 'visible';
      this.highlightElement.style.top = `${metric.top - this.manager.scrollTop}px`;
      this.highlightElement.style.height = `${metric.height}px`;
    }
  }
}

/**
 * Creates a new DOM element that represents a horizontal highlight.
 *
 * @param zIndex The z-index of the highlight.
 * @returns A DOM element that represents a horizontal highlight.
 */
function createHighlightElement(zIndex: number): HTMLElement {
  const highlight = document.createElement('div');
  highlight.className = 'highlight';
  highlight.style.position = 'absolute';
  highlight.style.left = '0px';
  highlight.style.right = '0px';
  highlight.style.margin = '0px';
  highlight.style.padding = '0px';
  highlight.style.zIndex = `${zIndex}`;
  highlight.innerHTML = '&nbsp;';
  return highlight;
}
