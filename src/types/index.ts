export type DataType =
  | 'float' | 'int' | 'bool'
  | 'vec2' | 'vec3' | 'vec4'
  | 'ivec2' | 'ivec3' | 'ivec4'
  | 'mat2' | 'mat3' | 'mat4'
  | 'sampler2D' | 'samplerCube';

export interface Port {
  id: string;
  label: string;
  dataType: DataType;
  direction: 'input' | 'output';
  defaultValue?: unknown;
}

export type NodeType = 'shader' | 'input' | 'output' | 'constant';

export interface ShaderNodeData {
  type: NodeType;
  label: string;
  shaderCode: string;
  inputs: Port[];
  outputs: Port[];
  uniforms: Record<string, unknown>;
  collapsed?: boolean;
  inputDataType?: DataType;
  imageDataUrl?: string;
  imageFileName?: string;
  [key: string]: unknown;
}

export interface ProjectFile {
  version: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  graph: {
    nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      data: ShaderNodeData;
    }>;
    edges: Array<{
      id: string;
      source: string;
      sourceHandle: string;
      target: string;
      targetHandle: string;
    }>;
  };
}

export const DATA_TYPE_COLORS: Record<DataType, string> = {
  float: '#4fc3f7',
  int: '#81c784',
  bool: '#ffb74d',
  vec2: '#ba68c8',
  vec3: '#e57373',
  vec4: '#f06292',
  ivec2: '#a1887f',
  ivec3: '#90a4ae',
  ivec4: '#7986cb',
  mat2: '#4db6ac',
  mat3: '#4dd0e1',
  mat4: '#4fc3f7',
  sampler2D: '#aed581',
  samplerCube: '#dce775',
};

export const GLSL_VALID_TYPES: DataType[] = [
  'float', 'int', 'bool',
  'vec2', 'vec3', 'vec4',
  'ivec2', 'ivec3', 'ivec4',
  'mat2', 'mat3', 'mat4',
  'sampler2D', 'samplerCube',
];
