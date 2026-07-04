import { useRef, useEffect } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ShaderNodeData } from '../../../types';

const ROW_H = 28;
const HEADER_H = 30;

type OutputNodeType = Node<ShaderNodeData>;

export function OutputNode({ data, selected }: NodeProps<OutputNodeType>) {
  const previewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!previewRef.current) return;
    const ctx = previewRef.current.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, 160, 90);
    ctx.fillStyle = '#555';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('preview', 80, 45);
  }, []);

  return (
    <div
      className={`rounded-lg border-2 shadow-lg bg-[#1a1a2e] ${
        selected ? 'border-[#e94560]' : 'border-[#e94560]'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center px-3 rounded-t-md text-sm font-semibold text-white"
        style={{ height: HEADER_H, backgroundColor: '#e94560' }}
      >
        {data.label}
      </div>

      <canvas
        ref={previewRef}
        width={160}
        height={90}
        className="w-[160px] h-[90px] block"
      />

      {/* Input handles — each in its own positioned row */}
      <div style={{ paddingTop: 4, paddingBottom: 8 }}>
        {data.inputs.map((port) => (
          <div
            key={port.id}
            className="flex items-center text-xs text-gray-300 px-3"
            style={{ height: ROW_H, position: 'relative' }}
          >
            <Handle
              type="target"
              position={Position.Left}
              id={port.id}
              className="!w-3 !h-3 !border-2 !border-[#1a1a2e] !bg-[#e94560]"
            />
            <span className="ml-4">{port.label}</span>
            <span className="ml-auto text-[10px] opacity-50">{port.dataType}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
