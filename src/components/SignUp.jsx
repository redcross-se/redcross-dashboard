import React, { useState } from "react";
import { axiosInstance } from "../configs/axios.instance";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
function SignUp() {
  const { setStreamToken } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    registrationKey: "",
    password: "",
    role: "volunteer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/auth/signup", formData);
      console.log("User signed up:", response.data);
      setStreamToken(response.data.streamToken);
    } catch (error) {
      setError(error.response.data?.error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Create Your Account</h2>
        <p>Join us as a volunteer</p>
        {error && <p className="error">{error}</p>}
        <input
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
        />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input
          name="phoneNumber"
          placeholder="Phone Number"
          onChange={handleChange}
        />
        <input
          name="registrationKey"
          placeholder="Registration Key"
          onChange={handleChange}
        />
        <div className="password-container">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeSlash /> : <Eye />}
          </span>
        </div>
        <button type="submit" className="login-form button">
          Sign Up
        </button>
        <p className="text-center mt-4">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
