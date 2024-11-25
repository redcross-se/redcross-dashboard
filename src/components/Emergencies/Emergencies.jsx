import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/socketContext";
import { FaCircle, FaArrowRight } from "react-icons/fa";

function Emergencies() {
  const socket = useSocket();
  const [emergencies, setEmergencies] = useState([]);
  const [filter, setFilter] = useState("all");
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.emit("getAllEmergencies");
    const handleAllEmergencies = (allEmergencies) => {
      console.log(allEmergencies);
      setEmergencies(allEmergencies);
    };
    const handleNewEmergency = (emergency) => {
      setEmergencies((prev) => [...prev, emergency]);
    };
    const handleEmergencyUpdated = (updatedEmergency) => {
      setEmergencies((prev) =>
        prev.map((emergency) =>
          emergency.id === updatedEmergency.id ? updatedEmergency : emergency
        )
      );
    };
    socket.on("allEmergencies", handleAllEmergencies);
    socket.on("newEmergency", handleNewEmergency);
    socket.on("emergencyUpdated", handleEmergencyUpdated);
    return () => {
      socket.off("allEmergencies", handleAllEmergencies);
      socket.off("newEmergency", handleNewEmergency);
      socket.off("emergencyUpdated", handleEmergencyUpdated);
    };
  }, [socket]);

  useEffect(() => {
    // Load the Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    }`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 33.8547, lng: 35.8778 },
        zoom: 8,
      });
      addMarkers();
    };
    document.body.appendChild(script);

    return () => {
      // Clean up the script and map
      if (googleMapRef.current) {
        googleMapRef.current = null;
      }
      document.body.removeChild(script);
    };
  }, [emergencies]);

  const addMarkers = () => {
    if (!googleMapRef.current) return;
    emergencies.forEach((emergency) => {
      const location =
        typeof emergency.location === "string"
          ? JSON.parse(emergency.location)
          : emergency.location;
      new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: googleMapRef.current,
        title: emergency.id,
      });
    });
  };

  const filteredEmergencies = emergencies.filter((emergency) => {
    if (filter === "all") return true;
    return emergency.status === filter;
  });

  const emergencyCounts = {
    new: emergencies.filter((e) => e.status === "pending").length,
    inProgress: emergencies.filter((e) => e.status === "accepted").length,
    completed: emergencies.filter((e) => e.status === "dispatched").length,
  };

  return (
    <div className="flex">
      <div className="w-3/5 p-4">
        <h1 className="text-2xl font-bold mb-4">Accidents</h1>
        <div className="flex justify-between mb-4">
          {["new", "inProgress", "completed"].map((status, index) => (
            <div key={index} className="flex items-center">
              <div className="bg-gray-200 p-2 rounded">
                <FaCircle className="text-gray-400" />
              </div>
              <div className="ml-2 text-center">
                <span className="block capitalize">{status}</span>
                <span className="block text-xl">{emergencyCounts[status]}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mb-4 bg-gray-100 rounded p-2">
          {["all", "pending", "accepted", "dispatched"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded ${
                filter === status ? "bg-red-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setFilter(status)}
            >
              {status === "all"
                ? "All"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <ul>
          {filteredEmergencies.map((emergency) => (
            <li
              key={emergency.id}
              className="border p-4 mb-2 rounded-lg flex justify-between items-center"
            >
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">{emergency.status}</span>
                  <span className="font-bold">Time of occurrence</span>
                  <span className="font-bold">Location</span>
                </div>
                <div className="flex justify-between">
                  <span>{emergency.id}</span>
                  <span>{new Date(emergency.createdAt).toLocaleString()}</span>
                  <span>
                    {typeof emergency.location === "string"
                      ? JSON.parse(emergency.location).address
                      : emergency.location.address}
                  </span>
                </div>
              </div>
              <FaArrowRight className="text-gray-400" />
            </li>
          ))}
        </ul>
      </div>
      <div className="w-2/5" style={{ height: "600px" }} ref={mapRef}></div>
    </div>
  );
}

export default Emergencies;
