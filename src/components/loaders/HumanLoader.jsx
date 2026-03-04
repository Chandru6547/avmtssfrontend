import { useEffect, useState } from "react";
import "./HumanLoader.css";

export default function HumanLoader({
  loadingText = "Compiling modules",
  successText = "Build completed successfully",
  duration = 2500
}) {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 4));
    }, duration / 25);

    const timer = setTimeout(() => {
      setDone(true);
      clearInterval(interval);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration]);

  return (
    <div className="human-loader-wrapper">
      {!done ? (
        <div className="terminal-box">
          {/* HEADER */}
          <div className="terminal-header">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
            <span className="title">build-terminal</span>
          </div>

          {/* BODY */}
          <div className="terminal-body">
            <div className="code-line">
              <span className="cmd">$ npm run build</span>
              <span className="cursor">▮</span>
            </div>

            <div className="symbols">
              <span>{"{"}</span>
              <span>{"}"}</span>
              <span>{"< />"}</span>
            </div>

            <p className="loader-text">
              {loadingText}
              <span className="dots">
                <i>.</i><i>.</i><i>.</i>
              </span>
            </p>

            {/* PROGRESS */}
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        </div>
      ) : (
        <div className="success-box">
          <div className="success-check">✓</div>
          <p className="success-text">{successText}</p>
          <span className="success-sub">No errors found · Ready to deploy</span>
        </div>
      )}
    </div>
  );
}
