import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./socketContext";

const EmergencyNotificationContext = createContext();

export const useEmergencyNotification = () =>
  useContext(EmergencyNotificationContext);

export const EmergencyNotificationProvider = ({ children }) => {
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewEmergency = (emergency) => {
      setEmergencyCount((prevCount) => prevCount + 1);
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        emergency,
      ]);
    };

    socket.on("newEmergency", handleNewEmergency);

    return () => {
      socket.off("newEmergency", handleNewEmergency);
    };
  }, [socket]);

  return (
    <EmergencyNotificationContext.Provider
      value={{
        emergencyCount,
        notifications,
        addEmergencyNotification: (emergency) => {
          setEmergencyCount((prevCount) => prevCount + 1);
          setNotifications((prevNotifications) => [
            ...prevNotifications,
            emergency,
          ]);
        },
        setEmergencyCount,
      }}
    >
      {children}
    </EmergencyNotificationContext.Provider>
  );
};
