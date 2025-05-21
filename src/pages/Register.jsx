import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import "../css/Auth.css";
import { registerSchema } from "../validation/authSchema"; // <-- Import Zod schema

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
  });
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
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      setLoading(false);
      setMessage(result.error.errors[0].message);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5050/api/auth/register?role=${formData.role}`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setTimeout(() => {
        setLoading(false);
        setMessage(response.data);
        if (response.data === "User registered successfully!") {
          navigate("/login");
        }
      }, 2000);
    } catch (error) {
      setTimeout(() => {
        setLoading(false);
        setMessage(error.response?.data || "Registration failed!");
      }, 2000);
    }
  };

  const fields = [
    { type: "text", name: "username", placeholder: "Username", required: true },
    { type: "email", name: "email", placeholder: "Email", required: true },
    { type: "password", name: "password", placeholder: "Password", required: true },
    {
      type: "select",
      name: "role",
      options: [
        { value: "USER", label: "USER" },
        { value: "ADMIN", label: "ADMIN" },
      ],
    },
  ];

  return (
    <div>
      <AuthForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        fields={fields}
        buttonText="Register"
        loading={loading}
        message={message}
      />
      <div className="auth-links">
        <Link to="/login">Already have an account? Login</Link>
      </div>
    </div>
  );
}

export default Register;