import React, { useState } from "react";
import { useAxios } from "../hooks/useAxios";

function SignUp() {
  const axios = useAxios();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "volunteer",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/signup", formData);
      console.log("User signed up:", response.data);
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="fullName" placeholder="Full Name" onChange={handleChange} />
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
      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default SignUp;
