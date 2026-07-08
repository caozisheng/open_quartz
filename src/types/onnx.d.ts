// Ambient type declarations for OpenQuartz's ONNX integration.

// Aliased Rust wasm-pack package (see vite.config.ts and rust/crates/yolo-detector/pkg/).
declare module '@nodes/yolo-detector' {
  export default function __wbg_init(
    module_or_path?: unknown,
  ): Promise<unknown>;

  export class YoloDetectorWasm {
    constructor(model_url?: string | null, target_size?: number | null);
    readonly initialized: boolean;
    readonly targetSize: number;
    static captureWebgpuDevice(): void;
    init(): Promise<void>;
    setThresholds(score: number, iou: number): void;
    detect(
      canvas: HTMLCanvasElement | OffscreenCanvas,
      srcW: number,
      srcH: number,
    ): Promise<{ detections: OnnxDetection[] }>;
    release(): void;
    free(): void;
  }

  export function defaultModelUrl(): string;
  export function defaultTargetSize(): number;
  export function classNames(): string[];

  export interface OnnxDetection {
    bbox: [number, number, number, number];
    score: number;
    class_id: number;
    class_name: string;
  }

}

export {};
