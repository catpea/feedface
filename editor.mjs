import { basicSetup } from "codemirror";

import {EditorView, keymap} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"

import { javascript } from "@codemirror/lang-javascript";

import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";


import { EditorState } from "@codemirror/state";

import theme from './solarized-dark.mjs';

const solarizedDark = theme(EditorView);



/**
 * <feed-face> Web Component
 * - Set .value to update the editor content.
 * - Get .value to retrieve the editor content.
 * - Place text between <feed-face> ... </feed-face> to use as initial content.
 * - Use the 'language' attribute to select syntax highlighting:
 *     "javascript", "html", "css", "json", "markdown"
 * - Line wrapping is enabled!
 *
 * Example usage:
 *
 * <feed-face language="javascript">
 *   console.log("Hello, world!");
 * </feed-face>
 */
class FeedFace extends HTMLElement {
  static get observedAttributes() {
    return ["language", "value"];
  }

  constructor() {
    super();
    this._editorView = null;
    this._container = document.createElement('div');
    this.attachShadow({ mode: 'open' }).appendChild(this._container);
    this._initialValue = null;
    // Always re-use this.extensions for consistent behavior
    this.extensions = [
      basicSetup,
      EditorView.lineWrapping,
      keymap.of([indentWithTab]),
      solarizedDark,
      ...this._getLanguageExtension()
    ];
  }

  connectedCallback() {
    // Prefer an explicit value attribute; otherwise, use light DOM content
    let value = this.getAttribute('value');
    if (value == null) value = this.textContent.trim();
    this._initialValue = value;
    // Clear the light DOM to prevent duplication
    this.textContent = "";
    this._initEditor(value, this.getAttribute("language"));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Don't react before connectedCallback
    if (!this.isConnected) return;
    if (name === "language" && oldValue !== newValue) {
      this._reinitEditor();
    }
    if (name === "value" && oldValue !== newValue) {
      this.value = newValue;
    }
  }

  /**
   * Initializes or re-initializes the CodeMirror editor.
   * @param {string} value - The content for the editor.
   * @param {string|null} language - The language mode.
   */
  _initEditor(value, language) {
    // Remove old editor if present
    if (this._editorView) {
      this._editorView.destroy();
      this._editorView = null;
      this._container.innerHTML = "";
    }
    const extensions = [
      ...this.extensions,
      ...this._getLanguageExtension(language)
    ];
    this._editorView = new EditorView({
      state: EditorState.create({
        doc: value || "",
        extensions
      }),
      parent: this._container
    });
  }

  /**
   * Reinitialize the editor with the current value and language.
   */
  _reinitEditor() {
    this._initEditor(this.value, this.getAttribute("language"));
  }

  /**
   * Set the editor content.
   * @param {string} val
   */
  set value(val) {
    if (this._editorView) {
      const state = EditorState.create({
        doc: val,
        extensions: [
          ...this.extensions,
          ...this._getLanguageExtension(this.getAttribute("language"))
        ]
      });
      this._editorView.setState(state);
    } else {
      this.setAttribute('value', val);
    }
  }

  /**
   * Get the editor content.
   * @returns {string}
   */
  get value() {
    if (this._editorView) {
      return this._editorView.state.doc.toString();
    }
    return this._initialValue != null ? this._initialValue : (this.getAttribute('value') || "");
  }

  /**
   * Get CodeMirror language extension based on the language attribute.
   * @param {string|null} lang
   * @returns {Array} Array of language extensions.
   */
  _getLanguageExtension(lang) {
    if (!lang) return [];
    switch (lang.toLowerCase()) {
      case "javascript":
      case "js":
        return [javascript()];
      case "html":
        return [html()];
      case "css":
        return [css()];
      case "json":
        return [json()];
      case "markdown":
      case "md":
        return [markdown()];
      default:
        return [];
    }
  }
}

customElements.define('feed-face', FeedFace);
export default FeedFace;
