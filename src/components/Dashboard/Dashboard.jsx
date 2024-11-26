import React, { useState, useEffect } from "react";
import { useSocket } from "../../context/socketContext";
import { useAxios } from "../../hooks/useAxios";
import Sidebar from "../Sidebar/Sidebar";

function Dashboard() {
  console.log("Dashboard");
  const socket = useSocket();
  const axios = useAxios();
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("newEmergency", (emergency) => {
      setEmergencies((prev) => [...prev, emergency]);
    });

    socket.on("emergencyUpdated", (updatedEmergency) => {
      setEmergencies((prev) =>
        prev.map((emergency) =>
          emergency.id === updatedEmergency.id ? updatedEmergency : emergency
        )
      );
    });

    socket.on("emergencyAccepted", (emergency) => {
      alert(`Emergency accepted: ${emergency.id}`);
    });

    socket.on("ambulanceDispatched", (dispatchInfo) => {
      alert(`Ambulance dispatched: ${dispatchInfo.id}`);
    });

    return () => {
      socket.off("newEmergency");
      socket.off("emergencyUpdated");
      socket.off("emergencyAccepted");
      socket.off("ambulanceDispatched");
    };
  }, [socket]);

  const acceptEmergency = (emergencyId) => {
    socket.emit("acceptEmergency", {
      id: emergencyId,
      roomId: `room-${emergencyId}`,
    });
  };

  const dispatchAmbulance = () => {
    if (!selectedBranch) return;
    socket.emit("dispatchAmbulance", {
      id: selectedEmergency.id,
      branchId: selectedBranch,
    });
  };

  return (
    <div className="flex bg-indigo-50">
      <div className="dashboard">
        <h1>Dashboard</h1>
        <ul>
          {emergencies.map((emergency) => (
            <li key={emergency.id}>
              {emergency.type} at {emergency.location}
              <button onClick={() => acceptEmergency(emergency.id)}>
                Accept
              </button>
            </li>
          ))}
        </ul>
        {selectedEmergency && (
          <div>
            <h2>Dispatch Ambulance</h2>
            <select onChange={(e) => setSelectedBranch(e.target.value)}>
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <button onClick={dispatchAmbulance}>Dispatch</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
