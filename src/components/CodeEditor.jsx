import Editor from "@monaco-editor/react";
import { useEffect } from "react";
import "./CodeEditor.css";

export default function CodeEditor({ language, code, setCode }) {
  const handleEditorDidMount = (editor, monaco) => {
    /* ---------- DESKTOP SECURITY ---------- */
    editor.updateOptions({
      contextmenu: false,
      dragAndDrop: false,
      quickSuggestions: false,
    });

    const blockCommand = (keybinding) => {
      editor.addCommand(keybinding, () => {});
    };

    // Block common shortcuts
    blockCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC);
    blockCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV);
    blockCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX);
    blockCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA);
    blockCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS);
    blockCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ);

    /* ---------- EDITOR DOM LEVEL BLOCK ---------- */
    const domNode = editor.getDomNode();
    if (!domNode) return;

    const blockEvent = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // DO NOT block touchstart (important for mobile typing)
    ["copy", "paste", "cut", "contextmenu"].forEach((event) => {
      domNode.addEventListener(event, blockEvent);
    });
  };

  /* ---------- GLOBAL COPY / PASTE BLOCK ---------- */
  useEffect(() => {
    const block = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("copy", block);
    document.addEventListener("paste", block);
    document.addEventListener("cut", block);

    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("cut", block);
    };
  }, []);

  return (
    <div className="no-select-editor">
      <Editor
        height="620px"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={(value) => setCode(value || "")}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          selectionClipboard: false,
          wordWrap: "on",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
        }}
      />
    </div>
  );
}