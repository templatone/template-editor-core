import { LitElement } from 'lit';
import type { ExportDataType } from './ExportDataType.js';
import type { ConfigType } from "./ConfigType.js";
import type { IData } from './IData.js';
export declare abstract class SceneElement<D extends IData> extends LitElement {
    private _storePath;
    get storePath(): string;
    constructor(width: number | {
        (): number;
    }, height: number | {
        (): number;
    });
    private _controller;
    private _lastWidth;
    private _getWidthCallback?;
    getWidth(): number;
    private _lastHeight;
    private _getHeightCallback?;
    getHeight(): number;
    private _data;
    private _isDataValidToggle;
    private _updateData;
    getData(): D;
    hasData(): boolean;
    isDataValid(): boolean;
    private _config;
    getConfig(): ConfigType;
    init(): Promise<void>;
    private _isLoadedToggle;
    isLoaded(): boolean;
    private _load;
    private _loadConfig;
    private _loadFonts;
    private _isReadyToggle;
    isReady(): boolean;
    private _startup;
    startup(): Promise<void>;
    getExportData(): Promise<ExportDataType>;
    private _onEditorExportRequest;
    private _onControllerReady;
    private _onControllerUpdate;
    private _fireReadyEvent;
    private _fireSourceLoadEvent;
    private _fireResizeEvent;
    private _fireExportEvent;
}
