import { useEffect, useState } from "react";
import React from "react";
import "./AdminTickets.css";

const BASE_URL = "https://tssplatform.onrender.com/api/tickets";
const PAGE_SIZE = 5;

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔔 TOAST */
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type }), 3000);
  };

  /* LOAD TICKETS */
  const loadTickets = async () => {
    const res = await fetch(`${BASE_URL}/all`);
    const data = await res.json();
    setTickets(data);
  };

  useEffect(() => {
    loadTickets();
    // Close modal on Escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") setSelectedTicket(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  /* RESOLVE */
  const resolveTicket = async () => {
    if (!answer.trim()) {
      showToast("Answer is required", "error");
      return;
    }

    setLoading(true);

    await fetch(`${BASE_URL}/resolve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketId: selectedTicket._id,
        resolvedBy: "Admin",
        answer
      })
    });

    setAnswer("");
    setSelectedTicket(null);
    loadTickets();
    setLoading(false);
    showToast("Ticket resolved successfully");
  };

  /* FILTER + SEARCH + SORT */
  let filteredTickets = tickets.filter(t => {
    const statusMatch =
      statusFilter === "all" ? true : t.status === statusFilter;

    const searchMatch =
      t.issue.toLowerCase().includes(search.toLowerCase()) ||
      t.createdByEmail.toLowerCase().includes(search.toLowerCase());

    return statusMatch && searchMatch;
  });

  // Sorting logic
  filteredTickets = [...filteredTickets].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case "email":
        aValue = a.createdByEmail.toLowerCase();
        bValue = b.createdByEmail.toLowerCase();
        break;
      case "issue":
        aValue = a.issue.toLowerCase();
        bValue = b.issue.toLowerCase();
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "date":
      default:
        aValue = new Date(a.createdAt || 0).getTime();
        bValue = new Date(b.createdAt || 0).getTime();
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  /* PAGINATION */
  const totalPages = Math.ceil(filteredTickets.length / PAGE_SIZE);
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1); // reset page when filter/search changes
  }, [statusFilter, search]);

  return (
    <div className="admin-wrapper">
      {/* 🔔 TOAST */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}

      {/* HEADER */}
      <div className="admin-header">
        <h2>Admin Support Dashboard</h2>
        <p>Resolve and manage student support tickets</p>
      </div>

      {/* TOGGLES + SEARCH */}
      <div className="controls">
        <div className="toggle-group">
          <button
            className={statusFilter === "all" ? "active" : ""}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button
            className={statusFilter === "not_resolved" ? "active" : ""}
            onClick={() => setStatusFilter("not_resolved")}
          >
            Pending
          </button>
          <button
            className={statusFilter === "resolved" ? "active" : ""}
            onClick={() => setStatusFilter("resolved")}
          >
            Resolved
          </button>
        </div>

        <input
          placeholder="Search by issue or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th></th>
              <th 
                className="sortable"
                onClick={() => {
                  if (sortBy === "email") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  else { setSortBy("email"); setSortOrder("asc"); }
                }}
              >
                Email {sortBy === "email" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
              </th>
              <th 
                className="sortable"
                onClick={() => {
                  if (sortBy === "issue") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  else { setSortBy("issue"); setSortOrder("asc"); }
                }}
              >
                Issue {sortBy === "issue" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
              </th>
              <th 
                className="sortable"
                onClick={() => {
                  if (sortBy === "status") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  else { setSortBy("status"); setSortOrder("asc"); }
                }}
              >
                Status {sortBy === "status" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
              </th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedTickets.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">
                  No tickets found
                </td>
              </tr>
            )}

            {paginatedTickets.map(ticket => (
              <React.Fragment key={ticket._id}>
                <tr 
                  className={`ticket-row ${expandedTicketId === ticket._id ? "expanded" : ""}`}
                  onClick={() => setExpandedTicketId(expandedTicketId === ticket._id ? null : ticket._id)}
                >
                  <td className="expand-icon">
                    <span>{expandedTicketId === ticket._id ? "▼" : "▶"}</span>
                  </td>
                  <td>{ticket.createdByEmail}</td>
                  <td className="issue-cell">{ticket.issue}</td>
                  <td>
                    <span className={`badge ${ticket.status}`}>
                      <span className="status-dot"></span>
                      {ticket.status === "resolved" ? "Resolved" : "Pending"}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {ticket.status === "not_resolved" ? (
                      <button
                        className="resolve-btn"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        📝 Resolve
                      </button>
                    ) : (
                      <span className="done">✓ Done</span>
                    )}
                  </td>
                </tr>
                {expandedTicketId === ticket._id && (
                  <tr className="expanded-details">
                    <td colSpan="5">
                      <div className="details-content">
                        <div className="detail-item">
                          <strong>Full Issue:</strong>
                          <p>{ticket.issue}</p>
                        </div>
                        {ticket.answer && (
                          <div className="detail-item">
                            <strong>Resolution:</strong>
                            <p>{ticket.answer}</p>
                          </div>
                        )}
                        <div className="detail-item">
                          <strong>Created:</strong>
                          <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                        </div>
                        {ticket.resolvedAt && (
                          <div className="detail-item">
                            <strong>Resolved:</strong>
                            <p>{new Date(ticket.resolvedAt).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL */}
      {selectedTicket && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Resolve Ticket</h3>

            <p className="modal-issue">
              <b>Issue:</b> {selectedTicket.issue}
            </p>

            <textarea
              placeholder="Enter resolution answer..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />

            <div className="modal-actions">
              <button
                className="cancel"
                onClick={() => setSelectedTicket(null)}
              >
                Cancel
              </button>
              <button
                className="confirm"
                onClick={resolveTicket}
                disabled={loading}
              >
                {loading ? "Saving..." : "Resolve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
