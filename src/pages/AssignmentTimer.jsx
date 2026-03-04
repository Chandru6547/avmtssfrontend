import { useEffect, useState } from "react";
import {
  getTimerKey,
  getRemainingTime
} from "../utils/assignmentTimer";
import { getUserId } from "../utils/auth";

export default function AssignmentTimer({ assignmentId, onTimeUp }) {
  const studentId = getUserId();

  const [remaining, setRemaining] = useState(
    getRemainingTime(assignmentId, studentId)
  );

  useEffect(() => {
    const key = getTimerKey(assignmentId, studentId);

    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, Date.now());
    }

    const interval = setInterval(() => {
      const timeLeft = getRemainingTime(
        assignmentId,
        studentId
      );
      setRemaining(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [assignmentId, studentId, onTimeUp]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="assignment-timer">
      ⏳ Time Left:{" "}
      <strong>
        {String(mins).padStart(2, "0")}:
        {String(secs).padStart(2, "0")}
      </strong>
    </div>
  );
}
