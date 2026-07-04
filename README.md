# OpenQuartz

A web-based visual shader node editor inspired by Apple Quartz Composer.

Build and connect GLSL shaders visually using a node graph. Each node is a shader processing unit — edit its GLSL code, and the input/output ports are auto-generated from `uniform`/`out` declarations. Connect nodes to create shader pipelines, run them, and see real-time WebGL output.

## Features

- **Node graph editor** — drag, connect, and arrange shader nodes (React Flow)
- **Auto-generated ports** — write GLSL `uniform`/`out` declarations, ports appear automatically
- **Live shader editing** — built-in CodeMirror editor with GLSL syntax highlighting
- **Type-safe connections** — ports carry type metadata (float, vec2, sampler2D, etc.)
- **Project save/load** — save your graph as `.quartz.json`, reload it later
- **WebGL rendering pipeline** — FBO-based multi-pass rendering via Three.js (in progress)
- **Real-time preview** — output panel with live rendering

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

1. Click **+ Shader**, **+ Input**, or **+ Output** in the toolbar to add nodes
2. Select a shader node to edit its GLSL code in the right panel
3. Drag between port handles to connect nodes
4. Click **Run** to execute the graph
5. Click **Save** to download a `.quartz.json` project file, or **Load** to restore one

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Tech Stack

React 19 · TypeScript 6 · Vite 8 · React Flow 12 · Three.js · Zustand · CodeMirror 6 · Tailwind CSS 4
