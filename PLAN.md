# OpenQuartz — 可视化着色器节点编辑器设计方案

## 1. 项目概述

OpenQuartz 是一个 Web 版可视化着色器节点编辑器，受 Apple Quartz Composer 启发。

- 用户通过**节点图（DAG）**组织 GLSL shader 片段
- 每个节点是一个可编程的 shader 处理单元
- **Shader 即接口声明**：解析 GLSL `uniform` 自动生成输入端口，`out` 生成输出端口
- 输入输出可互相连接，类型校验
- 支持**工程文件保存/载入**：整个图结构 + 节点状态 + 输入值序列化为 `.quartz.json` 文件
- 最终实时渲染输出到 WebGL 预览

---

## 2. 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| UI 框架 | React 18 + TypeScript | 生态最大，组件化 |
| 节点图 | **React Flow** (`@xyflow/react`) | 最成熟的 Web 节点编辑器，自定义节点/边、缩放平移、mini-map |
| Shader 编辑器 | **CodeMirror 6** | 轻量、GLSL 语法高亮、可扩展 |
| WebGL 渲染 | **Three.js** | `ShaderMaterial` + `WebGLRenderTarget` 方便做多 pass FBO |
| State 管理 | **Zustand** + `immer` | 轻量、对嵌套图结构更新友好 |
| 构建 | **Vite 6** | 快速 HMR |
| CSS | Tailwind CSS | 实用优先，快速出 UI |

---

## 3. 核心数据模型

```typescript
// === 数据类型 ===
type DataType =
  | 'float' | 'int' | 'bool'
  | 'vec2' | 'vec3' | 'vec4'
  | 'ivec2' | 'ivec3' | 'ivec4'
  | 'mat2' | 'mat3' | 'mat4'
  | 'sampler2D' | 'samplerCube';

// === 端口 ===
interface Port {
  id: string;
  label: string;          // 变量名
  dataType: DataType;
  direction: 'input' | 'output';
  defaultValue?: any;     // 常量节点的默认值
}

// === 节点 ===
type NodeType = 'shader' | 'input' | 'output' | 'constant';

interface ShaderNodeData {
  type: NodeType;
  label: string;
  shaderCode: string;       // 仅 shader 类型节点
  inputs: Port[];
  outputs: Port[];
  uniforms: Record<string, any>; // 用户调整的 uniform 值
  collapsed?: boolean;
}

// === 工程文件 (序列化格式) ===
interface ProjectFile {
  version: string;              // 格式版本
  name: string;                 // 工程名
  createdAt: string;
  updatedAt: string;
  graph: {
    nodes: SerializedNode[];    // 位置 + ShaderNodeData
    edges: SerializedEdge[];
  };
}
```

---

## 4. 组件树

```
<App>
  <Header />
    ├── 工具栏：运行/停止
    ├── 保存工程 (Save Project) — 下载 .quartz.json
    └── 载入工程 (Load Project) — 上传 .quartz.json
  <main className="flex">
    <NodeGraph />              ← React Flow 画布
      ├── <ShaderNode />       ← 自定义方块节点
      │   ├── <PortHandle />   ← 输入/输出手柄
      │   └── <MiniPreview />  ← 节点内小预览
      ├── <InputNode />        ← 常量输入节点
      ├── <OutputNode />       ← 最终输出节点
      └── <Edge />             ← 连接线
    <SidePanel />              ← 右侧面板
      ├── <ShaderEditor />     ← CodeMirror (选中 shader 节点时)
      ├── <PortInspector />    ← 端口列表 + uniform 值编辑
      └── <NodeSettings />     ← 节点通用设置
    <OutputPanel />            ← 底部/右侧运行输出预览
  </main>
</App>
```

---

## 5. Shader 端口自动生成 (Regex 解析)

用户写 GLSL 后实时解析：

```glsl
// 输入 → 自动生成 input ports
uniform float intensity;       →  Port(float, "intensity")
uniform vec2 resolution;       →  Port(vec2, "resolution")
uniform sampler2D image;       →  Port(sampler2D, "image")
uniform vec4 tint;             →  Port(vec4, "tint")

// 输出 → 自动生成 output ports
out vec4 fragColor;            →  Port(vec4, "fragColor")
```

如果删掉某个 uniform 声明，对应的 port 自动消失。类型映射：

| GLSL | DataType | 默认 UI 控件 |
|---|---|---|
| `float / int / bool` | scalar | slider / toggle / number input |
| `vec2 / vec3 / vec4` | vector | color picker / multi-slider |
| `sampler2D` | texture | 自动连接上游 texture |

---

## 6. 渲染管线

1. **拓扑排序** — Kahn 算法，按依赖顺序排列节点
2. **生成 wrapper shader**：将上游连接替换为 `uniform sampler2D` 并在代码头注入采样逻辑
3. **逐节点渲染到 FBO**：使用 Three.js `WebGLRenderTarget` 作为每节点的输出纹理
4. **OutputNode** 渲染到 screen / 预览面板
5. **脏标记**：仅重新渲染被修改的节点及其下游

### 执行顺序示例

```
[InputA] ────┐
              ├── [BlurNode] ──┐
[InputB] ────┘                │
                               ├── [CombineNode] ── [OutputNode]
[InputC] ────┐                │
              ├── [BrightNode] ─┘
[InputD] ────┘

→ InputA → InputB → BlurNode → InputC → InputD → BrightNode → CombineNode → OutputNode
```

---

## 7. 工程文件保存/载入

### 保存流程

```
用户点击 Save
  → 序列化 graphStore.getState()
  → 格式化为 ProjectFile (含 version, name, timestamp)
  → new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  → 触发 download (a 标签 / FileSaver)
  → 生成 .quartz.json 文件
```

### 载入流程

```
用户点击 Load
  → <input type="file" accept=".quartz.json" />
  → FileReader.readAsText() 读取文件
  → JSON.parse() 反序列化
  → 版本校验
  → graphStore.setState(parsedGraph)
  → React Flow 自动恢复节点和连线
  → 可选：自动触发重新编译运行
```

### 序列化包含

- 所有节点（位置、类型、shaderCode、uniforms 值）
- 所有边（source → target 连接关系）
- 元数据（版本、工程名、时间戳）
- **不包含**：渲染状态、选中状态等 UI 瞬态

---

## 8. 目录结构

```
open-quartz/
├── PLAN.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                    ← Tailwind 入口
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── NodeGraph/
│   │   │   ├── index.tsx
│   │   │   ├── nodes/
│   │   │   │   ├── ShaderNode.tsx
│   │   │   │   ├── InputNode.tsx
│   │   │   │   └── OutputNode.tsx
│   │   │   └── edges/
│   │   │       └── DataEdge.tsx
│   │   ├── SidePanel/
│   │   │   ├── index.tsx
│   │   │   ├── ShaderEditor.tsx
│   │   │   └── PortInspector.tsx
│   │   └── OutputPanel.tsx
│   ├── engine/
│   │   ├── types.ts
│   │   ├── shaderParser.ts
│   │   ├── graphExecutor.ts
│   │   ├── shaderCompiler.ts
│   │   └── webglRenderer.ts
│   ├── store/
│   │   └── useGraphStore.ts
│   ├── utils/
│   │   ├── graphUtils.ts
│   │   └── projectIO.ts           ← 存/载逻辑
│   └── types/
│       └── index.ts
```

---

## 9. 分阶段实现路线

| 阶段 | 内容 | 里程碑 |
|---|---|---|
| **P0 - 骨架** | Vite + React + React Flow + Zustand；自定义节点渲染 | 画布上出现可拖拽方块 |
| **P1 - Shader 解析** | shaderParser regex 引擎；修改 shader 自动更新 ports | 节点自动长出输入/输出手柄 |
| **P2 - 连接** | 拖拽连线；类型校验；删边 | 能连线 |
| **P3 - 渲染** | Three.js 管线；FBO；拓扑排序；运行预览 | 连好线运行看到结果 |
| **P4 - 输入节点** | float/int/vec 常量节点；UI 控件 | 调参数实时变化 |
| **P5 - 存/载** | 保存 .quartz.json；载入恢复 | 工程文件可复用 |
| **P6 - 打磨** | mini-preview；自动布局；撤销/重做；代码补全 | 接近专业工具体验 |

---

## 10. 关键设计决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 前端框架 | React | 生态最成熟，React Flow 只在 React 生态 |
| 节点图库 | React Flow | 自定义节点、监听事件、缩放平移开箱即用 |
| 渲染引擎 | Three.js | `ShaderMaterial` + `RenderTarget` 让 FBO 多 pass 实现简单 |
| 状态管理 | Zustand + immer | 对 Map<string, Node> 图结构更新开销低、代码少 |
| Shader 解析 | Regex 起步 | 覆盖 90% 场景，后续可按需升级 AST |
| 工程文件格式 | JSON (.quartz.json) | 人类可读、易于版本管理、通用 |
