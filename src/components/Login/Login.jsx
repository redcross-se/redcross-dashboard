import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import "./Login.css";
import Logo from "../../assets/logo.svg";
import Background from "../../assets/redcross.jpg";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { axiosInstance } from "../../configs/axios.instance";
function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const { setToken, setRefreshToken, setStreamToken } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/auth/signin", formData);
      setToken(response.data.token);
      console.log(response.data.token);
      setRefreshToken(response.data.refreshToken);
      console.log(response.data.refreshToken);
      setStreamToken(response.data.streamToken);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response.data?.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={Logo} alt="Red Cross Logo" />
        <h1>Red Cross</h1>
      </div>
      <div className="login-content">
        <div className="login-image">
          <img src={Background} alt="Background" />
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Welcome to Red Cross Emergency Response</h2>
          <p>Please sign-in to your account</p>
          {error && <p className="error">{error}</p>}
          <input name="email" placeholder="Email" onChange={handleChange} />
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
          <div className="login-options">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button type="submit" onClick={handleSubmit}>
            Login
          </button>
          <p className="signup">
            Don't have an account? <Link to="/signup">Sign up instead</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
