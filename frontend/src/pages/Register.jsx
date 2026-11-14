import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "DONOR",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.detail || "Registration failed"
        );
      }

      setSuccessMessage("Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
  <div className="register-page">
    <div className="register-card">
      <h1>Join SharePlate</h1>

      <p className="register-subtitle">
        Help reduce food waste by connecting food donors
        with organizations that need it.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">I am registering as</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="DONOR">Food Donor</option>
            <option value="NGO">NGO / Organization</option>
          </select>
        </div>

        <button
          className="register-button"
          type="submit"
        >
          Create Account
        </button>
      </form>

      {errorMessage && (
        <p className="message error-message">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="message success-message">
          {successMessage}
        </p>
      )}

      <p className="login-link">
        Already have an account?{" "}
        <a href="/login">Sign in</a>
      </p>
    </div>
  </div>
);
}

export default Register;