"use client";

import { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";

export default function Chat() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [messages, setMessages] = useState<{ user: string; message: string }[]>(
    []
  );
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const connect = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5148/chatHub")
      .withAutomaticReconnect()
      .build();

    connect
      .start()
      .then(() => console.log("Connected to SignalR Hub"))
      .catch((err) => console.error("Error connecting to SignalR Hub:", err));

    connect.on("ReceiveMessage", (user, message) => {
      setMessages((prevMessages) => [...prevMessages, { user, message }]);
    });

    setConnection(connect);

    return () => {
      connect.stop();
    };
  }, []);

  const sendMessage = async () => {
    if (connection) {
      try {
        await connection.invoke("SendMessage", user, message);
        setMessage("");
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  return (
    <div className="p-8">
      <h1>Chat Application</h1>
      <div>
        <input
          className="text-black"
          type="text"
          placeholder="Your name"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <br />
        <input
          className="text-black"
          type="text"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.user}:</strong> {msg.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
