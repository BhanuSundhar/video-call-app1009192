

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";

function Dashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );
  console.log("CURRENT USER:", currentUser );

  useEffect(() => {
    socket.emit("join-user", currentUser);

    console.log("Current Socket ID:", socket.id);

    socket.on("disconnect", () => {
      console.log("Socket Disconnected");
    });

    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id);
      socket.emit("join-user", currentUser);
    });

    socket.on("users-list", (onlineUsers) => {
      setUsers(onlineUsers);
    });

    socket.on("call-accepted", () => {
      console.log("CALL ACCEPTED");
      localStorage.setItem(
        "createOffer",
        "true"
      );
      navigate("/call");
    });

    socket.on("call-rejected", () => {
      alert("Call Rejected");
    });

    socket.on("incoming-call", (data) => {
      const accept = window.confirm(
        `${data.callerName} is calling.\n\nAccept Call?`
      );

      if (accept) {
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
    });

    return () => {
      socket.off("users-list");
      socket.off("incoming-call");
    };
  }, []);

  const callUser = (user) => {
    console.log( "CALLING SOCKET:", user.socketId );
    localStorage.setItem( "targetSocketId", user.socketId );

    socket.emit("call-user", {
      to: user.socketId,
      from: socket.id,
      callerName: currentUser.name,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      <h2>
        Welcome {currentUser?.name}
      </h2>

      <hr />

      <h2>Online Users</h2>

      {users
        .filter(
          (user) =>
            user.phone !== currentUser.phone
        )
        .map((user) => (
          <div
            key={user.socketId}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <b>{user.name}</b>

            <br />

            🟢 Online

            <br />
            <br />

            <button
              onClick={() =>
                callUser(user)
              }
            >
              Call
            </button>
          </div>
        ))}
    </div>
  );
}

export default Dashboard;

