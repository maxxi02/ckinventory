//QUAGGA TYPES
declare module "quagga" {
  interface QuaggaJSConfigObject {
    inputStream?: {
      name?: string;
      type?: string;
      target?: HTMLElement | null;
      constraints?: {
        width?: number;
        height?: number;
        facingMode?: string;
        deviceId?: string;
        aspectRatio?: string;
      };
      area?: {
        top?: string | number;
        right?: string | number;
        left?: string | number;
        bottom?: string | number;
      };
      singleChannel?: boolean;
    };
    locator?: {
      patchSize?: string;
      halfSample?: boolean;
    };
    numOfWorkers?: number;
    decoder?: {
      readers?: string[];
      debug?: {
        showCanvas?: boolean;
        showPatches?: boolean;
        showFoundPatches?: boolean;
        showSkeleton?: boolean;
        showLabels?: boolean;
        showPatchLabels?: boolean;
        showRemainingPatchLabels?: boolean;
        boxFromPatches?: {
          showTransformed?: boolean;
          showTransformedBox?: boolean;
          showBB?: boolean;
        };
      };
    };
    locate?: boolean;
    src?: string;
    frequency?: number;
  }

  interface QuaggaJSCodeResult {
    code?: string;
    format?: string;
    start?: number;
    end?: number;
    codeSet?: number;
    startInfo?: {
      error?: number;
      code?: number;
      start?: number;
      end?: number;
    };
    decodedCodes?: {
      error?: number;
      code?: number;
      start?: number;
      end?: number;
    }[];
    endInfo?: {
      error?: number;
      code?: number;
      start?: number;
      end?: number;
    };
    direction?: number;
  }

  interface QuaggaJSResult {
    codeResult?: QuaggaJSCodeResult;
    line?: {
      x?: number;
      y?: number;
    }[];
    angle?: number;
    pattern?: number[];
    box?: number[][];
    boxes?: number[][][];
  }

  function init(
    config: QuaggaJSConfigObject,
    callback?: (err: Error | null) => void
  ): void;
  function start(): void;
  function stop(): void;
  function onDetected(callback: (result: QuaggaJSResult) => void): void;
  function offDetected(callback: (result: QuaggaJSResult) => void): void;
  function onProcessed(callback: (result: QuaggaJSResult | null) => void): void;
  function offProcessed(
    callback: (result: QuaggaJSResult | null) => void
  ): void;
}

declare module "tensorflow.js" {
  export function loadGraphModel(
    modelUrl: string,
    options?: { fromTFHub?: boolean }
  ): Promise<tf.GraphModel>;

  export namespace browser {
    export function fromPixels(
      pixels: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
    ): tf.Tensor;
  }

  export namespace image {
    export function resizeBilinear(
      image: tf.Tensor | tf.TensorLike,
      size: [number, number]
    ): tf.Tensor;
  }

  export function tidy<T>(fn: () => T): T;
  export function dispose(tensor: tf.Tensor | tf.TensorLike): void;
}
