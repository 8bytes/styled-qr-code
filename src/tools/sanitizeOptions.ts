import { RequiredOptions } from '../core/QROptions';


export default function sanitizeOptions(options: RequiredOptions): RequiredOptions {
  const newOptions = { ...options };

  newOptions.width = Number(newOptions.width);
  newOptions.height = Number(newOptions.height);
  newOptions.margin = Number(newOptions.margin);
  newOptions.imageOptions = {
    ...newOptions.imageOptions,
    hideBackgroundDots: Boolean(newOptions.imageOptions.hideBackgroundDots),
    imageSize: Number(newOptions.imageOptions.imageSize),
    margin: Number(newOptions.imageOptions.margin)
  };

  if (newOptions.margin > Math.min(newOptions.width, newOptions.height)) {
    newOptions.margin = Math.min(newOptions.width, newOptions.height);
  }

  newOptions.dotsOptions = {
    ...newOptions.dotsOptions
  };


  if (newOptions.cornersSquareOptions) {
    newOptions.cornersSquareOptions = {
      ...newOptions.cornersSquareOptions
    };
  }

  if (newOptions.cornersDotOptions) {
    newOptions.cornersDotOptions = {
      ...newOptions.cornersDotOptions
    };
  }

  return newOptions;
}
