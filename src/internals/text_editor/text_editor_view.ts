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
import {Package} from '../../package';
import {type TextEditorViewEventHandler} from './event_handler';
import {TextEditorViewKeyboardEvent} from './keyboard_event';
import {SelectionBridge} from './selection_bridge';
import {ThrottledAction} from '../utils/throttled_action';

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
  // TODO: Move this to the editor class.
  private _workingDocument: TextDocument;
  get cachedDocument(): TextDocument {
    return this._workingDocument;
  }
  set cachedDocument(document: TextDocument) {
    if (this._workingDocument.strictEquals(document)) return;

    const contentChanged = !this._workingDocument.perceptuallyEquals(document);
    this.bridge.writeSelection(document);
    this.setDocumentUnchecked(document);
    this._workingDocument = document;

    if (contentChanged) {
      this.listener.contentChanged();
    }
    this.listener.selectionChanged();
  }
  private readonly bridge: SelectionBridge;

  private _lastDOMDocument: TextDocument = new TextDocument(0, 0, '', true);
  private _lastPassedDocument: TextDocument = new TextDocument(0, 0, '', true);

  /**
   * Reads the current state of the DOM and updates the last known state of the DOM.
   *
   * @returns A TextDocument representing the current state of the DOM.
   */
  private updateLastKnownDOMState(): TextDocument {
    const document = this.bridge.readSelection();
    this._workingDocument = document;

    if (!this._lastPassedDocument.strictEquals(document)) {
      if (!this._lastPassedDocument.perceptuallyEquals(document)) {
        if (this.element) {
          const safeString = window.document.createTextNode(document.text.replace(/\r\n/g, '\n'));
          this.element.textContent = safeString.textContent;
          this.invokeHighlighter();
        }
        this.bridge.writeSelection(document);
        if (Package.environment === 'DEVELOPMENT') {
          // skipcq: JS-0002: Avoid console
          console.log(' ⚡ Content Changed Event');
        }
        this.listener.contentChanged();
      }
      if (Package.environment === 'DEVELOPMENT') {
        // skipcq: JS-0002: Avoid console
        console.log(' ⚡ Selection Changed Event');
      }
      this.listener.selectionChanged();
    }
    this._lastDOMDocument = document;
    this._lastPassedDocument = document;
    return this._lastDOMDocument;
  }

  /**
   * Sets the document without performing any content-change-related callbacks. (Note that we still
   * invoke the rendering/highlighting logic.)
   *
   * @param document The new working document.
   */
  setDocumentUnchecked(document: TextDocument) {
    this._workingDocument = document;
    this._lastPassedDocument = document;

    if (!this.element) return;

    if (this._lastDOMDocument.strictEquals(document)) {
      this._lastDOMDocument = document;
      return;
    }

    if (this._lastDOMDocument.perceptuallyEquals(document)) {
      this.bridge.writeSelection(document);
      return;
    }

    if (Package.environment === 'DEVELOPMENT') {
      // skipcq: JS-0002: Avoid console
      console.log(' ✏️ Writing Text Content to DOM');
    }

    const safeString = window.document.createTextNode(document.text.replace(/\r\n/g, '\n'));
    this.element.textContent = safeString.textContent;

    this.bridge.writeSelection(document);
    this.invokeHighlighter();
    this._lastDOMDocument = document;
  }

  /** The function that will be called when the content of the text editor changes. */
  // skipcq: JS-0105, JS-0321: No "this", no empty function.
  highlightElement: (element: HTMLElement) => void = () => {};
  private readonly _formattedDisplay: HTMLElement;
  private readonly _throttledHighlighter: ThrottledAction;
  private invokeHighlighter() {
    if (Package.environment === 'DEVELOPMENT') {
      // skipcq: JS-0002: Avoid console
      console.log(' 🎨 Highlighting Requested');
    }
    this._throttledHighlighter.trigger();
  }

  private _language: string = 'text';
  get language(): string {
    return this._language;
  }
  set language(lang: string) {
    if (this.element) {
      this.element.classList.replace(`language-${this._language}`, `language-${lang}`);
      this._formattedDisplay.classList.replace(`language-${this._language}`, `language-${lang}`);
    }
    this._language = lang;
  }

  private _spellchecking: boolean = false;
  get spellchecking(): boolean {
    return this._spellchecking;
  }
  set spellchecking(spellcheck: boolean) {
    if (this.element) {
      this.element.setAttribute('spellcheck', spellcheck ? 'true' : 'false');
      this.element.setAttribute('autocapitalize', spellcheck ? 'on' : 'off');
      this.element.setAttribute('autocomplete', spellcheck ? 'on' : 'off');
      this.element.setAttribute('autocorrect', spellcheck ? 'on' : 'off');
      if (!spellcheck) {
        this.element.setAttribute('lang', 'klingon');
        this._formattedDisplay.setAttribute('lang', 'klingon');
      } else {
        this.element.removeAttribute('lang');
        this._formattedDisplay.removeAttribute('lang');
      }
    }
    this._spellchecking = spellcheck;
  }

  private _dir: 'ltr' | 'rtl' = 'ltr';
  get dir(): 'ltr' | 'rtl' {
    return this._dir;
  }
  set dir(dir: 'ltr' | 'rtl') {
    if (this.element) {
      this.element.setAttribute('dir', dir);
      this._formattedDisplay.setAttribute('dir', dir);
    }
    this._dir = dir;
    this.updateDisplayStyles();
  }

  private _gutterWidth: string = '55px';
  get gutterWidth(): string {
    return this._gutterWidth;
  }
  set gutterWidth(width: string) {
    this._gutterWidth = width;
    this.updateDisplayStyles();
  }

  /**
   * Updates the display styles for the editor and the formatted display.
   *
   * @param updateEditor Whether or not to update the editor's styles.
   */
  private updateDisplayStyles(updateEditor: boolean = true): void {
    if (!this.element) return;
    if (updateEditor) {
      this.element.style.inset = this.insetWithLeading('0px', this._gutterWidth);
    }
    this._formattedDisplay.style.inset = this.insetWithLeading(
      `-${this.element.scrollTop}px`,
      `calc(-${this.element.scrollLeft}px + ${this._gutterWidth})`
    );
  }

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
   * Whether the editor is focused.
   *
   * @remarks
   *   We never want to process events if the editor is not focused.
   */
  private focused: boolean = false;

  /** The listeners that have been added to the element. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly listeners: [string, any][] = [];

  private selectionChangeListener: (() => void) | null = null;

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
    this.listeners.push([type, listener]);
  }

  private element?: HTMLElement;

  /** Invoke to inform clients that the editor scrolled. */
  private readonly _throttledScroller: ThrottledAction;

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
    this._formattedDisplay = highlighted;
    highlighted.style.outline = 'none';
    highlighted.style.overflowWrap = 'break-word';
    highlighted.style.overflowY = 'auto';
    highlighted.style.whiteSpace = 'pre';
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
    highlighted.style.overflow = 'initial';
    highlighted.style.zIndex = '0';
    this.element = editor;
    editor.setAttribute('contenteditable', 'plaintext-only');
    if (editor.contentEditable !== 'plaintext-only') {
      editor.setAttribute('contenteditable', 'true');
    }
    editor.style.color = 'transparent';
    editor.style.zIndex = '100';
    editor.style.caretColor = 'white';
    parent.appendChild(editor);

    this.language = 'text';
    this.updateDisplayStyles();

    if (!this.element) {
      throw new Error('Could not create editor element');
    }

    this.bridge = new SelectionBridge(this.element);
    this._workingDocument = this.updateLastKnownDOMState();

    this._throttledHighlighter = new ThrottledAction(() => {
      if (Package.environment === 'DEVELOPMENT') {
        // skipcq: JS-0002: Avoid console
        console.log(' 🎨 Highlight Sync');
      }
      const safeString = window.document.createTextNode(
        this._workingDocument.text.replace(/\r\n/g, '\n')
      );
      this._formattedDisplay.textContent = safeString.textContent;
      this.highlightElement(this._formattedDisplay);
    }, 1000 / 60);

    this._throttledScroller = new ThrottledAction(() => {
      if (Package.environment === 'DEVELOPMENT') {
        // skipcq: JS-0002: Avoid console
        console.log(' 🎨 Scroll Sync');
      }
      if (!this.element)
        throw new Error('Unexpectedly, No element. Did you forget to call destroy()?');
      this.updateDisplayStyles(false);
      this.listener.scroll(this.element);
    }, 1000 / 60);

    this.on('focus', this.element, () => {
      this.focused = true;
    });

    this.on('blur', this.element, () => {
      this.focused = false;
    });

    this.selectionChangeListener = () => {
      if (!this.focused) return;
      this.updateLastKnownDOMState();
    };
    this.window.document.addEventListener('selectionchange', this.selectionChangeListener);

    this.on('scroll', this.element, () => {
      this._throttledScroller.trigger();
    });

    this.on('keydown', this.element, (event: KeyboardEvent) => {
      if (!this.focused) return;
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

    this.on('input', this.element, () => {
      if (!this.focused) return;
      this.updateLastKnownDOMState();
    });

    this.on('keyup', this.element, event => {
      if (!this.focused) return;
      if (event.defaultPrevented) return;
      if (event.isComposing) return;

      const editorEvent = new TextEditorViewKeyboardEvent(event);
      this.listener.keyup(editorEvent);
    });

    this.on('cut', this.element, event => {
      if (!this.focused) return;
      if (event.defaultPrevented) return;
      event.preventDefault();
      this.listener.cut(event);
    });

    this.on('paste', this.element, event => {
      if (!this.focused) return;
      if (event.defaultPrevented) return;
      event.preventDefault();
      this.listener.paste(event);
    });
  }

  /** Removes all event listeners from the DOM element. */
  destroy() {
    if (!this.element) throw new Error('Editor element has already been destroyed');

    while (this.listeners.length > 0) {
      const obj = this.listeners.pop();
      if (obj) {
        const [type, fn] = obj;
        this.element.removeEventListener(type, fn);
      }
    }
    this.element.remove();
    this.element = undefined;
    if (this.selectionChangeListener) {
      this.window.document.removeEventListener('selectionchange', this.selectionChangeListener);
      this.selectionChangeListener = null;
    }
  }
}
