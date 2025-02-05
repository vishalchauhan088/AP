function Navbar({
  activeForm,
  handleFormSwitch,
  token,
  username,
  handleLogout,
}) {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center w-full">
      <h1 className="text-xl font-bold">Chat</h1>
      <div>
        {token ? (
          <>
            <span className="mr-4">{username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleFormSwitch("login")}
              className={`mr-4 ${activeForm === "login" ? "font-bold" : ""}`}
            >
              Login
            </button>
            <button
              onClick={() => handleFormSwitch("signup")}
              className={`${activeForm === "signup" ? "font-bold" : ""}`}
            >
              Signup
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
