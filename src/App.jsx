import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import { useAuth } from "./context/authContext";
import Emergencies from "./components/Emergencies/Emergencies";
import Analytics from "./components/Analytics/Analytics";
import Users from "./components/Users/Users";
import Settings from "./components/Settings/Settings";
import Layout from "./components/Layout/Layout";

function App() {
  const { token } = useAuth();
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="emergencies" element={<Emergencies />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
