import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ShaderNodeData } from '../../../types';
import { DATA_TYPE_COLORS } from '../../../types';

const ROW_H = 28;
const HEADER_H = 30;

type ShaderNodeType = Node<ShaderNodeData>;

export function ShaderNode({ data, selected }: NodeProps<ShaderNodeType>) {
  const typeColor = getNodeColor(data.type);

  return (
    <div
      className={`rounded-lg border-2 shadow-lg bg-[#1a1a2e] min-w-[200px] ${
        selected ? 'border-[#e94560]' : 'border-[#0f3460]'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 rounded-t-md text-sm font-semibold text-white"
        style={{ height: HEADER_H, backgroundColor: typeColor }}
      >
        <span className="text-xs opacity-70">{data.type}</span>
        <span>{data.label}</span>
        <span className="ml-auto text-[10px] opacity-50">
          in:{data.inputs.length} out:{data.outputs.length}
        </span>
      </div>

      {/* Input ports — each row contains Handle + label */}
      <div style={{ paddingTop: 4, paddingBottom: 4 }}>
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
              className="!w-3 !h-3 !border-2 !border-[#1a1a2e]"
              style={{ backgroundColor: DATA_TYPE_COLORS[port.dataType] }}
            />
            <span className="ml-4">{port.label}</span>
            <span className="ml-auto text-[10px] opacity-50">{port.dataType}</span>
          </div>
        ))}
      </div>

      {/* Output ports */}
      <div style={{ paddingTop: 0, paddingBottom: 8 }}>
        {data.outputs.map((port) => (
          <div
            key={port.id}
            className="flex items-center justify-end text-xs text-gray-300 px-3"
            style={{ height: ROW_H, position: 'relative' }}
          >
            <span className="mr-auto text-[10px] opacity-50">{port.dataType}</span>
            <span className="mr-4">{port.label}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={port.id}
              className="!w-3 !h-3 !border-2 !border-[#1a1a2e]"
              style={{ backgroundColor: DATA_TYPE_COLORS[port.dataType] }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function getNodeColor(type: string): string {
  switch (type) {
    case 'shader': return '#533483';
    case 'input': return '#0f3460';
    case 'output': return '#e94560';
    default: return '#333';
  }
}
