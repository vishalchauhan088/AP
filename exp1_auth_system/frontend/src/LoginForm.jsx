import React, { useState } from "react";

function LoginForm({ setToken, setUserId, handleFormSwitch }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch(`/api/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    const data = await response.json();

    if (data.status === "success") {
      setToken(data.token);
      setUserId(data.data.user._id);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.data.user._id);
      handleFormSwitch("chat");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username or Email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Login
        </button>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => handleFormSwitch("signup")}
            className="text-blue-500"
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
