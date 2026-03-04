import "./CustomAlert.css";

export default function CustomAlert({
  open,
  title,
  message,
  type = "success",
  onConfirm
}) {
  if (!open) return null;

  return (
    <div className="custom-alert-overlay">
      <div className={`custom-alert-box ${type}`}>
        <div className="custom-alert-icon">
          {type === "success" && "✔"}
          {type === "warning" && "⚠"}
          {type === "error" && "✖"}
          {type === "info" && "ℹ"}
        </div>

        <h3>{title}</h3>
        <p>{message}</p>

        <button onClick={onConfirm} className="custom-alert-btn">
          OK
        </button>
      </div>
    </div>
  );
}
