import { useEffect, useRef } from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { ExecutionEngine } from '../engine/executionEngine';

export function OutputPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ExecutionEngine | null>(null);
  const isRunning = useGraphStore((s) => s.isRunning);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isRunning) {
      const engine = new ExecutionEngine(canvas);
      engineRef.current = engine;
      engine.run(nodes, edges).catch((err) => {
        console.error('Execution error:', err);
        useGraphStore.getState().setRunning(false);
      });
    } else {
      engineRef.current?.stop();
      engineRef.current = null;
    }

    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, [isRunning]);

  return (
    <div className="h-48 border-t border-[#0f3460] bg-[#16213e] flex-shrink-0 relative">
      <div className="flex items-center justify-between px-4 py-1 text-xs text-gray-400 border-b border-[#0f3460]">
        <span>Output Preview</span>
        {isRunning && (
          <span className="text-[#2ecc71]">● Running</span>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={640}
        height={180}
        className="w-full h-[calc(100%-24px)] block"
      />
      {!isRunning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none top-6">
          <span className="text-sm text-gray-500">Press Run to preview output</span>
        </div>
      )}
    </div>
  );
}
