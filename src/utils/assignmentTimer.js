export const ASSIGNMENT_DURATION_MS = 90 * 60 * 1000; // 1.5 hours

export const getTimerKey = (assignmentId, studentId) =>
  `assignment_timer_start_${assignmentId}_${studentId}`;

export const initAssignmentTimer = (assignmentId, studentId) => {
  const key = getTimerKey(assignmentId, studentId);
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, Date.now());
  }
};

export const getRemainingTime = (assignmentId, studentId) => {
  const start = localStorage.getItem(
    getTimerKey(assignmentId, studentId)
  );

  if (!start) return ASSIGNMENT_DURATION_MS;

  const elapsed = Date.now() - Number(start);
  return Math.max(ASSIGNMENT_DURATION_MS - elapsed, 0);
};

export const clearAssignmentTimer = (assignmentId, studentId) => {
  localStorage.removeItem(
    getTimerKey(assignmentId, studentId)
  );
};
