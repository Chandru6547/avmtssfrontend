import { useEffect, useState } from "react";
import "./CodeLoader.css";

export default function CodeLoader({
  loading,
  command = "system.load()",
  text = "Loading",
  minDelay = 3000,     // ✅ default 3 seconds
  fullScreen = true,
  children
}) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, minDelay);

      return () => clearTimeout(timer);
    } else {
      setShowLoader(true);
    }
  }, [loading, minDelay]);

  // 🔄 Still loading OR waiting for minimum delay
  if (loading || showLoader) {
    return (
      <div className={fullScreen ? "course-loader" : "inline-loader"}>
        <div className="code-loader">
          <div className="terminal-header">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
          </div>

          <div className="terminal-body">
            <p>
              <span className="prompt">$</span> {command}
            </p>
            <p className="typing">
              {text}
              <span className="cursor">|</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Render actual content after 3s
  return children;
}
