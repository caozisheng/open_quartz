import type { Diagnostic } from '@codemirror/lint';
import type { EditorView } from 'codemirror';

const ERR_RE = /ERROR:\s*\d+:(\d+):\s*(.*)/g;

function buildFullSource(userCode: string): { full: string; offset: number; strippedLines: number } {
  const cleaned = userCode
    .replace(/^#version\s+\d+\s*\n?/m, '')
    .replace(/^precision\s+\w+\s+\w+;\s*\n?/m, '');
  const strippedLines = userCode.split('\n').length - cleaned.split('\n').length;
  const boilerplate = [
    '#version 300 es',
    'precision highp float;',
    'in vec2 v_uv;',
    '',
  ];
  return {
    full: boilerplate.join('\n') + '\n' + cleaned,
    offset: boilerplate.length,
    strippedLines,
  };
}

let _gl: WebGL2RenderingContext | null | undefined;

function getGL(): WebGL2RenderingContext | null {
  if (_gl !== undefined) return _gl;
  const canvas = document.createElement('canvas');
  _gl = canvas.getContext('webgl2');
  return _gl;
}

export function glslLinter(view: EditorView): Diagnostic[] {
  const code = view.state.doc.toString();
  if (!code.trim()) return [];

  const gl = getGL();
  if (!gl) return [];

  const { full, offset, strippedLines } = buildFullSource(code);
  const shader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!shader) return [];

  gl.shaderSource(shader, full);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  const log = gl.getShaderInfoLog(shader) || '';
  gl.deleteShader(shader);

  if (success) return [];

  const diagnostics: Diagnostic[] = [];
  let m: RegExpExecArray | null;
  ERR_RE.lastIndex = 0;
  while ((m = ERR_RE.exec(log)) !== null) {
    const rawLine = parseInt(m[1], 10);
    const msg = m[2].trim();
    const cleanedLine = rawLine - offset;
    if (cleanedLine < 1) continue;
    const editorLine = Math.min(cleanedLine + strippedLines, view.state.doc.lines);
    const line = view.state.doc.line(editorLine);
    diagnostics.push({
      from: line.from,
      to: line.to,
      severity: 'error',
      message: msg,
      source: 'GLSL',
    });
  }

  if (diagnostics.length === 0) {
    diagnostics.push({
      from: 0,
      to: 0,
      severity: 'error',
      message: log,
      source: 'GLSL',
    });
  }

  return diagnostics;
}
