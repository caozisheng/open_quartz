import type { Edge } from '@xyflow/react';

export function getUpstreamEdges(nodeId: string, edges: Edge[]): Edge[] {
  return edges.filter(e => e.target === nodeId);
}

export function getDownstreamEdges(nodeId: string, edges: Edge[]): Edge[] {
  return edges.filter(e => e.source === nodeId);
}

export function findUpstreamNodes(nodeId: string, edges: Edge[]): string[] {
  return edges
    .filter(e => e.target === nodeId)
    .map(e => e.source);
}

export function getConnectedTypeMap(
  nodeId: string,
  edges: Edge[],
): Map<string, string> {
  const upstream = edges.filter(e => e.target === nodeId);
  const map = new Map<string, string>();
  for (const e of upstream) {
    if (e.targetHandle) map.set(e.targetHandle, e.source);
  }
  return map;
}
