import { ReactFlowProvider } from '@xyflow/react';
import { Header } from './components/Header';
import { NodeGraph } from './components/NodeGraph';
import { SidePanel } from './components/SidePanel';
import { OutputPanel } from './components/OutputPanel';

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="flex flex-col w-full h-full">
        <Header />
        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative">
            <NodeGraph />
          </div>
          <SidePanel />
        </main>
        <OutputPanel />
      </div>
    </ReactFlowProvider>
  );
}
