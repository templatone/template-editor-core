var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorate = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
import {LitElement} from "./web-modules/pkg/lit.js";
import {state} from "./web-modules/pkg/lit/decorators.js";
import {WebFonts as WebFontUtils} from "./web-modules/pkg/@templatone/utils.js";
import {processConfig} from "./ConfigType.js";
import {SceneEvent} from "./SceneEvent.js";
export class SceneElement extends LitElement {
  constructor(width, height) {
    super();
    this._templateRootUrl = null;
    this._config = null;
    this._isLoadedToggle = false;
    this._lastWidth = 0;
    this._lastHeight = 0;
    this._data = null;
    this._lastValidityState = false;
    this._isReadyToggle = false;
    this._getWidthCallback = typeof width === "number" ? () => width : width;
    this._getHeightCallback = typeof height === "number" ? () => height : height;
    this.startup();
  }
  get templateRootUrl() {
    if (this._templateRootUrl == null)
      throw new Error("templateRootUrl has not been set yet.");
    return this._templateRootUrl;
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("controller-ready", this._onControllerReadyHandle.bind(this), {once: true});
    window.addEventListener("controller-data-update", this._onControllerUpdateHandle.bind(this), false);
    window.addEventListener("editor-scene-request", this._onEditorSceneRequestHandle.bind(this), false);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("controller-data-update", this._onControllerUpdateHandle);
    window.removeEventListener("editor-scene-request", this._onEditorSceneRequestHandle);
  }
  async startup() {
    await this._load();
    this._isReadyToggle = true;
    this._fireReadyEvent();
  }
  async _load() {
    this._templateRootUrl = this.getAttribute("tempalte-root-url");
    await this._loadConfig();
    await this._loadFonts();
    this._isLoadedToggle = true;
    this._fireLoadEvent();
  }
  async _loadConfig() {
    const path = `${this.templateRootUrl}/config.json`;
    const response = await fetch(path);
    const data = await response.json();
    this._config = processConfig(data, this.templateRootUrl);
  }
  async _loadFonts() {
    const config = this.getConfig();
    if (!config.fonts)
      return;
    const fontCssPath = `${this.templateRootUrl}/fonts.css`;
    const familyDescriptions = WebFontUtils.convertFacesToFamilies(config.fonts.map((f) => {
      return {
        family: f.family,
        path: f.file,
        style: f.italic ? "italic" : "normal",
        weight: f.weight
      };
    }));
    const families = familyDescriptions.map((f) => WebFontUtils.computeFamilyQuery(f.family, f.variations));
    const webFontConfig = {
      classes: false,
      timeout: 30 * 1e3,
      custom: {
        families,
        urls: [fontCssPath]
      }
    };
    await WebFontUtils.load(webFontConfig);
  }
  getConfig() {
    if (this._config == null)
      throw new Error("Config has not been set yet.");
    return this._config;
  }
  isLoaded() {
    return this._isLoadedToggle;
  }
  getWidth() {
    if (this._getWidthCallback === void 0)
      return 0;
    const value = this._getWidthCallback();
    if (value !== this._lastWidth) {
      this._lastWidth = value;
      this._fireResizeEvent();
    }
    return value;
  }
  getHeight() {
    if (this._getHeightCallback === void 0)
      return 0;
    const value = this._getHeightCallback();
    if (value !== this._lastHeight) {
      this._lastHeight = value;
      this._fireResizeEvent();
    }
    return value;
  }
  getData() {
    if (this._data === null)
      throw new Error("Data is null. Test int by method hasData");
    return this._data;
  }
  hasData() {
    return this._data !== null;
  }
  setValidityState(valid) {
    if (this._lastValidityState !== valid) {
      this._fireChangeValidityEvent();
    }
    this._lastValidityState = valid;
  }
  isReady() {
    return this._isReadyToggle;
  }
  _onEditorSceneRequestHandle(e) {
    e.stopPropagation();
    this._fireResponseEvent();
  }
  _onControllerReadyHandle(e) {
    e.stopPropagation();
    this._fireReadyEvent();
  }
  _onControllerUpdateHandle(e) {
    e.stopPropagation();
    const data = e.detail.controller.getData();
    this._data = {...data};
  }
  _fireReadyEvent() {
    const event = new SceneEvent("scene-ready", this, this.isValid());
    this.dispatchEvent(event);
  }
  _fireLoadEvent() {
    const event = new SceneEvent("scene-load", this, this.isValid());
    this.dispatchEvent(event);
  }
  _fireUpdateEvent() {
    const event = new SceneEvent("scene-update", this, this.isValid());
    this.dispatchEvent(event);
  }
  _fireResizeEvent() {
    const event = new SceneEvent("scene-resize", this, this.isValid());
    this.dispatchEvent(event);
  }
  _fireChangeValidityEvent() {
    const event = new SceneEvent("scene-change-validity", this, this.isValid());
    this.dispatchEvent(event);
  }
  _fireResponseEvent() {
    const event = new SceneEvent("scene-response", this, this.isValid());
    this.dispatchEvent(event);
  }
}
__decorate([
  state()
], SceneElement.prototype, "_lastWidth", 2);
__decorate([
  state()
], SceneElement.prototype, "_lastHeight", 2);
