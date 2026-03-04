import { useState, useRef, useEffect } from "react";
import CodeEditor from "../components/CodeEditor";
import "./CompilerPage.css";

const STORAGE_KEY = "TSS_COMPILER_STATE";

/* ================= PREDEFINED CODE ================= */
const PREDEFINED_CODE = {
  python: `# Write your Python code here
print("Hello World")
`,

  c: `#include <stdio.h>

int main()
{
    printf("Hello World");
    return 0;
}
`,

  cpp: `#include <bits/stdc++.h>
using namespace std;

int main()
{
    cout << "Hello World";
    return 0;
}
`,

  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
`
};

export default function CompilerPage() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [needsInput, setNeedsInput] = useState(true);

  const [testcases, setTestcases] = useState([{ input: "", output: "" }]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const resultRef = useRef(null);

  /* ---------- LOAD FROM STORAGE ---------- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setLanguage(parsed.language || "python");
      setNeedsInput(parsed.needsInput ?? true);
      setTestcases(parsed.testcases || [{ input: "", output: "" }]);
      setCode(parsed.code || PREDEFINED_CODE[parsed.language || "python"]);
    } else {
      setCode(PREDEFINED_CODE.python);
    }
  }, []);

  /* ---------- SAVE STATE ---------- */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ language, code, needsInput, testcases })
    );
  }, [language, code, needsInput, testcases]);

  /* ---------- LOAD TEMPLATE ON LANGUAGE CHANGE ---------- */
  useEffect(() => {
    if (!code || code.trim() === "") {
      setCode(PREDEFINED_CODE[language]);
    }
  }, [language]); // eslint-disable-line

  /* ---------- WARN BEFORE REFRESH ---------- */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (code.trim()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [code]);

  /* ---------- AUTO SCROLL RESULT ---------- */
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  /* ---------- RUN CODE ---------- */
  const runCode = async () => {
    setLoading(true);
    setResult(null);

    const endpoint = needsInput ? "/run" : "/run-code-alone";
    const payload = needsInput
      ? { language, code, testcases }
      : { language, code };

    try {
      const res = await fetch(
        `https://avmtssbackend.onrender.com${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "⚠️ Server not reachable" });
    }

    setLoading(false);
  };

  const updateTestcase = (i, field, value) => {
    const updated = [...testcases];
    updated[i][field] = value;
    setTestcases(updated);
  };

  return (
    <div className="compiler-root">
      <div className="compiler-container">

        {/* ================= EDITOR ================= */}
        <div className="editor-card material-card">
          <div className="editor-header">
            <h2>IDE</h2>

            <div className="editor-controls">
              <div className="select-wrapper">
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    setCode("");
                  }}
                >
                  <option value="python">Python</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
                <span className="select-arrow">▼</span>
              </div>

              <div className="toggle-wrapper">
                <span>Needs Input</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={needsInput}
                    onChange={() => setNeedsInput(!needsInput)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <CodeEditor language={language} code={code} setCode={setCode} />

          <button className="run-btn" onClick={runCode} disabled={loading}>
            {loading ? "Running..." : "▶ Run Code"}
          </button>
        </div>

        {/* ================= RESULT ================= */}
        {result && (
          <div className="material-card result-card" ref={resultRef}>
            {result.output && (
              <div className="code-output success">
                <h4>Output</h4>
                <br/>
                <pre>{result.output}</pre>
              </div>
            )}

            {result.error && (
              <div className="code-output error">
          
                <h4>Compilation / Runtime Error</h4>
                      <br/>
                <pre>{result.error}</pre>
              </div>
            )}
          </div>
        )}

        {/* ================= TESTCASES ================= */}
        {needsInput && (
          <div className="testcase-section material-card">
            <div className="testcase-header">
              <h3>Test Cases</h3>
              <button
                className="add-btn"
                onClick={() =>
                  setTestcases([...testcases, { input: "", output: "" }])
                }
              >
                + Add
              </button>
            </div>

            <div className="testcase-grid">
              {testcases.map((tc, i) => (
                <div className="testcase-card" key={i}>
                  <textarea
                    placeholder="Input"
                    value={tc.input}
                    onChange={(e) =>
                      updateTestcase(i, "input", e.target.value)
                    }
                  />
                  <textarea
                    placeholder="Expected Output"
                    value={tc.output}
                    onChange={(e) =>
                      updateTestcase(i, "output", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
