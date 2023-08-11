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
import {TextEditorKeyboardEvent} from './keyboard_event';
import {SelectionBridge} from './selection_bridge';

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
 * {@link TextEditorKeyboardEvent} object, which contains information about the key that was pressed,
 * whether the shift key was pressed, etc. Clients of a TextEditorView must supply an event handler
 * to handle these events, and the event handler should use our APIs to modify the state of the
 * TextDocument if needed.
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
  // private _previousDocument?: TextDocument;
  private _workingDocument: TextDocument;
  get cachedDocument(): TextDocument {
    return this._workingDocument;
  }
  set cachedDocument(document: TextDocument) {
    this.domDocument = document;
    this._workingDocument = document;
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
          if (Package.environment === 'DEVELOPMENT') {
            // skipcq: JS-0002: Avoid console
            console.log(' 🎨 Highlighting');
          }

          const safeString = window.document.createTextNode(document.text.replace(/\r\n/g, '\n'));
          this.element.textContent = safeString.textContent;

          this.highlightElement(this.element);
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
   * Gets or sets the DOM's copy of the document.
   *
   * This is an expensive operation and should be avoided if possible.
   *
   * @returns The DOM's copy of the document.
   */
  get domDocument(): TextDocument {
    return this.updateLastKnownDOMState();
  }
  set domDocument(document: TextDocument) {
    this._workingDocument = document;

    if (!this._lastPassedDocument.strictEquals(document)) {
      if (!this._lastPassedDocument.perceptuallyEquals(document)) {
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
    this._lastPassedDocument = document;
    this.setDocumentUnchecked(document);
  }

  /**
   * Sets the document without performing any callbacks.
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

    if (Package.environment === 'DEVELOPMENT') {
      // skipcq: JS-0002: Avoid console
      console.log(' 🎨 Highlighting');
    }

    this.highlightElement(this.element);
    this.bridge.writeSelection(document);
    this._lastDOMDocument = document;
  }

  /** The function that will be called when the content of the text editor changes. */
  // skipcq: JS-0105, JS-0321: No "this", no empty function.
  highlightElement: (element: HTMLElement) => void = () => {};

  private _language: string = 'text';
  get language(): string {
    return this._language;
  }
  set language(lang: string) {
    if (this.element) {
      this.element?.classList.replace(`language-${this._language}`, `language-${lang}`);
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
      } else {
        this.element.removeAttribute('lang');
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
    }
    this._dir = dir;
    this.updateGutterWidth();
  }

  private _gutterWidth: string = '55px';
  get gutterWidth(): string {
    return this._gutterWidth;
  }
  set gutterWidth(width: string) {
    this._gutterWidth = width;
    this.updateGutterWidth();
  }

  /** Updates the gutter width. */
  private updateGutterWidth(): void {
    if (this.element) {
      if (this._dir === 'ltr') {
        this.element.style.inset = `0px 0px 0px ${this._gutterWidth}`;
      } else {
        this.element.style.inset = `0px ${this._gutterWidth} 0px 0px`;
      }
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
  get host(): HTMLElement {
    if (!this.element) {
      throw new Error('Not attached to a view.');
    }
    return this.element;
  }

  /**
   * Creates a new `EditorEventSource`.
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
    // Construct the editor element
    const editor = document.createElement('div');
    this.element = editor;
    editor.setAttribute('contenteditable', 'plaintext-only');
    if (editor.contentEditable !== 'plaintext-only') {
      editor.setAttribute('contenteditable', 'true');
    }
    editor.style.outline = 'none';
    editor.style.overflowWrap = 'break-word';
    editor.style.overflowY = 'auto';
    editor.style.whiteSpace = 'pre';
    editor.style.top = '0px';
    editor.style.right = '0px';
    editor.style.left = '0px';
    editor.style.bottom = '0px';
    editor.style.position = 'absolute';
    parent.appendChild(editor);

    this.language = 'text';
    this.updateGutterWidth();

    if (!this.element) {
      throw new Error('Could not create editor element');
    }

    this.bridge = new SelectionBridge(this.element);
    this._workingDocument = this.updateLastKnownDOMState();

    this.selectionChangeListener = () => {
      if (!this.focused) return;
      this.updateLastKnownDOMState();
    };
    this.window.document.addEventListener('selectionchange', this.selectionChangeListener);

    this.on('scroll', this.element, () => {
      if (!this.element)
        throw new Error('Unexpectedly, No element. Did you forget to call destroy()?');
      this.listener.scroll(this.element);
    });

    this.on('keydown', this.element, (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    });

    this.on('keyup', this.element, event => {
      if (!this.focused) return;
      if (event.defaultPrevented) return;
      if (event.isComposing) return;

      const editorEvent = new TextEditorKeyboardEvent(event);
      this.listener.keyup(editorEvent);
    });

    this.on('focus', this.element, () => {
      this.focused = true;
    });

    this.on('blur', this.element, () => {
      this.focused = false;
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

  /**
   * Handles a keydown event.
   *
   * @param event The event to handle.
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.focused) return;
    if (event.defaultPrevented) return;
    if (event.isComposing) return;

    const editorEvent = new TextEditorKeyboardEvent(event);

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

    // Several control keys fall through to the default behavior here.
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
