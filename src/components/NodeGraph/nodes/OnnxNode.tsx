import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ShaderNodeData } from '../../../types';
import { DATA_TYPE_COLORS } from '../../../types';
import { useGraphStore } from '../../../store/useGraphStore';

const ACCENT = '#ff8a65';
const ROW_H = 26;
const HEADER_H = 28;
const PORT_COLOR = '#8e8e93';

type OnnxNodeType = Node<ShaderNodeData>;

export function OnnxNode({ id, data, selected }: NodeProps<OnnxNodeType>) {
  const edges = useGraphStore((s) => s.edges);
  const nodeErrors = useGraphStore((s) => s.nodeErrors);
  const outputPreviews = useGraphStore((s) => s.outputPreviews);
  const error = nodeErrors[id];
  const hasUnconnectedInput = data.inputs.some(
    (port) => !edges.some((e) => e.targetHandle === port.id),
  );
  const accent = error ? '#ff3b30' : hasUnconnectedInput ? '#8e8e93' : ACCENT;
  const portsVisible = !data.onnxStatus || data.onnxStatus === 'ready';

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm min-w-[220px] ${
        selected ? 'border-[#007aff] shadow-md' : 'border-[#d2d2d7]'
      }`}
    >
      <div
        className="flex items-center px-3 rounded-t-xl"
        style={{ height: HEADER_H, backgroundColor: accent }}
      >
        <span className="text-xs font-semibold text-white">ONNX</span>
        <span className="ml-auto text-[10px] text-white/70 font-medium">{data.label}</span>
      </div>

      {data.onnxSource === 'custom' && data.onnxCustomFileName && (
        <div className="px-3 py-1 text-[10px] text-[#86868b] truncate border-b border-[#f0f0f0]">
          📄 {data.onnxCustomFileName}
        </div>
      )}

      {data.onnxStatus === 'not-downloaded' && (
        <div className="px-3 py-2 text-[10px] text-[#86868b]">Waiting to download...</div>
      )}

      {data.onnxStatus === 'downloading' && (
        <div className="mx-3 my-1">
          <div className="flex items-center justify-between text-[9px] text-[#86868b] mb-0.5">
            <span>Downloading...</span>
            <span>{Math.round((data.onnxProgress ?? 0) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-[#e8e8ed] rounded-full overflow-hidden">
            <div className="h-full bg-[#007aff] rounded-full transition-all" style={{ width: `${(data.onnxProgress ?? 0) * 100}%` }} />
          </div>
        </div>
      )}

      {data.onnxStatus === 'downloaded' && (
        <div className="px-3 py-2 text-[10px] text-[#86868b]">Loading...</div>
      )}

      {data.onnxStatus === 'introspecting' && (
        <div className="px-3 py-2 text-[10px] text-[#86868b]">Analyzing model...</div>
      )}

      {data.onnxStatus === 'ready' && data.onnxBackend === 'wasm' && (
        <div className="px-3 py-1 text-[9px] font-medium text-[#ff9f0a]">CPU fallback</div>
      )}

      {data.onnxStatus === 'error' && (
        <div className="px-3 py-2 text-[10px] text-[#ff3b30]">{data.onnxError ?? 'Unknown error'}</div>
      )}

      {data.onnxSource === 'custom' && !data.onnxCustomPath && !data.onnxStatus && (
        <div className="px-3 py-2 text-[10px] text-[#aeaeb2] italic">Select .onnx file...</div>
      )}
      {portsVisible && (
        <div style={{ paddingTop: 2, paddingBottom: 2 }}>
          {data.inputs.map((port) => {
            const connected = edges.some((e) => e.targetHandle === port.id);
            const portErr = !connected && !!error;
            return (
              <div
                key={port.id}
                className="flex items-center text-[11px] text-[#1d1d1f] px-3"
                style={{ height: ROW_H, position: 'relative' }}
              >
                <Handle
                  type="target"
                  position={Position.Left}
                  id={port.id}
                  className="!w-3 !h-3 !border-2"
                  style={{
                    borderColor: portErr ? '#ff3b30' : PORT_COLOR,
                    backgroundColor: portErr ? '#ff3b30' : connected ? PORT_COLOR : 'transparent',
                  }}
                />
                <span className={`ml-4 ${portErr ? 'text-[#ff3b30] font-medium' : ''}`}>
                  {port.label}
                </span>
                <span className="ml-auto text-[9px] text-[#aeaeb2]">{port.dataType}</span>
              </div>
            );
          })}
        </div>
      )}

      {portsVisible && data.inputs.length > 0 && data.outputs.length > 0 && (
        <div className="mx-3 border-t border-[#f0f0f0]" />
      )}

      {portsVisible && (
        <div style={{ paddingTop: 2, paddingBottom: 6 }}>
          {data.outputs.map((port) => (
            <div
              key={port.id}
              className="flex items-center justify-end text-[11px] text-[#1d1d1f] px-3"
              style={{ height: ROW_H, position: 'relative' }}
            >
              <span
                className="mr-auto w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: DATA_TYPE_COLORS[port.dataType] }}
              />
              <span className="mr-2 text-[9px] text-[#aeaeb2]">{port.dataType}</span>
              <span className="mr-4">{port.label}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={port.id}
                className="!w-2.5 !h-2.5 !border-2 !border-white"
                style={{ backgroundColor: PORT_COLOR }}
              />
            </div>
          ))}
        </div>
      )}

      {outputPreviews[id] && (
        <div className="px-2 pb-2">
          <img
            src={outputPreviews[id]}
            alt="detections"
            className="w-full h-16 object-contain rounded border border-[#e8e8ed]"
            style={{ imageRendering: 'pixelated' }}
          />
          {data.resolvedWidth && data.resolvedHeight && (
            <div className="text-[9px] text-[#aeaeb2] text-center mt-0.5">
              ONNX {data.resolvedWidth}×{data.resolvedHeight}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
