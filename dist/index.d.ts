import { CanvasRenderingContext2D, Image, ExportFormat, RenderOptions } from 'skia-canvas';

interface UnknownObject {
    [key: string]: any;
}
declare type DotType = 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded';
declare type CornerDotType = 'dot' | 'square';
declare type CornerSquareType = 'dot' | 'square' | 'extra-rounded';
declare type Extension = 'svg' | 'png' | 'jpeg' | 'webp';
declare type GradientType = 'radial' | 'linear';
declare type Gradient = {
    type: GradientType;
    rotation?: number;
    colorStops: {
        offset: number;
        color: string;
    }[];
};
interface DotTypes {
    [key: string]: DotType;
}
interface GradientTypes {
    [key: string]: GradientType;
}
interface CornerDotTypes {
    [key: string]: CornerDotType;
}
interface CornerSquareTypes {
    [key: string]: CornerSquareType;
}
declare type TypeNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40;
declare type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
declare type Mode = 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji';
interface QRCode {
    addData(data: string, mode?: Mode): void;
    make(): void;
    getModuleCount(): number;
    isDark(row: number, col: number): boolean;
    createImgTag(cellSize?: number, margin?: number): string;
    createSvgTag(cellSize?: number, margin?: number): string;
    createSvgTag(opts?: {
        cellSize?: number;
        margin?: number;
        scalable?: boolean;
    }): string;
    createDataURL(cellSize?: number, margin?: number): string;
    createTableTag(cellSize?: number, margin?: number): string;
    createASCII(cellSize?: number, margin?: number): string;
    renderTo2dContext(context: CanvasRenderingContext2D, cellSize?: number): void;
}
declare type Options = {
    width?: number;
    height?: number;
    margin?: number;
    data?: string;
    image?: string | Buffer | Image;
    qrOptions?: {
        typeNumber?: TypeNumber;
        mode?: Mode;
        errorCorrectionLevel?: ErrorCorrectionLevel;
    };
    imageOptions?: {
        hideBackgroundDots?: boolean;
        imageSize?: number;
        crossOrigin?: string;
        margin?: number;
    };
    dotsOptions?: {
        type?: DotType;
        color?: string;
        gradient?: Gradient;
    };
    cornersSquareOptions?: {
        type?: CornerSquareType;
        color?: string;
        gradient?: Gradient;
    };
    cornersDotOptions?: {
        type?: CornerDotType;
        color?: string;
        gradient?: Gradient;
    };
    backgroundOptions?: {
        color?: string;
        gradient?: Gradient;
    };
};
declare type FilterFunction = (i: number, j: number) => boolean;
declare type DownloadOptions = {
    name?: string;
    extension?: Extension;
};
declare type DrawArgs = {
    x: number;
    y: number;
    size: number;
    rotation?: number;
    getNeighbor?: GetNeighbor;
};
declare type BasicFigureDrawArgs = {
    x: number;
    y: number;
    size: number;
    rotation?: number;
};
declare type RotateFigureArgs = {
    x: number;
    y: number;
    size: number;
    rotation?: number;
    draw: () => void;
};
declare type DrawArgsCanvas = DrawArgs & {
    context: CanvasRenderingContext2D;
};
declare type BasicFigureDrawArgsCanvas = BasicFigureDrawArgs & {
    context: CanvasRenderingContext2D;
};
declare type RotateFigureArgsCanvas = RotateFigureArgs & {
    context: CanvasRenderingContext2D;
};
declare type GetNeighbor = (x: number, y: number) => boolean;

declare class QRCanvas {
    private _options;
    private _qr;
    private _image?;
    private _canvas;
    private _width;
    private _height;
    created: Promise<void>;
    constructor(options: Options);
    get context(): CanvasRenderingContext2D;
    get width(): number;
    get height(): number;
    private clear;
    private drawQR;
    private drawBackground;
    private drawDots;
    private drawCorners;
    private drawImage;
    private _createGradient;
    /**
     * Create a buffer object with the content of the qr code
     *
     * @param format Supported types: "png" | "jpg" | "jpeg" | "pdf" | "svg"
     * @param options export options see https://github.com/samizdatco/skia-canvas#tobufferformat-page-matte-density-quality-outline
     */
    toBuffer(format?: ExportFormat, options?: RenderOptions): Promise<Buffer>;
    /**
     *  Create a data url with the content of the qr code
     *
     * @param format Supported types: "png" | "jpg" | "jpeg" | "pdf" | "svg"
     * @param options export options see https://github.com/samizdatco/skia-canvas#tobufferformat-page-matte-density-quality-outline
     */
    toDataUrl(format?: ExportFormat, options?: RenderOptions): Promise<string>;
    /**
     * Create a file of the qr code and save it to disk
     *
     * @param filePath file path including extension
     * @param format Supported types: "png" | "jpg" | "jpeg" | "pdf" | "svg"
     * @param options export options see https://github.com/samizdatco/skia-canvas#tobufferformat-page-matte-density-quality-outline
     * @returns a promise that resolves once the file was written to disk
     */
    toFile(filePath: string, format?: ExportFormat, options?: RenderOptions): Promise<void>;
}

declare const _default$5: DotTypes;

declare const _default$4: CornerDotTypes;

declare const _default$3: CornerSquareTypes;

interface ErrorCorrectionLevels {
    [key: string]: ErrorCorrectionLevel;
}
declare const _default$2: ErrorCorrectionLevels;

interface ErrorCorrectionPercents {
    [key: string]: number;
}
declare const _default$1: ErrorCorrectionPercents;

interface Modes {
    [key: string]: Mode;
}
declare const _default: Modes;

interface TypesMap {
    [key: number]: TypeNumber;
}
declare const qrTypes: TypesMap;

export { BasicFigureDrawArgs, BasicFigureDrawArgsCanvas, CornerDotType, CornerDotTypes, CornerSquareType, CornerSquareTypes, DotType, DotTypes, DownloadOptions, DrawArgs, DrawArgsCanvas, ErrorCorrectionLevel, Extension, FilterFunction, GetNeighbor, Gradient, GradientType, GradientTypes, Mode, Options, QRCode, QRCanvas as QRCodeCanvas, RotateFigureArgs, RotateFigureArgsCanvas, TypeNumber, UnknownObject, _default$4 as cornerDotTypes, _default$3 as cornerSquareTypes, _default$5 as dotTypes, _default$2 as errorCorrectionLevels, _default$1 as errorCorrectionPercents, _default as modes, qrTypes };
