

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";

function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem("user");
    localStorage.removeItem("createOffer");
    localStorage.removeItem("targetSocketId");
    navigate("/");
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
      return;
    }

    const handleUsersList = (onlineUsers) => {
      setUsers(Array.isArray(onlineUsers) ? onlineUsers : []);
    };

    const handleIncomingCall = (data) => {
      const accept = window.confirm(
        `${data.callerName} is calling.\n\nAccept call?`
      );

      if (accept) {
        localStorage.setItem("targetSocketId", data.from);
        socket.emit("call-accepted", {
          to: data.from,
          acceptedBy: currentUser.name,
        });
        navigate("/call");
      } else {
        socket.emit("call-rejected", {
          to: data.from,
        });
      }
    };

    const handleCallAccepted = () => {
      localStorage.setItem("createOffer", "true");
      navigate("/call");
    };

    const handleCallRejected = () => {
      window.alert("Call rejected");
    };

    socket.emit("join-user", currentUser);
    socket.on("users-list", handleUsersList);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);

    return () => {
      socket.off("users-list", handleUsersList);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
    };
  }, [currentUser, navigate]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => u.phone !== currentUser?.phone)
      .filter((u) =>
        `${u.name || ""} ${u.phone || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
  }, [users, currentUser, search]);

  const callUser = (user) => {
    localStorage.setItem("targetSocketId", user.socketId);
    localStorage.removeItem("createOffer");

    socket.emit("call-user", {
      to: user.socketId,
      from: socket.id,
      callerName: currentUser?.name || "User",
    });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="app-shell">
      <div className="page-card glass">
        <div className="topbar">
          <div className="brand">
            <div className="brand-logo">VC</div>
            <div className="brand-text">
              <h1>Video Call Hub</h1>
              <p>Fast, live, private calling room</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div className="pill">
              <span className="pill-dot" />
              {users.length} online
            </div>

            <button className="action-btn secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="content-grid">
          <aside className="sidebar">
            <div className="stat-grid">
              <div className="stat-card">
                <div className="label">You logged in as</div>
                <div className="value">{currentUser?.name || "User"}</div>
              </div>

              <div className="stat-card">
                <div className="label">Available users</div>
                <div className="value">{filteredUsers.length}</div>
              </div>
            </div>

            <div className="search-box">
              <span>🔎</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user or phone"
              />
            </div>

            <div className="section-title">
              <h2>Live presence</h2>
              <span>real-time</span>
            </div>

            <div className="empty-state">
              Tap a user on the right to start a call.
            </div>
          </aside>

          <main className="main-area">
            <div className="section-title">
              <h2>Online Users</h2>
              <span>Click to call instantly</span>
            </div>

            <div className="user-list">
              {filteredUsers.length === 0 ? (
                <div className="empty-state">No users found.</div>
              ) : (
                filteredUsers.map((user) => (
                  <div className="user-card" key={user.socketId}>
                    <div className="user-info">
                      <p className="user-name">{user.name}</p>
                      <div className="user-meta">{user.phone}</div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <span className="online-badge">
                        <span className="online-dot" />
                        Online
                      </span>

                      <button className="action-btn" onClick={() => callUser(user)}>
                        Call
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

