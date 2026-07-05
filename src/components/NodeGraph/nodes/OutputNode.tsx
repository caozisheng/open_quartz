import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ShaderNodeData } from '../../../types';
import { useGraphStore } from '../../../store/useGraphStore';

const PORT_COLOR = '#8e8e93';
const ROW_H = 26;
const HEADER_H = 28;

type OutputNodeType = Node<ShaderNodeData>;

export function OutputNode({ id, data, selected }: NodeProps<OutputNodeType>) {
  const outputPreviews = useGraphStore((s) => s.outputPreviews);
  const nodeErrors = useGraphStore((s) => s.nodeErrors);
  const edges = useGraphStore((s) => s.edges);
  const error = nodeErrors[id];
  const hasOutput = !!outputPreviews[id];
  let accent = '#8e8e93';
  if (error) accent = '#ff3b30';
  else if (hasOutput) accent = '#30d158';

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm ${
        selected ? 'border-[#007aff] shadow-md' : 'border-[#d2d2d7]'
      }`}
    >
      <div
        className="flex items-center px-3 rounded-t-xl"
        style={{ height: HEADER_H, backgroundColor: accent }}
      >
        <span className="text-xs font-semibold text-white">OUTPUT</span>
        <span className="ml-auto text-[10px] text-white/60 font-medium">{data.label}</span>
      </div>

      {/* Input handles */}
      <div style={{ paddingTop: 2, paddingBottom: 2 }}>
        {data.inputs.map((port) => {
          const connected = edges.some((e) => e.targetHandle === port.id);
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
                  borderColor: PORT_COLOR,
                  backgroundColor: connected ? PORT_COLOR : 'transparent',
                }}
              />
              <span className="ml-4">{port.label}</span>
              <span className="ml-auto text-[9px] text-[#aeaeb2]">{port.dataType}</span>
            </div>
          );
        })}
      </div>

      {/* Divider if both input and output ports exist */}
      {data.inputs.length > 0 && data.outputs.length > 0 && (
        <div className="mx-3 border-t border-[#f0f0f0]" />
      )}

      {/* Output handles */}
      <div style={{ paddingTop: 2, paddingBottom: 6 }}>
        {data.outputs.map((port) => (
          <div
            key={port.id}
            className="flex items-center justify-end text-[11px] text-[#1d1d1f] px-3"
            style={{ height: ROW_H, position: 'relative' }}
          >
            <span className="mr-auto text-[9px] text-[#aeaeb2]">{port.dataType}</span>
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
    </div>
  );
}
