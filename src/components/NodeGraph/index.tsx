import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type NodeTypes,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '../../store/useGraphStore';
import type { ShaderNodeData } from '../../types';
import { ShaderNode } from './nodes/ShaderNode';
import { InputNode } from './nodes/InputNode';
import { OutputNode } from './nodes/OutputNode';

const nodeTypes: NodeTypes = {
  shader: ShaderNode,
  input: InputNode,
  output: OutputNode,
  constant: ShaderNode,
};

export function NodeGraph() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
  } = useGraphStore();

  const defaultEdgeOptions = useMemo(() => ({
    style: { stroke: '#4fc3f7', strokeWidth: 2 },
    type: 'smoothstep',
    animated: true,
  }), []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<ShaderNodeData>) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      selectionMode={SelectionMode.Partial}
      fitView
      className="bg-[#1a1a2e]"
      colorMode="dark"
    >
      <Background color="#333" gap={20} />
      <Controls className="!bg-[#16213e] !border-[#0f3460] !text-gray-300" />
      <MiniMap
        className="!bg-[#16213e] !border-[#0f3460]"
        nodeColor="#533483"
        maskColor="rgba(0,0,0,0.5)"
      />
    </ReactFlow>
  );
}
