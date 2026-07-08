// OnnxSession — one-per-descriptor detector façade with lazy wasm init.
//
// - The upstream `rimeflow-yolov8n` ort_bridge auto-loads onnxruntime-web from
//   `/ort/ort.min.js` on the first `ort_init` call, so no pre-check on
//   `globalThis.ort` is required here.
// - The wasm module (Rust wasm-pack build) is a static import via the
//   Vite alias `@nodes/yolo-detector`; we lazily *initialize* it on first use.
import __wbg_init, { YoloDetectorWasm, type OnnxDetection } from '@nodes/yolo-detector';
import type { OnnxModelDescriptor } from './onnxRegistry';

export type { OnnxDetection };

export interface OnnxResult {
  detections: OnnxDetection[];
  scoreThreshold: number;
  iouThreshold: number;
}

export type OnnxSessionStatus = 'idle' | 'loading' | 'ready' | 'error';
const WASM_URL = new URL(
  '../../rust/crates/yolo-detector/pkg/yolo_detector_bg.wasm',
  import.meta.url,
);

// The wasm module has a single global instantiation. Multiple sessions share it.
let wasmReady: Promise<void> | null = null;

function ensureWasmReady(): Promise<void> {
  if (wasmReady) return wasmReady;
  const promise = __wbg_init(WASM_URL).then(() => undefined);
  wasmReady = promise;
  return promise;
}

export class OnnxSession {
  readonly descriptor: OnnxModelDescriptor;
  private detector: YoloDetectorWasm | null = null;
  private _status: OnnxSessionStatus = 'idle';
  private _error: string | null = null;

  constructor(descriptor: OnnxModelDescriptor) {
    this.descriptor = descriptor;
  }

  get status(): OnnxSessionStatus { return this._status; }
  get error(): string | null { return this._error; }

  async init(scoreThreshold?: number, iouThreshold?: number): Promise<void> {
    if (this._status === 'loading' || this._status === 'ready') return;
    this._status = 'loading';
    this._error = null;
    try {
      await ensureWasmReady();
      const detector = new YoloDetectorWasm(this.descriptor.modelUrl, this.descriptor.targetSize);
      const score = scoreThreshold ?? this.descriptor.scoreThreshold;
      const iou = iouThreshold ?? this.descriptor.iouThreshold;
      detector.setThresholds(score, iou);
      await detector.init();
      this.detector = detector;
      this._status = 'ready';
    } catch (err) {
      this._status = 'error';
      this._error = err instanceof Error ? err.message : String(err);
      throw err;
    }
  }

  setThresholds(score: number, iou: number): void {
    this.detector?.setThresholds(score, iou);
  }

  async run(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    srcW: number,
    srcH: number,
  ): Promise<OnnxResult> {
    if (!this.detector || this._status !== 'ready') {
      throw new Error(`OnnxSession(${this.descriptor.id}) not ready`);
    }
    const raw = await this.detector.detect(canvas, srcW, srcH);
    return {
      detections: raw.detections,
      scoreThreshold: this.descriptor.scoreThreshold,
      iouThreshold: this.descriptor.iouThreshold,
    };
  }

  dispose(): void {
    if (!this.detector) return;
    this.detector.release();
    this.detector.free();
    this.detector = null;
    this._status = 'idle';
    this._error = null;
  }
}
