import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/authContext";
import { SocketProvider } from "./context/socketContext";
import { EmergencyNotificationProvider } from "./context/emergencyNotificationContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <EmergencyNotificationProvider>
          <App />
        </EmergencyNotificationProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>
);
