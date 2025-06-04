import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import "../css/Auth.css";
import { loginSchema } from "../validation/authSchema"; // <-- Import Zod schema

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Zod validation
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      setLoading(false);
      setMessage(result.error.errors[0].message);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5050/api/auth/login", {
        username: formData.username,
        password: formData.password,
      });

      const token = response.data;
      localStorage.setItem("jwtToken", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const roles = payload.roles;

      if (roles.includes("ADMIN") || roles.includes("USER")) {
        setTimeout(() => {
          setLoading(false);
          navigate("/dashboard");
        }, 2000);
      } else {
        setLoading(false);
        setMessage("Invalid user role.");
      }
    } catch (error) {
      setTimeout(() => {
        setLoading(false);
        setMessage("Login failed! Please check your credentials.");
      }, 2000);
    }
  };

  const fields = [
    { type: "text", name: "username", placeholder: "Username", required: true },
    { type: "password", name: "password", placeholder: "Password", required: true },
  ];

  return (
    <div>
      <AuthForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        fields={fields}
        buttonText="Login"
        loading={loading}
        message={message}
      />
      <div className="auth-links">
        <Link to="/forgot-password">Forgot Password?</Link>
        <Link to="/register">Don't have an account? Register</Link>
        {/* <Link to="/reset-password">reset</Link> */}

      </div>
    </div>
  );
}

export default Login;