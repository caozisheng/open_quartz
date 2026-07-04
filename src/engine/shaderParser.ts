import type { Port, DataType } from '../types';
import { GLSL_VALID_TYPES } from '../types';
import type { ParsedShader } from './types';

const UNIFORM_RE = /uniform\s+(float|int|bool|vec[234]|ivec[234]|mat[234]|sampler2D|samplerCube)\s+(\w+)(?:\s*=\s*([^;]+))?\s*;/g;
const OUTPUT_RE = /out\s+(vec[234]|float|int|ivec[234]|mat[234])\s+(\w+)\s*;/g;

let portCounter = 0;
function nextPortId(): string {
  return `port_${++portCounter}_${Date.now()}`;
}

function mapType(raw: string): DataType {
  const t = raw.trim();
  if (GLSL_VALID_TYPES.includes(t as DataType)) return t as DataType;
  return 'float';
}

export function parseShader(code: string): ParsedShader {
  const inputs: Port[] = [];
  const outputs: Port[] = [];

  let m: RegExpExecArray | null;
  UNIFORM_RE.lastIndex = 0;
  while ((m = UNIFORM_RE.exec(code)) !== null) {
    const dataType = mapType(m[1]);
    const label = m[2];
    const defaultValue = m[3]?.trim();
    inputs.push({
      id: nextPortId(),
      label,
      dataType,
      direction: 'input',
      defaultValue: defaultValue ?? undefined,
    });
  }

  OUTPUT_RE.lastIndex = 0;
  while ((m = OUTPUT_RE.exec(code)) !== null) {
    const dataType = mapType(m[1]);
    const label = m[2];
    outputs.push({
      id: nextPortId(),
      label,
      dataType,
      direction: 'output',
    });
  }

  return { inputs, outputs, raw: code };
}
