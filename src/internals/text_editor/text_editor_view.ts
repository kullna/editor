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

import {TextDocument} from './text_document';
import {type TextEditorViewEventHandler} from './event_handler';
import {TextEditorViewKeyboardEvent} from './keyboard_event';
import {ThrottledAction} from '../utils/throttled_action';
import {DomBridge} from './dom/dom_bridge';
import {LineMetric} from './line_metric';

/**
 * The TextEditorView class provides a simple API for managing the state of a browser-based text
 * editor. It is designed to encapsulate the complexities of dealing with DOM APIs for editing text
 * and managing text selections within a content-editable div.
 *
 * The TextEditorView class represents the state of the editor with the {@link TextDocument} class.
 *
 * The TextEditorView is not responsible for implementing code-editing-specific features such as
 * automatic indentation, syntax highlighting, etc.
 *
 * ## Implementation
 *
 * The internal responsibilities of TextEditorView largely come in two parts:
 *
 * - **Normal DOM events** such as `keydown`, `keyup`, etc.
 * - **The Selection API** for managing text selections in content-editable elements.
 *
 * Internally, the DOM events are handled by the {@link TextEditorViewEventHandler} class. This class
 * is responsible for handling DOM events and translating them into higher-level events that are
 * easier to reason about. For example, the `keydown` event is translated into a
 * {@link TextEditorViewKeyboardEvent} object, which contains information about the key that was
 * pressed, whether the shift key was pressed, etc. Clients of a TextEditorView must supply an event
 * handler to handle these events, and the event handler should use our APIs to modify the state of
 * the TextDocument if needed.
 *
 * Also internally, The {@link TextEditorView} class is responsible for rendering the text editor and
 * mapping the state of the text editor to the DOM.
 *
 * The {@link TextEditorDocumentBridge} class, used within the {@link TextEditorView} is responsible
 * for synchronizing the state of the selection within the text editor with the state of the
 * selection within the document. This is necessary because the selection within the document is
 * given to us in terms of DOM elements, which do not cleanly correspond to the text editor's
 * representation of the document in plain text.
 *
 * This library does not use `execCommand` as it has been deprecated and is not supported in
 * Firefox. Instead, it uses the Selection API exclusively to manage the selection.
 *
 * ## Roadmap
 *
 * There are a number of interesting optimizations we may be able to make since we know the exact
 * delta between the previous document and the current document. For example, we could use knowledge
 * of the delta to avoid re-rendering the entire document when only a small part of it has changed.
 *
 * ## References
 *
 * - https://developer.mozilla.org/en-US/docs/Web/API/Selection
 * - https://developer.mozilla.org/en-US/docs/Web/API/Range
 */
export class TextEditorView {
  /**
   * The function that the editor view will call when the content of the text editor changes and
   * needs to be redrawn.
   */
  // skipcq: JS-0105, JS-0321: No "this", no empty function.
  highlightElement?: (element: HTMLElement) => void;

  /** The constructed content-editable element. */
  contentEditableSurface: HTMLElement;

  /** The syntax-highlighted text. */
  formattedTextSurface: HTMLElement;

  /** The listeners that have been added to the element. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly _listeners: [string, any][] = [];

  /** Invoke to inform clients that the editor scrolled. */
  private readonly _throttledScroller: ThrottledAction;

  /**
   * The object that throttles calls to {@link highlightElement}.
   *
   * Instead of calling {@link highlightElement} every time the user types a character, we call it at
   * most once every (1 / 60)s. So we call _throttledHighlighter.trigger() to do this instead.
   */
  private readonly _throttledHighlighter: ThrottledAction;

  /**
   * Whether the editor is focused.
   *
   * @remarks
   *   We never want to process events if the editor is not focused.
   */
  private _focused: boolean = false;

  /**
   * The block we attached to the window's 'selectionchange' event which needs to be removed if we
   * are destroyed.
   */
  private _selectionChangeListener: (() => void) | null = null;

  /**
   * The block we attached to the window's 'resize' event which needs to be removed if we are
   * destroyed.
   */
  private _resizeChangeListener: (() => void) | null = null;

  /**
   * The bridge provides a way to synchronize the state of the text editor with the state of the
   * document and acts as the source of truth for the current state of the document.
   */
  private readonly _bridge: DomBridge;

  /**
   * The programming language code that the editor is currently using for syntax highlighting.
   *
   * @returns The programming language code that the editor is currently using for syntax
   *   highlighting.
   */
  get language(): string {
    return this._language;
  }
  set language(lang: string) {
    this.contentEditableSurface.classList.replace(`language-${this._language}`, `language-${lang}`);
    this.formattedTextSurface.classList.replace(`language-${this._language}`, `language-${lang}`);
    this._language = lang;
  }
  private _language: string = 'text';

  /**
   * The programming language code that the editor is currently using for syntax highlighting.
   *
   * @returns The programming language code that the editor is currently using for syntax
   *   highlighting.
   */
  get readonly(): boolean {
    return this._readonly;
  }
  set readonly(readonly: boolean) {
    this.contentEditableSurface.setAttribute('readonly', readonly ? 'true' : 'false');
    if (readonly) {
      this.contentEditableSurface.setAttribute('contenteditable', 'false');
    } else {
      this.contentEditableSurface.setAttribute('contenteditable', 'plaintext-only');
      this.contentEditableSurface.setAttribute('contenteditable', 'true');
    }
    this._readonly = readonly;
  }
  private _readonly: boolean = false;

  /**
   * Whether spellchecking is currently enabled.
   *
   * @returns Whether spellchecking is currently enabled.
   */
  get spellchecking(): boolean {
    return this._spellchecking;
  }
  set spellchecking(spellcheck: boolean) {
    this.contentEditableSurface.setAttribute('spellcheck', spellcheck ? 'true' : 'false');
    this.contentEditableSurface.setAttribute('autocapitalize', spellcheck ? 'on' : 'off');
    this.contentEditableSurface.setAttribute('autocomplete', spellcheck ? 'on' : 'off');
    this.contentEditableSurface.setAttribute('autocorrect', spellcheck ? 'on' : 'off');
    if (!spellcheck) {
      this.contentEditableSurface.setAttribute('lang', 'klingon');
      this.formattedTextSurface.setAttribute('lang', 'klingon');
    } else {
      this.contentEditableSurface.removeAttribute('lang');
      this.formattedTextSurface.removeAttribute('lang');
    }
    this._spellchecking = spellcheck;
  }
  private _spellchecking: boolean = false;

  /**
   * The current text direction.
   *
   * @returns The current text direction.
   */
  get dir(): 'ltr' | 'rtl' {
    return this._dir;
  }
  set dir(dir: 'ltr' | 'rtl') {
    this.contentEditableSurface.setAttribute('dir', dir);
    this.formattedTextSurface.setAttribute('dir', dir);
    this._dir = dir;
    this.updateDisplayStyles();
  }
  private _dir: 'ltr' | 'rtl' = 'ltr';

  /**
   * Whether the content should wrap to fit the window.
   *
   * @returns Whether the content should wrap to fit the window.
   */
  get wrapsText(): boolean {
    return this._wrapsText;
  }
  set wrapsText(wrap: boolean) {
    this._wrapsText = wrap;
    this.contentEditableSurface.style.whiteSpace = wrap ? 'pre-wrap' : 'pre';
    this.formattedTextSurface.style.whiteSpace = wrap ? 'pre-wrap' : 'pre';
    this._bridge.poll(); // Line metrics may have changed.
  }
  private _wrapsText: boolean = false;

  get lineMetrics(): LineMetric[] {
    return this._bridge.lineMetrics;
  }
  onLineMetricsChanged?: (metrics: LineMetric[]) => void;

  /**
   * The width of the gutter as a CSS metric string.
   *
   * @returns The width of the gutter as a CSS metric string.
   */
  get gutterWidth(): string {
    return this._gutterWidth;
  }
  set gutterWidth(width: string) {
    this._gutterWidth = width;
    this.updateDisplayStyles();
  }
  private _gutterWidth: string = '0px';

  /**
   * Returns the inset string for the given top and leading values. This routine takes into account
   * the direction of the editor. The parameters are CSS values, so they should include units.
   *
   * @param top The top value.
   * @param leading The leading value.
   * @returns The inset string.
   */
  private insetWithLeading(top: string, leading: string) {
    if (this._dir === 'ltr') {
      return `${top} 0px 0px ${leading}`;
    } else {
      return `${top} ${leading} 0px 0px`;
    }
  }

  /**
   * The text document that is being edited.
   *
   * @returns The text document that is being edited.
   */
  get document(): TextDocument {
    return this._bridge.document;
  }
  set document(document: TextDocument) {
    this._bridge.pushToDOM(document);
  }

  /**
   * Template pattern for adding an event listener to the DOM and our list.
   *
   * @param type The type of event to listen for.
   * @param element The element to which the event will be attached.
   * @param listener The function to call when the event is triggered.
   */
  private on<K extends keyof HTMLElementEventMap>(
    type: K,
    element: HTMLElement,
    listener: (event: HTMLElementEventMap[K]) => void
  ): void {
    element.addEventListener(type, listener);
    this._listeners.push([type, listener]);
  }

  /**
   * Creates a new `TextEditorView`.
   *
   * @param window The window object.
   * @param parent The host element.
   * @param listener The handler that will receive the events.
   */
  constructor(
    private readonly window: Window,
    parent: HTMLElement,
    private readonly listener: TextEditorViewEventHandler
  ) {
    // The highlighted element is the one that is visible to the user.
    // It is produced by the highlighter. Before the highlighter runs,
    // we populate the text content of the highlighted element with the
    // text content of the working document.
    const highlighted = document.createElement('div');
    this.formattedTextSurface = highlighted;
    highlighted.style.outline = 'none';
    highlighted.style.whiteSpace = 'pre';
    highlighted.style.overflowWrap = 'break-word';
    highlighted.style.overflowY = 'auto';
    highlighted.style.top = '0px';
    highlighted.style.right = '0px';
    highlighted.style.left = '0px';
    highlighted.style.bottom = '0px';
    highlighted.style.position = 'absolute';
    parent.appendChild(highlighted);

    // The editor is the actual contenteditable element that the user
    // interacts with. It is hidden from the user, and is used to
    // capture the user's input. Note that it's important that the
    // editor is above the highlighted element in the DOM, so that
    // the editor can capture the user's input.
    const editor = highlighted.cloneNode() as HTMLElement;
    this.contentEditableSurface = editor;
    editor.setAttribute('contenteditable', 'plaintext-only');
    if (editor.contentEditable !== 'plaintext-only') {
      editor.setAttribute('contenteditable', 'true');
    }
    editor.style.color = 'transparent';
    editor.style.cursor = 'text';
    editor.style.caretColor = 'white';
    parent.appendChild(editor);

    this._bridge = new DomBridge(window, editor);
    this._bridge.addDocumentContentAndSelectionChangedCallback(document => {
      this._throttledHighlighter.trigger();
      this.listener.contentChanged(document);
    });
    this._bridge.addDocumentSelectionChangedCallback(document => {
      this.listener.selectionChanged(document);
    });
    this._bridge.addLineMetricsChangeCallback(metrics => {
      if (this.onLineMetricsChanged) {
        this.onLineMetricsChanged(metrics);
      }
    });

    this.language = 'text';
    this.updateDisplayStyles();

    if (!this.contentEditableSurface) {
      throw new Error('Could not create editor element');
    }

    // If the editor uses a font that is getting loaded asynchronously,
    // we need to update the line metrics once the font is loaded.
    document.fonts.ready
      .then(() => {
        this._bridge.recalculateLineMetrics();
      })
      .finally(() => {
        this._bridge.recalculateLineMetrics();
      });

    this._throttledHighlighter = new ThrottledAction(() => {
      this.formattedTextSurface.textContent = this._bridge.document.text.replaceAll('\r', '');
      if (this.highlightElement) {
        this.highlightElement(this.formattedTextSurface);
      }
    }, 1000 / 60);

    this._throttledScroller = new ThrottledAction(() => {
      this.updateDisplayStyles(false);
      this.listener.scroll(this.contentEditableSurface);
    }, 1000 / 60);

    this.on('focus', this.contentEditableSurface, () => {
      this._focused = true;
    });

    this._resizeChangeListener = () => {
      this._throttledScroller.trigger();
      this._bridge.recalculateLineMetrics();
    };
    this.window.addEventListener('resize', this._resizeChangeListener);

    this.on('blur', this.contentEditableSurface, () => {
      this._focused = false;
    });

    this._selectionChangeListener = () => {
      if (!this._focused) return;
      this._bridge.poll();
    };
    this.window.document.addEventListener('selectionchange', this._selectionChangeListener);

    this.on('scroll', this.contentEditableSurface, () => {
      this._throttledScroller.trigger();
    });

    this.on('keydown', this.contentEditableSurface, (event: KeyboardEvent) => {
      if (!this._focused) return;
      if (event.defaultPrevented) return;
      if (event.isComposing) return;

      const editorEvent = new TextEditorViewKeyboardEvent(event);

      if (editorEvent.isUndo) {
        event.preventDefault();
        event.stopPropagation();
        this.listener.undo();
      } else if (editorEvent.isRedo) {
        event.preventDefault();
        event.stopPropagation();
        this.listener.redo();
      } else if (this.listener.keydown(editorEvent)) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    this.on('input', this.contentEditableSurface, () => {
      if (!this._focused) return;
      this._bridge.poll();
    });

    this.on('keyup', this.contentEditableSurface, event => {
      if (!this._focused) return;
      if (event.defaultPrevented) return;
      if (event.isComposing) return;

      const editorEvent = new TextEditorViewKeyboardEvent(event);
      this.listener.keyup(editorEvent);
    });

    this.on('cut', this.contentEditableSurface, event => {
      if (!this._focused) return;
      if (event.defaultPrevented) return;
      event.preventDefault();
      this.listener.cut(event);
    });

    this.on('paste', this.contentEditableSurface, event => {
      if (!this._focused) return;
      if (event.defaultPrevented) return;
      event.preventDefault();
      this.listener.paste(event);
    });
  }

  /**
   * Updates the display styles for the editor and the formatted display.
   *
   * @param updateEditor Whether or not to update the editor's styles.
   */
  private updateDisplayStyles(updateEditor: boolean = true): void {
    if (!this.contentEditableSurface) return;
    if (updateEditor) {
      this.contentEditableSurface.style.inset = this.insetWithLeading('0px', this._gutterWidth);
    }
    this.formattedTextSurface.style.inset = this.insetWithLeading(
      `-${this.contentEditableSurface.scrollTop}px`,
      `calc(${(this._dir === 'ltr' ? -1 : 1) * this.contentEditableSurface.scrollLeft}px + ${
        this._gutterWidth
      })`
    );
  }

  /** Removes all event listeners from the DOM element. */
  destroy() {
    while (this._listeners.length > 0) {
      const obj = this._listeners.pop();
      if (obj) {
        const [type, fn] = obj;
        this.contentEditableSurface.removeEventListener(type, fn);
      }
    }
    this.contentEditableSurface.remove();
    if (this._selectionChangeListener) {
      this.window.document.removeEventListener('selectionchange', this._selectionChangeListener);
      this._selectionChangeListener = null;
    }
    if (this._resizeChangeListener) {
      this.window.removeEventListener('resize', this._resizeChangeListener);
      this._resizeChangeListener = null;
    }
  }
}
