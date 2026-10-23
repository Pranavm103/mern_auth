
import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/auth";

export default function App() {
  const [mode, setMode] = useState("login");
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || ""
  );
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  }

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadUser() {
      try {
        const data = await request("/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) {
          localStorage.removeItem("token");
          setToken("");
          setUser(null);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/login" : "/register";

      const payload =
        mode === "login"
          ? {
              email: form.email,
              password: form.password
            }
          : form;

      const data = await request(endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      localStorage.setItem("token", data.token);
      setUser(data.user);
      setToken(data.token);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setMode("login");
    setError("");
  }

  if (token && !user) {
    return (
      <main className="page">
        <section className="card">
          <p>Checking your session...</p>
        </section>
      </main>
    );
  }

  if (user) {
    return (
      <main className="page">
        <section className="card dashboard">
          <div className="brand">SecureAuth</div>
          <div className="avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <h1>Welcome, {user.name}!</h1>
          <p className="subtitle">
            You are successfully authenticated.
          </p>

          <div className="user-info">
            <p><strong>Name</strong><span>{user.name}</span></p>
            <p><strong>Email</strong><span>{user.email}</span></p>
            <p><strong>Role</strong><span>{user.role}</span></p>
          </div>

          <button className="primary" onClick={logout}>
            Log out
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <div className="brand">SecureAuth</div>

        <h1>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>

        <p className="subtitle">
          {mode === "login"
            ? "Sign in to continue to your dashboard."
            : "Register to get started."}
        </p>

        <div className="tabs">
          <button
            className={mode === "login" ? "tab active" : "tab"}
            onClick={() => {
              setMode("login");
              setError("");
            }}
            type="button"
          >
            Login
          </button>

          <button
            className={mode === "register" ? "tab active" : "tab"}
            onClick={() => {
              setMode("register");
              setError("");
            }}
            type="button"
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                minLength={2}
                maxLength={60}
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              minLength={8}
              maxLength={72}
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="primary" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <p className="switch">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Register" : "Login"}
          </button>
        </p>
      </section>
    </main>
  );
}
