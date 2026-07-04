import { useGraphStore } from '../store/useGraphStore';
import { serializeProject, downloadProject, deserializeProject } from '../utils/projectIO';
import { useRef } from 'react';

export function Header() {
  const { nodes, edges, projectName, setProjectName, isRunning, setRunning, loadGraph, clearGraph } = useGraphStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const project = serializeProject(nodes, edges, projectName);
    downloadProject(project);
  };

  const handleLoad = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const result = deserializeProject(ev.target?.result as string);
        loadGraph(result.nodes, result.edges);
        setProjectName(result.project.name);
      } catch (err) {
        console.error('Failed to load project:', err);
        alert('Failed to load project file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="flex items-center gap-3 px-4 py-2 bg-[#16213e] border-b border-[#0f3460] select-none">
      <h1 className="text-lg font-bold text-[#e94560] mr-4">OpenQuartz</h1>

      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        className="bg-[#1a1a2e] border border-[#0f3460] rounded px-2 py-1 text-sm text-gray-200 w-40 outline-none focus:border-[#e94560]"
      />

      <div className="flex gap-2 ml-auto">
        <button
          onClick={() => useGraphStore.getState().addNode('shader')}
          className="px-3 py-1 text-sm bg-[#533483] hover:bg-[#6c4a9e] rounded transition-colors"
        >
          + Shader
        </button>
        <button
          onClick={() => useGraphStore.getState().addInputNode('float')}
          className="px-3 py-1 text-sm bg-[#0f3460] hover:bg-[#1a5276] rounded transition-colors"
        >
          + Input
        </button>
        <button
          onClick={() => useGraphStore.getState().addInputNode('sampler2D')}
          className="px-3 py-1 text-sm bg-[#1a5276] hover:bg-[#21618c] rounded transition-colors"
        >
          + Image
        </button>
        <button
          onClick={() => useGraphStore.getState().addNode('output')}
          className="px-3 py-1 text-sm bg-[#e94560] hover:bg-[#c73e54] rounded transition-colors"
        >
          + Output
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-[#533483] hover:bg-[#6c4a9e] rounded transition-colors"
        >
          Save
        </button>
        <button
          onClick={handleLoad}
          className="px-3 py-1 text-sm bg-[#533483] hover:bg-[#6c4a9e] rounded transition-colors"
        >
          Load
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".quartz.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setRunning(!isRunning)}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            isRunning
              ? 'bg-[#e94560] hover:bg-[#c73e54]'
              : 'bg-[#2ecc71] hover:bg-[#27ae60]'
          }`}
        >
          {isRunning ? 'Stop' : 'Run'}
        </button>
        <button
          onClick={clearGraph}
          className="px-3 py-1 text-sm bg-[#555] hover:bg-[#777] rounded transition-colors"
        >
          Clear
        </button>
      </div>
    </header>
  );
}


