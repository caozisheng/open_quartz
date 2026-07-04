import { useEffect, useRef, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';

interface ShaderEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export function ShaderEditor({ code, onChange }: ShaderEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const onUpdate = useCallback(
    (update: any) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    },
    [onChange],
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        oneDark,
        javascript(), // GLSL-like syntax highlighting
        EditorView.updateListener.of(onUpdate),
        EditorView.theme({
          '&': { fontSize: '13px', backgroundColor: '#16213e' },
          '.cm-scroller': { fontFamily: "'Fira Code', 'Consolas', monospace" },
          '.cm-gutters': { backgroundColor: '#16213e', borderRight: '1px solid #0f3460' },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Update code from external changes (e.g. switching nodes)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const current = view.state.doc.toString();
    if (current !== code) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: code },
      });
    }
  }, [code]);

  return <div ref={editorRef} className="h-full w-full overflow-hidden" />;
}
