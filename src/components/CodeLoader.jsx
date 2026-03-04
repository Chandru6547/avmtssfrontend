import "./CodeLoader.css";

export default function CodeLoader({ text = "Running your code..." }) {
  return (
    <div className="code-loader-overlay">
      <div className="code-loader">
        <div className="spinner"></div>
        <p>{text}</p>
      </div>
    </div>
  );
}
