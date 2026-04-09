// src/pages/login/LoginPage.jsx
import React from "react";

const LoginPage = ({ handleLogin, email, setEmail, password, setPassword, loginType, setShowRegister }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleLogin(); // Passed down from AppRouter
    }}
  >
    {/* Email Input */}
    <div className="mb-3">
      <label htmlFor="email" className="form-label small fw-semibold text-muted mb-1">
        CU Mail
      </label>
      <input
        type="email"
        id="email"
        className="form-control rounded-pill px-3 py-2"
        placeholder="Enter your Cu Outlook ID "
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>

    {/* Password Input */}
    <div className="mb-4">
      <label htmlFor="password" className="form-label small fw-semibold text-muted mb-1">
        Password
      </label>
      <input
        type="password"
        id="password"
        className="form-control rounded-pill px-3 py-2"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>

    {/* Login Button */}
    <button
      type="submit"
      className="btn w-100 rounded-pill py-2 shadow-sm fw-bold"
      style={{
        backgroundColor: loginType === "admin" ? "#18bc9c" : "#007bff",
        borderColor: loginType === "admin" ? "#18bc9c" : "#007bff",
        color: "white",
      }}
    >
      {loginType === "admin" ? "ADMIN LOGIN" : "SECURE LOGIN"}
    </button>

    {/* Register Link for Users */}
    {loginType === "user" && (
      <div className="text-center mt-4">
        <small className="text-muted">
          Don’t have an account?{" "}
          <button
            type="button"
            className="btn btn-link p-0 fw-semibold text-decoration-none"
            onClick={() => setShowRegister(true)}
            style={{ color: "#007bff" }}
          >
            Register here
          </button>
        </small>
      </div>
    )}
  </form>
);

export default LoginPage;
