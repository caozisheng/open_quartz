import { useCallback, useRef } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ShaderNodeData, DataType } from '../../../types';
import { DATA_TYPE_COLORS } from '../../../types';
import { useGraphStore } from '../../../store/useGraphStore';

const ROW_H = 28;
const HEADER_H = 30;

type InputNodeType = Node<ShaderNodeData>;

const INPUT_DATA_TYPES: DataType[] = ['float', 'int', 'bool', 'vec2', 'vec3', 'vec4', 'sampler2D'];

export function InputNode({ id, data, selected }: NodeProps<InputNodeType>) {
  const updateNodeInputType = useGraphStore((s) => s.updateNodeInputType);
  const updateNodeData = useGraphStore((s) => s.updateNodeData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentType = (data.inputDataType ?? 'float') as DataType;
  const color = DATA_TYPE_COLORS[currentType];

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as DataType;
      if (newType === 'sampler2D' && data.imageDataUrl) {
        updateNodeInputType(id, newType);
      } else if (newType !== 'sampler2D') {
        updateNodeData(id, { imageDataUrl: undefined, imageFileName: undefined });
        updateNodeInputType(id, newType);
      } else {
        updateNodeInputType(id, newType);
      }
    },
    [id, data.imageDataUrl, updateNodeInputType, updateNodeData],
  );

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        updateNodeData(id, { imageDataUrl: dataUrl, imageFileName: file.name });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [id, updateNodeData],
  );

  return (
    <div
      className={`rounded-lg border-2 shadow-lg bg-[#1a1a2e] min-w-[180px] ${
        selected ? 'border-[#e94560]' : 'border-[#0f3460]'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 rounded-t-md text-sm font-semibold text-white"
        style={{ height: HEADER_H, backgroundColor: '#0f3460' }}
      >
        <span>{data.label}</span>
        <select
          value={currentType}
          onChange={handleTypeChange}
          className="text-[10px] bg-[#1a1a2e] border border-[#0f3460] rounded px-1 py-0.5 text-gray-300 outline-none cursor-pointer"
        >
          {INPUT_DATA_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Image picker / thumbnail for sampler2D */}
      {currentType === 'sampler2D' ? (
        <div
          onClick={handleImageClick}
          className="cursor-pointer"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {data.imageDataUrl ? (
            <div className="p-2">
              <img
                src={data.imageDataUrl}
                alt={data.imageFileName ?? ''}
                className="w-full h-24 object-contain rounded"
              />
              <div className="text-[10px] text-gray-400 text-center mt-1 truncate px-2">
                {data.imageFileName ?? 'loaded'}
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center text-xs text-gray-500 mx-3 my-2 border-2 border-dashed border-[#0f3460] rounded"
              style={{ height: 80 }}
            >
              Click to load image
            </div>
          )}
        </div>
      ) : (
        /* Value rows for non-sampler2D types */
        <div style={{ paddingTop: 4, paddingBottom: 4 }}>
          {data.inputs.map((port) => (
            <div
              key={port.id}
              className="flex items-center justify-between text-xs text-gray-300 px-3"
              style={{ height: ROW_H }}
            >
              <span>{port.label}</span>
              <input
                type="text"
                defaultValue={String(port.defaultValue ?? '')}
                className="w-20 bg-[#16213e] border border-[#0f3460] rounded px-1 py-0.5 text-right text-gray-200 text-[10px]"
                placeholder="value"
              />
            </div>
          ))}
        </div>
      )}

      {/* Output handle */}
      <div style={{ paddingTop: 0, paddingBottom: 8 }}>
        {data.outputs.map((port) => (
          <div
            key={port.id}
            className="flex items-center justify-end text-xs text-gray-300 px-3"
            style={{ height: ROW_H, position: 'relative' }}
          >
            <Handle
              type="source"
              position={Position.Right}
              id={port.id}
              className="!w-3 !h-3 !border-2 !border-[#1a1a2e]"
              style={{ backgroundColor: color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
