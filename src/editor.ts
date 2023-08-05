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

// skipcq: JS-C1003: Wildcard Imports
import * as Gutter from './gutter';
import {Cursor} from './cursor';
import {EditorKeyboardEvent} from './editor_keyboard_event';
import {EditorOptions} from './editor_options';

/**
 * The `HistoryRecord` interface specifies the format of a history
 * record which is used to store the undo/redo history.
 */
interface HistoryRecord {
  html: string;
  pos: Position;
}

/**
 * A selection range.
 */
interface Position {
  start: number;
  end: number;
  dir?: '->' | '<-';
}

/**
 * The `Editor` interface specifies the methods that can be called on
 * an editor instance.
 */
export interface Editor {
  /**
   * Updates the text content of the editor.
   * @param code The new text content.
   */
  updateCode(code: string): void;
  /**
   * Attaches a callback that is called when the editor is updated.
   */
  onUpdate(callback: (code: string) => void): void;
  /**
   * Returns the text content of the editor.
   */
  toString(): string;
  /**
   * ٍٍReleases all resources used by the editor.
   */
  destroy(): void;
}

/**
 * The delay in milliseconds before the highlight function is called.
 * Additional highlight requests made within this time period will be
 * ignored.
 */
const HIGHLIGHT_DEBOUNCE_MS = 30;

/**
 * The delay in milliseconds before undo/redo history is updated.
 * Additional changes made within this time period will be
 * ignored for the purposes of scheduling an undo/redo history update.
 */
const HISTORY_DEBOUNCE_MS = 300;

/**
 * Creates a new editor instance.
 * @param parent The parent element to which the editor will be appended.
 * @param opt Options for the editor.
 * @returns A new editor instance.
 */
export function createEditor(parent: HTMLElement, opt: Partial<EditorOptions> = {}): Editor {
  const options: EditorOptions = {
    tab: '  ',
    language: 'text',
    indentOn: /[({[]$/,
    moveToNewLine: /^[)}\]]/,
    spellcheck: false,
    catchTab: true,
    multilineIndentation: false,
    preserveIdent: true,
    addClosing: true,
    history: true,
    window,
    dir: 'ltr',
    contentClass: 'kullna-editor-content',
    gutter: {},
    ...opt
  };

  // Default gutter options if not specified:
  if (options.gutter.dir === undefined) {
    options.gutter.dir = options.dir;
  }

  const wnd = options.window;
  const document = wnd.document;

  parent.style.position = 'relative';
  parent.style.overflow = 'hidden';
  parent.dir = options.dir;

  const editor = document.createElement('div');
  editor.setAttribute('contenteditable', 'plaintext-only');
  editor.setAttribute('spellcheck', options.spellcheck ? 'true' : 'false');
  editor.style.outline = 'none';
  editor.style.overflowWrap = 'break-word';
  editor.style.overflowY = 'auto';
  editor.style.whiteSpace = 'pre';
  editor.style.top = '0px';
  editor.style.right = '0px';
  editor.style.left = '0px';
  editor.style.bottom = '0px';
  editor.style.position = 'absolute';
  editor.className = `language-${options.language} ${options.contentClass}`;
  parent.appendChild(editor);

  const gutter = Gutter.createGutter(options.gutter);
  parent.appendChild(gutter.element);
  editor.addEventListener('scroll', () => (gutter.element.style.top = `-${editor.scrollTop}px`));

  if (gutter.options.dir === 'ltr') {
    editor.style.left = `${gutter.options.width}`;
  } else {
    editor.style.right = `${gutter.options.width}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listeners: [string, any][] = [];
  const history: HistoryRecord[] = [];
  let recording = false;
  let at = -1;
  let focus = false;
  let onUpdate: (code: string) => void = () => {
    return;
  };
  let prev: string; // code content prior keydown event

  const updateLineCount = () => {
    const code = editor.textContent ?? '';
    const linesCount = code.replace(/\n+$/, '\n').split('\n').length + 1;
    gutter.setNumberOfLines(linesCount);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const doHighlight = (editor: HTMLElement, pos?: Position) => {
    if (options.highlight) {
      const code = editor.textContent ?? '';
      editor.textContent = code;
      options.highlight(editor);
    }
    updateLineCount();
  };

  let isLegacy = false; // true if plaintext-only is not supported
  if (editor.contentEditable !== 'plaintext-only') isLegacy = true;
  if (isLegacy) {
    editor.setAttribute('contenteditable', 'true');
    // Disable multiline indentation if plaintext-only is not supported.
    options.multilineIndentation = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function debounce(cb: any, wait: number) {
    let timeout = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...args: any) => {
      clearTimeout(timeout);
      timeout = wnd.setTimeout(() => cb(...args), wait);
    };
  }

  const debounceHighlight = debounce(() => {
    const pos = save();
    doHighlight(editor, pos);
    restore(pos);
  }, HIGHLIGHT_DEBOUNCE_MS);

  const debounceRecordHistory = debounce((event: EditorKeyboardEvent) => {
    if (event.isMutatingInput) {
      recordHistory();
      recording = false;
    }
  }, HISTORY_DEBOUNCE_MS);

  const on = <K extends keyof HTMLElementEventMap>(
    type: K,
    fn: (event: HTMLElementEventMap[K]) => void
  ) => {
    listeners.push([type, fn]);
    editor.addEventListener(type, fn);
  };

  on('keydown', event => {
    if (event.defaultPrevented) return;

    const editorEvent = new EditorKeyboardEvent(event);

    prev = editorTextContent();
    if (options.preserveIdent) {
      handleNewLine(editorEvent);
    } else {
      legacyNewLineFix(editorEvent);
    }
    if (options.catchTab) handleTabCharacters(editorEvent);
    if (options.addClosing) handleSelfClosingCharacters(editorEvent);
    if (options.history) {
      handleUndoRedo(editorEvent);
      if (editorEvent.isMutatingInput && !recording) {
        recordHistory();
        recording = true;
      }
    }
    if (isLegacy && !editorEvent.isCopy) restore(save());
  });

  on('keyup', event => {
    if (event.defaultPrevented) return;
    if (event.isComposing) return;

    const editorEvent = new EditorKeyboardEvent(event);

    if (prev !== editorTextContent()) debounceHighlight();
    debounceRecordHistory(editorEvent);
    onUpdate(editorTextContent());
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  on('focus', _event => {
    focus = true;
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  on('blur', _event => {
    focus = false;
  });

  on('paste', event => {
    recordHistory();
    handlePaste(event);
    recordHistory();
    onUpdate(editorTextContent());
  });

  on('cut', event => {
    recordHistory();
    handleCut(event);
    recordHistory();
    onUpdate(editorTextContent());
  });

  /**
   * Obtains the current cursor position.
   * @returns The current position.
   */
  function save(): Position {
    const selection = Cursor.getSelection(editor);
    const pos: Position = {start: 0, end: 0, dir: undefined};

    let {anchorNode, anchorOffset, focusNode, focusOffset} = selection;
    if (!anchorNode || !focusNode) {
      throw new Error('AnchorNode or FocusNode not found when saving selection.');
    }

    // If the anchor and focus are the editor element, return either a full
    // highlight or a start/end cursor position depending on the selection
    if (anchorNode === editor && focusNode === editor) {
      pos.start = anchorOffset > 0 && editor.textContent ? editor.textContent.length : 0;
      pos.end = focusOffset > 0 && editor.textContent ? editor.textContent.length : 0;
      pos.dir = focusOffset >= anchorOffset ? '->' : '<-';
      return pos;
    }

    // Selection anchor and focus are expected to be text nodes,
    // so normalize them.
    if (anchorNode.nodeType === Node.ELEMENT_NODE) {
      const node = document.createTextNode('');
      anchorNode.insertBefore(node, anchorNode.childNodes[anchorOffset]);
      anchorNode = node;
      anchorOffset = 0;
    }
    if (focusNode.nodeType === Node.ELEMENT_NODE) {
      const node = document.createTextNode('');
      focusNode.insertBefore(node, focusNode.childNodes[focusOffset]);
      focusNode = node;
      focusOffset = 0;
    }

    visit(editor, el => {
      if (el === anchorNode && el === focusNode) {
        pos.start += anchorOffset;
        pos.end += focusOffset;
        pos.dir = anchorOffset <= focusOffset ? '->' : '<-';
        return 'stop';
      }

      if (el === anchorNode) {
        pos.start += anchorOffset;
        if (!pos.dir) {
          pos.dir = '->';
        } else {
          return 'stop';
        }
      } else if (el === focusNode) {
        pos.end += focusOffset;
        if (!pos.dir) {
          pos.dir = '<-';
        } else {
          return 'stop';
        }
      }

      if (el.nodeValue && el.nodeType === Node.TEXT_NODE) {
        if (pos.dir !== '->') pos.start += el.nodeValue.length;
        if (pos.dir !== '<-') pos.end += el.nodeValue.length;
      }

      return 'continue';
    });

    editor.normalize(); // collapse empty text nodes
    return pos;
  }

  /**
   * Restores the cursor to a previous position.
   * @param pos The position to restore.
   */
  function restore(pos: Position) {
    const selection = Cursor.getSelection(editor);
    let startNode: Node | undefined,
      startOffset = 0;
    let endNode: Node | undefined,
      endOffset = 0;

    if (!pos.dir) pos.dir = '->';
    if (pos.start < 0) pos.start = 0;
    if (pos.end < 0) pos.end = 0;

    // Flip start and end if the direction reversed
    if (pos.dir === '<-') {
      const {start, end} = pos;
      pos.start = end;
      pos.end = start;
    }

    let current = 0;

    visit(editor, el => {
      if (el.nodeType !== Node.TEXT_NODE) return 'continue';

      const len = (el.nodeValue ?? '').length;
      if (current + len > pos.start) {
        if (!startNode) {
          startNode = el;
          startOffset = pos.start - current;
        }
        if (current + len > pos.end) {
          endNode = el;
          endOffset = pos.end - current;
          return 'stop';
        }
      }
      current += len;

      return 'continue';
    });

    if (!startNode) {
      startNode = editor;
      startOffset = editor.childNodes.length;
    }

    if (!endNode) {
      endNode = editor;
      endOffset = editor.childNodes.length;
    }

    // Flip back the selection
    if (pos.dir === '<-') {
      [startNode, startOffset, endNode, endOffset] = [endNode, endOffset, startNode, startOffset];
    }

    // If nodes not editable, create a text node.
    const startEl = uneditable(startNode);
    if (startEl) {
      const node = document.createTextNode('');
      startEl.parentNode?.insertBefore(node, startEl);
      startNode = node;
      startOffset = 0;
    }
    const endEl = uneditable(endNode);
    if (endEl) {
      const node = document.createTextNode('');
      endEl.parentNode?.insertBefore(node, endEl);
      endNode = node;
      endOffset = 0;
    }

    selection.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
    editor.normalize(); // collapse empty text nodes
  }

  /**
   * Searches up the DOM tree for the first element that is not editable.
   * @param node The node to start searching from.
   * @returns The found element or undefined if none was found.
   */
  function uneditable(node: Node): Element | undefined {
    let searchingNode: Node | null = node;
    while (searchingNode && searchingNode !== editor) {
      if (searchingNode.nodeType === Node.ELEMENT_NODE) {
        const el = searchingNode as Element;
        if (el.getAttribute('contenteditable') === 'false') {
          return el;
        }
      }
      searchingNode = searchingNode.parentNode;
    }
  }

  function legacyNewLineFix(event: EditorKeyboardEvent) {
    // Firefox does not support plaintext-only mode
    // and puts <div><br></div> on Enter. Let's help.
    if (isLegacy && event.isEnter) {
      event.preventDefault();
      event.stopPropagation();
      if (Cursor.textAfterCursor(editor) === '') {
        insert('\n ');
        const pos = save();
        pos.start = --pos.end;
        restore(pos);
      } else {
        insert('\n');
      }
    }
  }

  /**
   * Expands (or shrinks) a range by a given number of characters by adding
   * (or removing) a given number of characters from the tail of the range.
   * @param range The range to expand.
   * @param additionalCharacters The number of characters to expand by.
   * @returns A new range representing the original range expanded by the given
   *    number of characters (in the tail direction.)
   * @description Passing a negative value for the `additionalCharacters`
   *    parameter will shrink the range instead of expanding it. This is by
   *    design.
   */
  function inflateRange(range: Position, additionalCharacters: number) {
    if (range.dir === '->') {
      return {start: range.start, end: range.end + additionalCharacters, dir: range.dir};
    } else {
      return {start: range.start + additionalCharacters, end: range.end, dir: range.dir};
    }
  }

  /**
   * Handles "enter" key press.
   * @param event The keydown event.
   */
  function handleNewLine(event: EditorKeyboardEvent) {
    if (event.isEnter) {
      const before = Cursor.textBeforeCursor(editor);
      const after = Cursor.textAfterCursor(editor);

      const [padding] = findPadding(before);
      let newLinePadding = padding;

      // If last symbol is "{" ident new line
      if (options.indentOn.test(before)) {
        newLinePadding += options.tab;
      }

      // Preserve padding
      if (newLinePadding.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        insert(`\n${newLinePadding}`);
      } else {
        legacyNewLineFix(event);
      }

      // Place adjacent "}" on next line
      if (newLinePadding !== padding && options.moveToNewLine.test(after)) {
        const pos = save();
        insert(`\n${padding}`);
        restore(pos);
      }
    }
  }

  /**
   * Handles inserting closing characters if the user enters a starting character.
   * @param event The keydown event.
   */
  function handleSelfClosingCharacters(event: EditorKeyboardEvent) {
    const open = `([{'"`;
    const close = `)]}'"`;
    const codeAfter = Cursor.textAfterCursor(editor);
    const codeBefore = Cursor.textBeforeCursor(editor);
    const escapeCharacter = codeBefore.substr(codeBefore.length - 1) === '\\';
    const charAfter = codeAfter.substr(0, 1);
    if (close.includes(event.keyCode) && !escapeCharacter && charAfter === event.keyCode) {
      // We already have closing char next to cursor.
      // Move one char to right.
      const pos = save();
      event.preventDefault();
      pos.start = ++pos.end;
      restore(pos);
    } else if (
      open.includes(event.keyCode) &&
      !escapeCharacter &&
      (`"'`.includes(event.keyCode) || ['', ' ', '\n'].includes(charAfter))
    ) {
      event.preventDefault();
      const pos = save();
      const wrapText = pos.start === pos.end ? '' : Cursor.getSelection(editor).toString();
      const text = event.keyCode + wrapText + close[open.indexOf(event.keyCode)];
      insert(text);
      pos.start++;
      pos.end++;
      restore(pos);
    }
  }

  /**
   * Handles inserting tab characters when the user presses the tab key.
   * @param event The keydown event.
   */
  function handleTabCharacters(event: EditorKeyboardEvent) {
    if (!event.isTab) {
      return;
    }
    event.preventDefault();

    // For standard tab behavior, simply allow the tab to be inserted (or
    // removed.) This behavior could probably be combined with the multi-line
    // behavior below but this is being left as-is for now to de-risk the
    // multiline behavior change and maintain the previous behavior of the
    // library by default.
    const selection = Cursor.getSelection(editor);
    if (!options.multilineIndentation || selection.getRangeAt(0).collapsed) {
      if (event.isShift) {
        const before = Cursor.textBeforeCursor(editor);
        const [padding, start] = findPadding(before);
        if (padding.length > 0) {
          const pos = save();
          // Remove full length tab or just remaining padding
          const len = Math.min(options.tab.length, padding.length);
          restore({start, end: start + len});
          document.execCommand('delete');
          pos.start -= len;
          pos.end -= len;
          restore(pos);
        }
      } else {
        insert(options.tab);
      }
      return;
    }

    // For multi-line tab behavior, we indent or dedent the selected lines.
    // Since this operation effects the entire line, we extend the selection
    // to cover the entire line before proceeding.
    // Firefox's support for calling .modify() on a selection is limited.
    // It will only modify the user's original selection, and will not
    // modify any selection that was created programmatically. So we have
    // disabled this feature for Firefox until we can find a workaround.
    selection.modify('extend', 'backward', 'lineboundary');
    selection.modify('extend', 'forward', 'lineboundary');
    const selectedText = selection.getRangeAt(0).toString();
    const selectedLines = selectedText.split('\n');
    const lineCount = selectedLines.length;

    const initialSelection = save();

    let insertedCharacters = 0;
    // If the shift key is being held, it's a dedent request.
    if (event.isShift) {
      for (let i = 0; i < lineCount; i++) {
        // We can only dedent lines that begin with some sort of whitespace.
        // So we check for that first, and never consume more characters than
        // there is whitespace.
        const match = /^\s+/.exec(selectedLines[i]);
        if (match !== null) {
          const leadingSpace = match[0];
          const originalLength = selectedLines[i].length;
          if (leadingSpace.length >= options.tab.length) {
            selectedLines[i] = selectedLines[i].slice(options.tab.length);
          } else if (leadingSpace.length > 0) {
            selectedLines[i] = selectedLines[i].slice(leadingSpace.length);
          }
          insertedCharacters = insertedCharacters + (selectedLines[i].length - originalLength);
        }
      }
    } else {
      insertedCharacters = lineCount * options.tab.length;
      for (let i = 0; i < lineCount; i++) {
        selectedLines[i] = options.tab + selectedLines[i];
      }
    }

    insert(selectedLines.join('\n'));
    restore(inflateRange(initialSelection, insertedCharacters));
  }

  /**
   * Handles undo/redo.
   * @param event The keydown event.
   */
  function handleUndoRedo(event: EditorKeyboardEvent) {
    if (event.isUndo) {
      event.preventDefault();
      at--;
      const record = history[at];
      if (record) {
        editor.innerHTML = record.html;
        restore(record.pos);
      }
      if (at < 0) at = 0;
    }
    if (event.isRedo) {
      event.preventDefault();
      at++;
      const record = history[at];
      if (record) {
        editor.innerHTML = record.html;
        restore(record.pos);
      }
      if (at >= history.length) at--;
    }
  }

  /**
   * Records the current state of the editor in the undo/redo history.
   */
  function recordHistory() {
    if (!focus) return;

    const html = editor.innerHTML;
    const pos = save();

    const lastRecord = history[at];
    if (lastRecord) {
      if (
        lastRecord.html === html &&
        lastRecord.pos.start === pos.start &&
        lastRecord.pos.end === pos.end
      )
        return;
    }

    at++;
    history[at] = {html, pos};
    history.splice(at + 1);

    const maxHistory = 300;
    if (at > maxHistory) {
      at = maxHistory;
      history.splice(0, 1);
    }
  }

  /**
   * Handles pasting text into the editor.
   * @param event The paste event.
   */
  function handlePaste(event: ClipboardEvent) {
    if (event.defaultPrevented) return;
    event.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalEvent = (event as any).originalEvent ?? event;
    const text = originalEvent.clipboardData.getData('text/plain').replace(/\r\n?/g, '\n');
    const pos = save();
    insert(text);
    doHighlight(editor);
    restore({
      start: Math.min(pos.start, pos.end) + text.length,
      end: Math.min(pos.start, pos.end) + text.length,
      dir: '<-'
    });
  }

  /**
   * Handles cutting text from the editor.
   * @param event The cut event.
   */
  function handleCut(event: ClipboardEvent) {
    const pos = save();
    const selection = Cursor.getSelection(editor);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalEvent = (event as any).originalEvent ?? event;
    originalEvent.clipboardData.setData('text/plain', selection.toString());
    document.execCommand('delete');
    doHighlight(editor);
    restore({
      start: Math.min(pos.start, pos.end),
      end: Math.min(pos.start, pos.end),
      dir: '<-'
    });
    event.preventDefault();
  }

  /**
   * A generic tree traversal function.
   * @param editor The element to begin traversing from.
   * @param visitor A function that is called for each node in the tree.
   */
  function visit(editor: HTMLElement, visitor: (el: Node) => 'stop' | 'continue') {
    const queue: Node[] = [];

    if (editor.firstChild) queue.push(editor.firstChild);

    let el = queue.pop();

    while (el) {
      if (visitor(el) === 'stop') break;

      if (el.nextSibling) queue.push(el.nextSibling);
      if (el.firstChild) queue.push(el.firstChild);

      el = queue.pop();
    }
  }

  /**
   * Performs primitive HTML escaping and inserts the given text into the editor.
   * @param text The text to sanitize and insert.
   */
  function insert(text: string) {
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    document.execCommand('insertHTML', false, text);
  }

  function findPadding(text: string): [string, number, number] {
    // Find beginning of previous line.
    let i = text.length - 1;
    while (i >= 0 && text[i] !== '\n') i--;
    i++;
    // Find padding of the line.
    let j = i;
    while (j < text.length && /[ \t]/.test(text[j])) j++;
    return [text.substring(i, j), i, j];
  }

  /**
   * Returns the text content of the editor.
   * @returns The text content of the editor.
   */
  function editorTextContent() {
    return editor.textContent ?? '';
  }

  return {
    updateCode(code: string) {
      editor.textContent = code;
      doHighlight(editor);
    },
    onUpdate(callback: (code: string) => void) {
      onUpdate = callback;
    },
    toString: editorTextContent,
    destroy() {
      for (const [type, fn] of listeners) {
        editor.removeEventListener(type, fn);
      }
    }
  };
}
