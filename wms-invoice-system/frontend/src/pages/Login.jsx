import { useState } from "react";
import axios from "axios";
import { API } from "../config/api";

function Login({ onLogin }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {

    if (loading) return;

    if (!username.trim()) {
      alert("Please enter Username");
      return;
    }

    if (!password.trim()) {
      alert("Please enter Password");
      return;
    }

    try {

      setLoading(true);

      console.log("Login Request...");

      const { data } = await axios.post(`${API}/auth/login`, {
        username,
        password
      });

      console.log("Response :", data);

      if (!data.success) {
        alert(data.message || "Login Failed");
        return;
      }

      localStorage.setItem(
        "token",
        data.token || ""
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user || {})
      );

      console.log("Login Success");

      if (onLogin) {
        onLogin(data.user);
      }

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        err.message ||
        "Cannot connect to server"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="login-page">

      <div className="login-box">

        <h2>Invoice System</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              login();
            }
          }}
        />

        <button
          type="button"
          onClick={login}
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>

      </div>

    </div>

  );

}

export default Login;