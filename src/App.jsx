import React, { useState, useEffect } from "react";
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
import Emergencies from "./pages/Emergencies";
import Analytics from "./components/Analytics/Analytics";
import Users from "./components/Users/Users";
import Settings from "./components/Settings/Settings";
import Layout from "./components/Layout/Layout";
import OpenLocation from "./components/OpenLocation/OpenLocation";
import Application from "./components/Application/Application";
import Donations from "./components/Donations/Donations";
import BloodRequestForm from "./components/Request/BloodRequestForm";
import LandingPage from "./components/LandingPage/LandingPage";
import Content from "./components/Content/Content";
import {
  EmergencyNotificationProvider,
  useEmergencyNotification,
} from "./context/emergencyNotificationContext";
import { Snackbar, Alert } from "@mui/material";

function App() {
  const { token } = useAuth();
  const { notifications } = useEmergencyNotification();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (notifications.length > 0) {
      setOpen(true);
    }
  }, [notifications]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/emergencies" /> : <LandingPage />}
        />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/emergencies" /> : <Login />}
        />
        <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route path="emergencies" element={<Emergencies />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
          <Route path="branches" element={<OpenLocation />} />
          <Route path="applications" element={<Application />} />
          <Route path="donations" element={<Donations />} />
          <Route path="blood-requests" element={<BloodRequestForm />} />
          <Route path="content" element={<Content />} />
        </Route>
      </Routes>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          sx={{ width: "100%", backgroundColor: "#FF6C6C", color: "#fff" }}
        >
          New emergency received!
        </Alert>
      </Snackbar>
    </Router>
  );
}

export default App;
