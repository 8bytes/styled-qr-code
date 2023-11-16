import calculateImageSize from '../tools/calculateImageSize.js';
import errorCorrectionPercents from '../constants/errorCorrectionPercents.js';
import QRDot from '../figures/dot/QRDot.js';
import QRCornerSquare from '../figures/cornerSquare/QRCornerSquare.js';
import QRCornerDot from '../figures/cornerDot/QRCornerDot.js';
import defaultOptions, { RequiredOptions } from './QROptions.js';
import { QRCode, FilterFunction, Options } from '../types';
import getMode from '../tools/getMode.js';
// import { Canvas, CanvasRenderingContext2D, ExportFormat, RenderOptions, loadImage, Image } from 'skia-canvas';
import { Canvas, Image, CanvasRenderingContext2D, loadImage, JpegConfig, PdfConfig, PngConfig } from 'canvas'
import qrcode from 'qrcode-generator';
import mergeDeep from '../tools/merge.js';
import sanitizeOptions from '../tools/sanitizeOptions.js';

const squareMask = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

const dotMask = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
];

export default class QRCanvas {
  private _options: RequiredOptions;
  private _qr: QRCode;
  private _image?: Image;
  private _canvas: Canvas;
  private _width: number;
  private _height: number;

  public created: Promise<void>;

  //TODO don't pass all options to this class
  constructor(options: Options) {
    const mergedOptions = sanitizeOptions(mergeDeep(defaultOptions, options) as RequiredOptions);

    this._width = mergedOptions.width;
    this._height = mergedOptions.height;
    this._canvas = new Canvas(this._width, this._height);

    this._options = mergedOptions;

    //Explicit cast due to type mismatch on skia canvas and qrcode types. Due to missing function definition in skia canvas renderer which is never used
    this._qr = qrcode(
      this._options.qrOptions.typeNumber,
      this._options.qrOptions.errorCorrectionLevel
    ) as any as QRCode;

    this._qr.addData(this._options.data, this._options.qrOptions.mode || getMode(this._options.data));
    this.created = this.drawQR();
  }

  get context(): CanvasRenderingContext2D {
    return this._canvas.getContext('2d');
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  private clear(): void {
    const canvasContext = this.context;

    if (canvasContext) {
      canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }
  }

  private async drawQR(): Promise<void> {
    this._qr.make();
    const count = this._qr.getModuleCount();
    const minSize = Math.min(this._options.width, this._options.height) - this._options.margin * 2;
    const dotSize = Math.floor(minSize / count);
    let drawImageSize = {
      hideXDots: 0,
      hideYDots: 0,
      width: 0,
      height: 0
    };

    if (this._options.image !== undefined) {
      if (typeof this._options.image === 'string' || Buffer.isBuffer(this._options.image)) {
        this._image = await loadImage(this._options.image);
      } else {
        this._image = this._options.image;
      }

      const { imageOptions, qrOptions } = this._options;
      const coverLevel = imageOptions.imageSize * errorCorrectionPercents[qrOptions.errorCorrectionLevel];
      const maxHiddenDots = Math.floor(coverLevel * count * count);

      drawImageSize = calculateImageSize({
        originalWidth: this._image.width,
        originalHeight: this._image.height,
        maxHiddenDots,
        maxHiddenAxisDots: count - 14,
        dotSize
      });
    }

    this.clear();
    this.drawDots((i: number, j: number): boolean => {
      if (this._options.imageOptions.hideBackgroundDots) {
        if (
          i >= (count - drawImageSize.hideXDots) / 2 &&
          i < (count + drawImageSize.hideXDots) / 2 &&
          j >= (count - drawImageSize.hideYDots) / 2 &&
          j < (count + drawImageSize.hideYDots) / 2
        ) {
          return false;
        }
      }

      if (squareMask[i]?.[j] || squareMask[i - count + 7]?.[j] || squareMask[i]?.[j - count + 7]) {
        return false;
      }

      if (dotMask[i]?.[j] || dotMask[i - count + 7]?.[j] || dotMask[i]?.[j - count + 7]) {
        return false;
      }

      return true;
    });
    this.drawCorners();

    if (this._options.image !== undefined) {
      this.drawImage({ width: drawImageSize.width, height: drawImageSize.height, count, dotSize });
    }
  }

  private drawDots(filter?: FilterFunction): void {
    if (!this._qr) {
      throw 'QR code is not defined';
    }

    const canvasContext = this.context;

    if (!canvasContext) {
      throw 'QR code is not defined';
    }

    const options = this._options;
    const count = this._qr.getModuleCount();

    if (count > options.width || count > options.height) {
      throw 'The canvas is too small.';
    }

    const minSize = Math.min(options.width, options.height) - options.margin * 2;
    const dotSize = Math.floor(minSize / count);
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);
    const dot = new QRDot({ context: canvasContext, type: options.dotsOptions.type });

    canvasContext.beginPath();

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        if (filter && !filter(i, j)) {
          continue;
        }
        if (!this._qr.isDark(i, j)) {
          continue;
        }

        const x = yBeginning + j * dotSize;
        const y = xBeginning + i * dotSize;

        dot.draw(x, y, dotSize, (xOffset: number, yOffset: number): boolean => {
          if (j + xOffset < 0 || i + yOffset < 0 || j + xOffset >= count || i + yOffset >= count) return false;
          if (filter && !filter(j + xOffset, i + yOffset)) return false;
          return !!this._qr && this._qr.isDark(i + yOffset, j + xOffset);
        });
      }
    }

    if (options.dotsOptions.color) {
      canvasContext.fillStyle = canvasContext.strokeStyle = options.dotsOptions.color;
    }

    canvasContext.fill('evenodd');
  }

  private drawCorners(filter?: FilterFunction): void {
    if (!this._qr) {
      throw 'QR code is not defined';
    }

    const canvasContext = this.context;

    if (!canvasContext) {
      throw 'QR code is not defined';
    }

    const options = this._options;

    const count = this._qr.getModuleCount();
    const minSize = Math.min(options.width, options.height) - options.margin * 2;
    const dotSize = Math.floor(minSize / count);
    const cornersSquareSize = dotSize * 7;
    const cornersDotSize = dotSize * 3;
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);

    [
      [0, 0, 0],
      [1, 0, Math.PI / 2],
      [0, 1, -Math.PI / 2]
    ].forEach(([column, row, rotation]) => {
      if (filter && !filter(column, row)) {
        return;
      }

      const x = xBeginning + column * dotSize * (count - 7);
      const y = yBeginning + row * dotSize * (count - 7);

      if (options.cornersSquareOptions?.type) {
        const cornersSquare = new QRCornerSquare({ context: canvasContext, type: options.cornersSquareOptions?.type });

        canvasContext.beginPath();
        cornersSquare.draw(x, y, cornersSquareSize, rotation);
      } else {
        const dot = new QRDot({ context: canvasContext, type: options.dotsOptions.type });

        canvasContext.beginPath();

        for (let i = 0; i < squareMask.length; i++) {
          for (let j = 0; j < squareMask[i].length; j++) {
            if (!squareMask[i]?.[j]) {
              continue;
            }

            dot.draw(
              x + i * dotSize,
              y + j * dotSize,
              dotSize,
              (xOffset: number, yOffset: number): boolean => !!squareMask[i + xOffset]?.[j + yOffset]
            );
          }
        }
      }

      if (options.cornersSquareOptions?.color) {
        canvasContext.fillStyle = canvasContext.strokeStyle = options.cornersSquareOptions.color;
      }

      canvasContext.fill('evenodd');

      if (options.cornersDotOptions?.type) {
        const cornersDot = new QRCornerDot({ context: canvasContext, type: options.cornersDotOptions?.type });

        canvasContext.beginPath();
        cornersDot.draw(x + dotSize * 2, y + dotSize * 2, cornersDotSize, rotation);
      } else {
        const dot = new QRDot({ context: canvasContext, type: options.dotsOptions.type });

        canvasContext.beginPath();

        for (let i = 0; i < dotMask.length; i++) {
          for (let j = 0; j < dotMask[i].length; j++) {
            if (!dotMask[i]?.[j]) {
              continue;
            }

            dot.draw(
              x + i * dotSize,
              y + j * dotSize,
              dotSize,
              (xOffset: number, yOffset: number): boolean => !!dotMask[i + xOffset]?.[j + yOffset]
            );
          }
        }
      }

      if (options.cornersDotOptions?.color) {
        canvasContext.fillStyle = canvasContext.strokeStyle = options.cornersDotOptions.color;
      }

      canvasContext.fill('evenodd');
    });
  }

  private drawImage({
    width,
    height,
    count,
    dotSize
  }: {
    width: number;
    height: number;
    count: number;
    dotSize: number;
  }): void {
    const canvasContext = this.context;

    if (!canvasContext) {
      throw 'canvasContext is not defined';
    }

    if (!this._image) {
      throw 'image is not defined';
    }

    const options = this._options;
    const xBeginning = Math.floor((options.width - count * dotSize) / 2);
    const yBeginning = Math.floor((options.height - count * dotSize) / 2);
    const dx = xBeginning + options.imageOptions.margin + (count * dotSize - width) / 2;
    const dy = yBeginning + options.imageOptions.margin + (count * dotSize - height) / 2;
    const dw = width - options.imageOptions.margin * 2;
    const dh = height - options.imageOptions.margin * 2;

    canvasContext.drawImage(this._image, dx, dy, dw < 0 ? 0 : dw, dh < 0 ? 0 : dh);
  }


  async toBuffer(mimeType: string = 'application/pdf', options?: JpegConfig | PdfConfig | PngConfig): Promise<Buffer> {
    await this.created;
    switch (mimeType) {
      case 'image/jpeg':
        return this._canvas.toBuffer('image/jpeg', options as JpegConfig);
      case 'image/png':
        return this._canvas.toBuffer('image/png', options as PngConfig);
      default:
        return this._canvas.toBuffer('application/pdf', options as PdfConfig);
    }
  }

  async toDataUrl(mimeType: 'image/png' | 'image/jpeg' = 'image/png'): Promise<string> {
    await this.created;
    switch (mimeType) {
      case 'image/jpeg':
        return this._canvas.toDataURL('image/jpeg');
      default:
        return this._canvas.toDataURL('image/png');
    }
  }

}
