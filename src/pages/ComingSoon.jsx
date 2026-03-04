import { FaRocket } from "react-icons/fa";
import "./ComingSoon.css";

export default function ComingSoon() {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-card">
        <FaRocket className="rocket-icon" />
        <h1>Coming Soon 🚀</h1>
        <p>
          We are working hard to bring this feature to you.
          <br />
          Stay tuned!
        </p>
      </div>
    </div>
  );
}
