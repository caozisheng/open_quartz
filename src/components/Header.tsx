import { useGraphStore } from '../store/useGraphStore';
import { serializeProject, downloadProject, deserializeProject } from '../utils/projectIO';
import { useRef, useState } from 'react';
import { VERSION } from '../version';
import type { DataType } from '../types';

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

  const btnClass = 'px-2.5 py-0.5 text-[11px] font-bold text-[#1d1d1f] hover:text-[#007aff] transition-colors cursor-default';

  const [inputOpen, setInputOpen] = useState(false);

  const inputTypes: { label: string; type: DataType }[] = [
    { label: 'FLOAT', type: 'float' },
    { label: 'INT', type: 'int' },
    { label: 'BOOL', type: 'bool' },
    { label: 'VEC2', type: 'vec2' },
    { label: 'VEC3', type: 'vec3' },
    { label: 'VEC4', type: 'vec4' },
    { label: 'IMAGE', type: 'sampler2D' },
  ];

  return (
    <header className="flex items-center gap-1 px-4 py-1 bg-white border-b border-[#d2d2d7] select-none text-[11px]">
      <span className="flex items-baseline gap-1.5 mr-2">
        <span className="font-bold text-[#1d1d1f] text-[11px] tracking-wider">OPENQUARTZ</span>
        <span className="text-[11px] text-[#aeaeb2]">v{VERSION}</span>
      </span>

      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        className="border border-[#d2d2d7] rounded px-2 py-0.5 text-[12px] text-[#1d1d1f] bg-white outline-none focus:border-[#007aff] w-32"
      />

      <span className="mx-1 text-[#c7c7cc]">|</span>

      <button onClick={() => useGraphStore.getState().addNode('shader')} className={btnClass}>+ SHADER</button>

      <div className="relative">
        <button onClick={() => setInputOpen(!inputOpen)} className={btnClass}>+ INPUT</button>
        {inputOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setInputOpen(false)} />
            <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#d2d2d7] rounded-lg shadow-lg z-20 py-1 min-w-[100px]">
              {inputTypes.map(({ label, type }) => (
                <button
                  key={type}
                  onClick={() => { useGraphStore.getState().addInputNode(type); setInputOpen(false); }}
                  className="block w-full text-left px-3 py-1 text-[11px] font-bold text-[#1d1d1f] hover:text-[#007aff] hover:bg-[#f5f5f7] transition-colors cursor-default"
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button onClick={() => useGraphStore.getState().addNode('output')} className={btnClass}>+ OUTPUT</button>

      <span className="mx-1 text-[#c7c7cc]">|</span>

      <button onClick={handleSave} className={btnClass}>SAVE</button>
      <button onClick={handleLoad} className={btnClass}>LOAD</button>
      <input ref={fileInputRef} type="file" accept=".quartz.json" onChange={handleFileChange} className="hidden" />

      <span className="mx-1 text-[#c7c7cc]">|</span>

      <button
        onClick={() => setRunning(!isRunning)}
        className={`px-2.5 py-0.5 text-[11px] font-bold transition-colors cursor-default tracking-wider ${
          isRunning ? 'text-[#ff3b30] hover:text-[#ff3b30]' : 'text-[#1d1d1f] hover:text-[#007aff]'
        }`}
      >
        {isRunning ? '■ STOP' : '▶ RUN'}
      </button>
      <button onClick={clearGraph} className={btnClass}>CLEAR</button>
    </header>
  );
}
