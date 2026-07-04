import type { Node, Edge } from '@xyflow/react';

export function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();

  for (const n of nodes) {
    adj.set(n.id, []);
    inDeg.set(n.id, 0);
  }

  for (const e of edges) {
    const list = adj.get(e.source);
    if (list) {
      list.push(e.target);
      inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDeg) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of adj.get(u) ?? []) {
      const newDeg = (inDeg.get(v) ?? 1) - 1;
      inDeg.set(v, newDeg);
      if (newDeg === 0) queue.push(v);
    }
  }

  return order;
}
