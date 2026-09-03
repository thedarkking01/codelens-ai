import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { RepositoryDependency } from "@/services/dependency.service";

interface Props {
  dependencies: RepositoryDependency[];
}

function buildGraph(dependencies: RepositoryDependency[]): {
  nodes: Node[];
  edges: Edge[];
} {
  const fileMap = new Map<string, { id: string; path: string; language: string | null }>();

  for (const dep of dependencies) {
    if (!fileMap.has(dep.sourceFile.id)) fileMap.set(dep.sourceFile.id, dep.sourceFile);
    if (!fileMap.has(dep.targetFile.id)) fileMap.set(dep.targetFile.id, dep.targetFile);
  }

  const files = Array.from(fileMap.values());
  const cols = Math.ceil(Math.sqrt(files.length));

  const nodes: Node[] = files.map((file, i) => ({
    id: file.id,
    position: {
      x: (i % cols) * 220,
      y: Math.floor(i / cols) * 100,
    },
    data: {
      label: (
        <div className="text-left">
          <p className="truncate font-mono text-[11px] font-medium text-white max-w-[160px]">
            {file.path.split("/").pop()}
          </p>
          <p className="truncate font-mono text-[9px] text-slate-500 max-w-[160px]">
            {file.path}
          </p>
        </div>
      ),
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: "rgba(139,92,246,0.08)",
      border: "1px solid rgba(139,92,246,0.25)",
      borderRadius: 10,
      padding: "8px 12px",
      minWidth: 180,
    },
  }));

  const edges: Edge[] = dependencies.map((dep) => ({
    id: `${dep.sourceFileId}-${dep.targetFileId}`,
    source: dep.sourceFileId,
    target: dep.targetFileId,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#7c3aed" },
    style: { stroke: "#7c3aed", strokeWidth: 1.5, opacity: 0.6 },
    animated: false,
  }));

  return { nodes, edges };
}

export default function DependencyGraph({ dependencies }: Props) {
  const { nodes: initialNodes, edges: initialEdges } = buildGraph(dependencies);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraph(dependencies);
    setNodes(n);
    setEdges(e);
  }, [dependencies, setNodes, setEdges]);

  const onInit = useCallback((instance: Parameters<typeof ReactFlow>[0] extends { onInit?: (i: infer I) => void } ? I : never) => {
    // @ts-expect-error fitView exists at runtime
    instance?.fitView?.({ padding: 0.2 });
  }, []);

  return (
    <div style={{ height: 520 }} className="rounded-xl overflow-hidden border border-white/[0.07]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={20} />
        <Controls
          style={{
            background: "#111720",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8,
          }}
        />
        <MiniMap
          style={{
            background: "#0b0f14",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8,
          }}
          nodeColor="rgba(139,92,246,0.4)"
        />
      </ReactFlow>
    </div>
  );
}
