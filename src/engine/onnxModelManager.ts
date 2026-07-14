import type { CatalogEntry } from './onnxCatalog';

// ---------------------------------------------------------------------------
// Model lifecycle status
// ---------------------------------------------------------------------------

export type OnnxModelStatus =
  | 'not-downloaded'
  | 'downloading'
  | 'downloaded'
  | 'introspecting'
  | 'ready'
  | 'error';

// ---------------------------------------------------------------------------
// Per-model runtime state
// ---------------------------------------------------------------------------

export interface ModelState {
  status: OnnxModelStatus;
  progress: number;        // 0-1 download progress
  error?: string;
  localPath?: string;      // Tauri: absolute path; Web: blob URL or IDB key
  modelBuffer?: ArrayBuffer; // in-memory after download/load
}

// ---------------------------------------------------------------------------
// Default state factory
// ---------------------------------------------------------------------------

function defaultState(): ModelState {
  return { status: 'not-downloaded', progress: 0 };
}

// ---------------------------------------------------------------------------
// OnnxModelManager
// ---------------------------------------------------------------------------

export class OnnxModelManager {
  private states = new Map<string, ModelState>();
  private listeners = new Set<() => void>();

  /** In-memory buffer cache keyed by model id. */
  // TODO: persist to Tauri FS (~/.openquartz/models/) or IndexedDB (web).
  private bufferCache = new Map<string, ArrayBuffer>();

  // -----------------------------------------------------------------------
  // Subscription (React-compatible external store pattern)
  // -----------------------------------------------------------------------

  /** Subscribe to any state change. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  // -----------------------------------------------------------------------
  // State access
  // -----------------------------------------------------------------------

  /** Return current state for a model, or a default `'not-downloaded'` state. */
  getState(modelId: string): ModelState {
    return this.states.get(modelId) ?? defaultState();
  }

  // -----------------------------------------------------------------------
  // Download
  // -----------------------------------------------------------------------

  /**
   * Download a catalog model via `fetch` with progress tracking.
   *
   * Updates listeners on progress increments and status transitions.
   * Returns the downloaded ArrayBuffer on success.
   */
  async downloadModel(entry: CatalogEntry): Promise<ArrayBuffer> {
    // If already cached in-memory, return immediately.
    const cached = this.bufferCache.get(entry.id);
    if (cached) {
      this.updateState(entry.id, { status: 'downloaded', progress: 1, modelBuffer: cached });
      return cached;
    }

    this.updateState(entry.id, { status: 'downloading', progress: 0 });

    try {
      const response = await fetch(entry.downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = await this.readResponseWithProgress(response, entry.id, entry.fileSize);

      this.bufferCache.set(entry.id, buffer);
      this.updateState(entry.id, { status: 'downloaded', progress: 1, modelBuffer: buffer });
      return buffer;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.updateState(entry.id, { status: 'error', progress: 0, error: message });
      throw err;
    }
  }

  // -----------------------------------------------------------------------
  // Local model loading
  // -----------------------------------------------------------------------

  /**
   * Load a local file (for Custom ONNX nodes). Reads the file at `filePath`
   * into an ArrayBuffer via `fetch` of a blob/file URL.
   */
  async loadLocalModel(filePath: string): Promise<ArrayBuffer> {
    // In the browser the caller should pass a blob URL from a File input;
    // in Tauri convertFileSrc could turn a native path into an asset URL.
    // TODO: add Tauri convertFileSrc bridge when Tauri FS plugin is wired.
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load local model: HTTP ${response.status}`);
    }
    return response.arrayBuffer();
  }

  // -----------------------------------------------------------------------
  // Cache queries
  // -----------------------------------------------------------------------

  /**
   * Check whether a model has already been downloaded and is cached.
   *
   * Currently checks the in-memory buffer cache only.
   * TODO: check Tauri FS (`~/.openquartz/models/<id>.onnx`) or IndexedDB.
   */
  async isDownloaded(modelId: string): Promise<boolean> {
    return this.bufferCache.has(modelId);
  }

  /**
   * Load an already-downloaded model from the cache.
   * Returns `null` if nothing is cached for this id.
   *
   * TODO: read from Tauri FS or IndexedDB when persistence is implemented.
   */
  async loadCachedModel(modelId: string): Promise<ArrayBuffer | null> {
    return this.bufferCache.get(modelId) ?? null;
  }

  // -----------------------------------------------------------------------
  // Teardown
  // -----------------------------------------------------------------------

  dispose(): void {
    this.states.clear();
    this.listeners.clear();
    this.bufferCache.clear();
  }

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  private updateState(modelId: string, patch: Partial<ModelState>): void {
    const prev = this.states.get(modelId) ?? defaultState();
    this.states.set(modelId, { ...prev, ...patch });
    this.notify();
  }

  private notify(): void {
    for (const fn of this.listeners) {
      fn();
    }
  }

  /**
   * Consume a `Response` body as a `ReadableStream`, accumulating chunks
   * and firing progress updates based on `expectedSize`.
   */
  private async readResponseWithProgress(
    response: Response,
    modelId: string,
    expectedSize: number,
  ): Promise<ArrayBuffer> {
    const body = response.body;

    // Fallback when ReadableStream is not available (rare, but defensive).
    if (!body) {
      const buffer = await response.arrayBuffer();
      this.updateState(modelId, { progress: 1 });
      return buffer;
    }

    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      received += value.byteLength;

      const progress = expectedSize > 0 ? Math.min(received / expectedSize, 1) : 0;
      this.updateState(modelId, { progress });
    }

    // Merge chunks into a single ArrayBuffer.
    const merged = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return merged.buffer;
  }
}
