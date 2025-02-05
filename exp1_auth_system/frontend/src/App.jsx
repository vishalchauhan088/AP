import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import Navbar from "./Navbar";
import "./App.css"; // Optional, for custom styles

function App() {
  const [activeForm, setActiveForm] = useState("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chatId, setChatId] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState(""); // Added state for username
  const [receiverId, setReceiverId] = useState("");
  const [token, setToken] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUserId = localStorage.getItem("userId");
    const savedUsername = localStorage.getItem("username"); // Get username from localStorage
    if (savedToken && savedUserId) {
      setToken(savedToken);
      setUserId(savedUserId);
      setUsername(savedUsername); // Set username
      setActiveForm("chat");
      // Establish socket connection after login/signup
      const newSocket = io("http://127.0.0.1:8000", {
        query: { token: savedToken },
        transports: ["websocket", "polling"],
      });
      setSocket(newSocket);
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (message) => {
        console.log(message);
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off("receiveMessage");
      };
    }
  }, [socket]);

  const handleFormSwitch = (form) => {
    setActiveForm(form);
  };

  const handleSearch = async () => {
    const response = await fetch(`/api/user/?username=${searchQuery}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    setSearchResults(result.data.users);
  };

  const handleSelectUser = async (id) => {
    const response = await fetch(`/api/chat/?receiverId=${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    setChatId(result.data._id);
    setReceiverId(id);

    // Join chat room
    if (socket) {
      socket.emit("joinChat", result.data._id);
    }
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (socket) {
      socket.emit("sendMessage", {
        chatId,
        senderId: userId,
        receiverId,
        content: messageContent,
      });
      setMessageContent("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username"); // Remove username from localStorage
    setToken("");
    setUserId("");
    setUsername("");
    setActiveForm("login");
    if (socket) {
      socket.disconnect();
    }
  };

  return (
    <>
      <Navbar
        activeForm={activeForm}
        handleFormSwitch={handleFormSwitch}
        token={token}
        username={username} // Pass username to Navbar
        handleLogout={handleLogout}
      />
      <div className="flex flex-col items-center p-6">
        {(activeForm === "login" || activeForm === "signup") && (
          <div className="flex space-x-6">
            {activeForm === "signup" && (
              <SignupForm
                setToken={setToken}
                setUserId={setUserId}
                setUsername={setUsername} // Add setUsername
                handleFormSwitch={handleFormSwitch}
              />
            )}

            {activeForm === "login" && (
              <LoginForm
                setToken={setToken}
                setUserId={setUserId}
                setUsername={setUsername} // Add setUsername
                handleFormSwitch={handleFormSwitch}
              />
            )}
          </div>
        )}

        {activeForm === "chat" && (
          <div className="w-full max-w-md mt-6">
            <h1 className="text-2xl font-bold mb-4">Search for Users</h1>
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <button
              onClick={handleSearch}
              className="p-2 bg-blue-500 text-white rounded"
            >
              Search
            </button>
            <ul className="mt-4 space-y-2">
              {searchResults.map((user) => (
                <li
                  key={user._id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <span>{user.username}</span>
                  <button
                    onClick={() => handleSelectUser(user._id)}
                    className="p-1 bg-green-500 text-white rounded"
                  >
                    Chat
                  </button>
                </li>
              ))}
            </ul>

            {chatId && (
              <>
                <h1 className="text-2xl font-bold mt-6 mb-4">Chat</h1>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Chat ID"
                    value={chatId}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Message"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full p-2 bg-blue-500 text-white rounded"
                  >
                    Send Message
                  </button>
                </form>

                <div id="messages" className="mt-4 border-t pt-4 space-y-2">
                  {messages.map((msg, index) => (
                    <p key={index}>
                      {msg.senderId}: {msg.content}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;
