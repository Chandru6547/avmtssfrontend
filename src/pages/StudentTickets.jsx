import { useCallback, useEffect, useState } from "react";
import React from "react";
import { getEmail } from "../utils/auth";
import "./StudentTickets.css";

const BASE_URL = "https://tssplatform.onrender.com/api/tickets";

export default function StudentTickets() {
  const email = getEmail();

  const [issue, setIssue] = useState("");
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [newTicketId, setNewTicketId] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  /* 🔔 TOAST */
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  /* CREATE TICKET */
  const createTicket = async () => {
    if (!issue.trim()) {
      showToast("Please describe your issue", "error");
      return;
    }

    setLoading(true);

    const res = await fetch(`${BASE_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        createdByEmail: email,
        createdByName: "Student",
        issue
      })
    });

    const data = await res.json();
    setNewTicketId(data.ticket?._id || null);

    setIssue("");
    loadMyTickets();
    setLoading(false);
    showToast("Ticket submitted successfully");
  };

  /* LOAD MY TICKETS */
  const loadMyTickets = useCallback(async () => {
    const res = await fetch(`${BASE_URL}/my`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ createdByEmail: email })
    });

    const data = await res.json();
    setTickets(data);
  }, [email]);

  useEffect(() => {
    if (email) loadMyTickets();
    // Close expanded row on Escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") setExpandedTicketId(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [email, loadMyTickets]);

  let filteredTickets = tickets.filter(t =>
    t.issue.toLowerCase().includes(search.toLowerCase()) ||
    t.status.toLowerCase().includes(search.toLowerCase())
  );

  // Sorting logic
  filteredTickets = [...filteredTickets].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
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

  return (
    <div className="tickets-wrapper">
      {/* 🔔 TOAST */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}

      {/* HEADER */}
      <div className="tickets-header">
        <h2 className="page-title">Student Support</h2>
        <p className="page-subtitle">
          Raise and track your support tickets
        </p>
        <span className="student-email">{email}</span>
      </div>

      {/* CREATE TICKET */}
      <div className="create-ticket-box">
        <h3 className="section-title">Raise a New Ticket</h3>

        <textarea
          className="ticket-textarea"
          placeholder="Describe your issue clearly..."
          value={issue}
          onChange={e => setIssue(e.target.value)}
        />

        <button
          className="primary-btn ripple"
          onClick={createTicket}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </div>

      {/* SEARCH */}
      <div className="search-box">
        <input
          placeholder="Search tickets by issue or status..."
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
              <th
                className="sortable"
                onClick={() => {
                  if (sortBy === "date") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  else { setSortBy("date"); setSortOrder("asc"); }
                }}
              >
                Created On {sortBy === "date" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
              </th>
              <th>Response</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">
                  No tickets found
                </td>
              </tr>
            )}

            {filteredTickets.map(ticket => (
              <React.Fragment key={ticket._id}>
                <tr
                  className={`ticket-row ${expandedTicketId === ticket._id ? "expanded" : ""} ${ticket._id === newTicketId ? "new-ticket-row" : ""}`}
                  onClick={() => setExpandedTicketId(expandedTicketId === ticket._id ? null : ticket._id)}
                >
                  <td className="expand-icon">
                    <span>{expandedTicketId === ticket._id ? "▼" : "▶"}</span>
                  </td>
                  <td className="issue-cell">{ticket.issue}</td>

                  <td>
                    <span className={`status-badge ${ticket.status}`}>
                      <span className="status-dot"></span>
                      {ticket.status === "resolved" ? "Resolved" : "Pending"}
                    </span>
                  </td>

                  <td>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>

                  <td onClick={(e) => e.stopPropagation()}>
                    {ticket.answer ? (
                      <span className="answered">✓ Available</span>
                    ) : (
                      <span className="pending">⏳ Waiting</span>
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
                          <div className="detail-item response-item">
                            <strong>Reply : </strong>
                            <p>{ticket.answer}</p>
                          </div>
                        )}
                        <div className="detail-item">
                          <strong>Created:</strong>
                          <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                        </div>
                        {ticket.resolvedOn && (
                          <div className="detail-item">
                            <strong>Resolved:</strong>
                            <p>{new Date(ticket.resolvedOn).toLocaleString()}</p>
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


    </div>
  );
}
