import { useGraphStore } from '../../store/useGraphStore';
import { ShaderEditor } from './ShaderEditor';
import { PortInspector } from './PortInspector';
import { useCallback } from 'react';


export function SidePanel() {
  const { nodes, selectedNodeId, updateNodeData, removeNode } = useGraphStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const data = selectedNode?.data;

  const handleShaderChange = useCallback(
    (code: string) => {
      if (selectedNodeId) {
        updateNodeData(selectedNodeId, { shaderCode: code });
      }
    },
    [selectedNodeId, updateNodeData],
  );

  const handleUniformChange = useCallback(
    (label: string, value: unknown) => {
      if (!selectedNodeId || !data) return;
      updateNodeData(selectedNodeId, {
        uniforms: { ...data.uniforms, [label]: value },
      });
    },
    [selectedNodeId, data, updateNodeData],
  );

  if (!selectedNode || !data) {
    return (
      <aside className="w-72 bg-[#16213e] border-l border-[#0f3460] flex-shrink-0 flex items-center justify-center">
        <p className="text-sm text-gray-500">Select a node to edit</p>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-[#16213e] border-l border-[#0f3460] flex-shrink-0 flex flex-col overflow-hidden">
      {/* Node header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#0f3460]">
        <div>
          <span className="text-xs text-gray-500">{data.type}</span>
          <h3 className="text-sm font-semibold text-white">{data.label}</h3>
        </div>
        <button
          onClick={() => { if (selectedNodeId) removeNode(selectedNodeId); }}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Delete
        </button>
      </div>

      {/* Shader editor (only for shader type) */}
      {data.type === 'shader' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-1.5 text-xs text-gray-400 border-b border-[#0f3460]">
            Shader Editor
          </div>
          <div className="flex-1 overflow-hidden">
            <ShaderEditor code={data.shaderCode} onChange={handleShaderChange} />
          </div>
        </div>
      )}

      {/* Port inspector */}
      <div className="px-4 py-3 border-t border-[#0f3460] overflow-y-auto flex-shrink-0 max-h-64">
        <PortInspector
          inputs={data.inputs}
          outputs={data.outputs}
          uniforms={data.uniforms}
          onUniformChange={handleUniformChange}
        />
      </div>
    </aside>
  );
}
