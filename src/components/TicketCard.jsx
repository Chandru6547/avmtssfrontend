export default function TicketCard({ ticket }) {
  return (
    <div style={styles.card}>
      <p><b>Name:</b> {ticket.createdByName}</p>
      <p><b>Email:</b> {ticket.createdByEmail}</p>
      <p><b>Issue:</b> {ticket.issue}</p>

      <p>
        <b>Status:</b>{" "}
        <span style={{
          color: ticket.status === "resolved" ? "green" : "red"
        }}>
          {ticket.status}
        </span>
      </p>

      {ticket.answer && (
        <p><b>Admin Answer:</b> {ticket.answer}</p>
      )}

      {ticket.resolvedBy && (
        <p><b>Resolved By:</b> {ticket.resolvedBy}</p>
      )}

      {ticket.resolvedOn && (
        <p><b>Resolved On:</b> {new Date(ticket.resolvedOn).toLocaleString()}</p>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "12px",
    background: "#fff"
  }
};
