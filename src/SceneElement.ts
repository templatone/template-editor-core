import { LitElement } from 'lit';
import { state } from 'lit/decorators.js'
import { WebFonts as WebFontUtils } from "@templatone/utils";
import { ControllerEvent } from "./ControllerEvent.js";
import { updateConfig } from "./ConfigType.js";
import { SceneEvent } from "./SceneEvent.js";
import { EditorEvent } from './EditorEvent.js';
import type { ExportDataType } from './ExportDataType.js';
import type { ConfigType } from "./ConfigType.js";
import type { IData } from './IData.js';
import type { WeightType as FontWeightType } from "@templatone/utils/lib/WebFonts.js";


export abstract class SceneElement<D extends IData> extends LitElement {

    private _templateDataUrl: string | null = null;
    get templateDataUrl(): string {
        if (this._templateDataUrl == null) throw new Error("storePath has not been set yet.");
        return this._templateDataUrl;
    }



    constructor(width: number | { (): number }, height: number | { (): number }) {
        super();

        this._getWidthCallback = typeof width === 'number' ? (() => width) : width;
        this._getHeightCallback = typeof height === 'number' ? (() => height) : height;

        this.startup();
    }


    // Lit
    connectedCallback() {
        super.connectedCallback();

        window.addEventListener('controller-ready', this._onControllerReadyHandle.bind(this), { once: true });
        window.addEventListener('controller-data-update', this._onControllerUpdateHandle.bind(this), false);
        window.addEventListener('editor-export-request', this._onEditorExportRequestHandle.bind(this), false);
    }


    disconnectedCallback() {
        super.disconnectedCallback();

        window.removeEventListener('controller-data-update', this._onControllerUpdateHandle);
        window.removeEventListener('editor-export-request', this._onEditorExportRequestHandle);
    }


    // Life Cycle
    private async startup(): Promise<void> {
        await this._load();

        this._isReadyToggle = true;
        this._fireReadyEvent();
    }


    private async _load(): Promise<void> {
        this._templateDataUrl = this.getAttribute('tempalte-data-url')!;

        await this._loadConfig();
        await this._loadFonts();

        this._isLoadedToggle = true;
        this._fireLoadEvent();
    }


    private async _loadConfig(): Promise<void> {
        const path = `${this.templateDataUrl}/config.json`;

        const response = await fetch(path);
        const data = await response.json();

        this._config = updateConfig(data);
    }


    private async _loadFonts(): Promise<void> {
        const config = this.getConfig();

        if (!config.assets.fonts) return;

        const fontCssPath = `${this.templateDataUrl}/fonts.css`;

        const familyDescriptions = WebFontUtils.convertFacesToFamilies(config.assets.fonts.map(f => {
            return {
                family: f.family,
                path: f.filename,
                style: f.italic ? 'italic' : 'normal',
                weight: f.weight as FontWeightType,
            }
        }));

        const families = familyDescriptions.map(f => WebFontUtils.computeFamilyQuery(f.family, f.variations));

        const webFontConfig: WebFont.Config = {
            classes: false,
            timeout: 30 * 1000,
            custom: {
                families: families,
                urls: [fontCssPath]
            },
        };

        await WebFontUtils.load(webFontConfig);
    }


    // Platform
    private _config: ConfigType | null = null;
    getConfig(): ConfigType {
        if (this._config == null) throw new Error("Config has not been set yet.");
        return this._config;
    }


    // - Load
    private _isLoadedToggle: boolean = false;
    isLoaded(): boolean {
        return this._isLoadedToggle;
    }


    // Sizes
    @state()
    private _lastWidth = 0;
    private _getWidthCallback?: { (): number };


    getWidth(): number {
        if (this._getWidthCallback === undefined) return 0;

        const value = this._getWidthCallback()

        if (value !== this._lastWidth) {
            this._lastWidth = value;

            this._fireResizeEvent();
        }

        return value;
    }


    @state()
    private _lastHeight = 0;
    private _getHeightCallback?: { (): number };


    getHeight(): number {
        if (this._getHeightCallback === undefined) return 0;

        const value = this._getHeightCallback();

        if (value !== this._lastHeight) {
            this._lastHeight = value;
            this._fireResizeEvent();
        }

        return value;
    }


    // Data
    private _data: D | null = null;


    getData(): D {
        if (this._data === null) throw new Error("Data is null. Test int by method hasData");

        return this._data;
    }


    hasData(): boolean {
        return this._data !== null;
    }


    isValid(): boolean {
        throw new Error(`${this.tagName}: method "isValid" is not defined.`);
    }


    private _lastValidityState: boolean = false;
    setValidityState(valid: boolean) {
        if (this._lastValidityState !== valid) {
            this._fireChangeValidityEvent();
        }

        this._lastValidityState = valid;
    }


    private _isReadyToggle: boolean = false;
    isReady(): boolean {
        return this._isReadyToggle;
    }


    async getExportData(): Promise<ExportDataType> {
        throw new Error(`${this.tagName}: Method 'ExportDataType' is not defined.`);
    }


    // Handlers
    private _onEditorExportRequestHandle(e: EditorEvent<D>) {
        e.stopPropagation();

        this._fireExportEvent();
    }


    private _onControllerReadyHandle(e: ControllerEvent<D>) {
        e.stopPropagation();

        console.log("this", this);
        

        this._fireReadyEvent();
    }


    private _onControllerUpdateHandle(e: ControllerEvent<D>) {
        e.stopPropagation();

        this._data = e.detail.data;
    }


    // Event fireing
    private _fireReadyEvent(): void {
        const event = new SceneEvent('scene-ready', this, this.isValid())
        this.dispatchEvent(event);
    }


    private _fireLoadEvent(): void {
        const event = new SceneEvent('scene-load', this, this.isValid())
        this.dispatchEvent(event);
    }


    private _fireResizeEvent(): void {
        const event = new SceneEvent('scene-resize', this, this.isValid())
        this.dispatchEvent(event);
    }


    private _fireExportEvent(): void {
        const event = new SceneEvent('scene-export', this, this.isValid())
        this.dispatchEvent(event);
    }


    private _fireChangeValidityEvent(): void {
        const event = new SceneEvent('scene-change-validity', this, this.isValid())
        this.dispatchEvent(event);
    }

}