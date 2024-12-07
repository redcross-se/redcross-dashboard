import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/socketContext";
import { FaCircle, FaArrowRight } from "react-icons/fa";
import { getUserById } from "../../services/userService";
import { getMe } from "../../services/userService";
import { useEmergencyNotification } from "../../context/emergencyNotificationContext";

function EmergenciesDisplay({ setActiveEmergency }) {
  const socket = useSocket();
  const [emergencies, setEmergencies] = useState([]);
  const [filter, setFilter] = useState("all");
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [callerName, setCallerName] = useState("");
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [user, setUser] = useState(null);
  const { setEmergencyCount } = useEmergencyNotification();

  useEffect(() => {
    setEmergencyCount(null);
  }, []);

  useEffect(() => {
    getMe().then((data) => setUser(data));
    setFilteredEmergencies(
      emergencies.filter((emergency) => {
        if (filter === "all") {
          return true;
        }
        return emergency.status === filter;
      })
    );
  }, [filter, emergencies]);

  useEffect(() => {
    console.log(socket);
    if (!socket) return;
    socket.emit("getAllEmergencies");
    const handleAllEmergencies = (allEmergencies) => {
      setEmergencies(allEmergencies);
      setFilteredEmergencies(allEmergencies);
      addMarkers();
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
      console.log("updatedEmergency", updatedEmergency);
      console.log("selectedEmergency", selectedEmergency);
      if (selectedEmergency && selectedEmergency.id === updatedEmergency.id) {
        console.log("selectedEmergency", selectedEmergency);
        setSelectedEmergency(updatedEmergency);
      }
    };
    socket.on("allEmergencies", handleAllEmergencies);
    socket.on("newEmergency", handleNewEmergency);
    socket.on("emergencyUpdated", handleEmergencyUpdated);

    socket.on("emergencyById", handleEmergencyById);

    return () => {
      socket.off("allEmergencies", handleAllEmergencies);
      socket.off("newEmergency", handleNewEmergency);
      socket.off("emergencyUpdated", handleEmergencyUpdated);
      socket.off("emergencyById", handleEmergencyById);
    };
  }, [socket]);

  useEffect(() => {
    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && mapRef.current) {
          googleMapRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: 33.8547, lng: 35.8778 },
            zoom: 8,
          });
          addMarkers();
        } else {
          console.error("Google Maps API is not available.");
        }
      };
      document.body.appendChild(script);
    } else {
      if (window.google && !googleMapRef.current && mapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 33.8547, lng: 35.578 },
          zoom: 11,
        });
      }
      addMarkers();
    }

    return () => {
      if (googleMapRef.current) {
        googleMapRef.current = null;
      }
    };
  }, [filteredEmergencies]);

  const addMarkers = () => {
    if (!googleMapRef.current) {
      return;
    }

    // Clear existing markers
    googleMapRef.current.markers?.forEach((marker) => marker.setMap(null));
    googleMapRef.current.markers = [];

    // Add markers for filtered emergencies
    filteredEmergencies.forEach((emergency) => {
      const location =
        typeof emergency.location === "string"
          ? JSON.parse(emergency.location)
          : emergency.location;
      const marker = new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: googleMapRef.current,
        title: String(emergency.id),
      });
      googleMapRef.current.markers.push(marker);
    });
  };

  const emergencyCounts = {
    new: emergencies.filter((e) => e.status === "pending").length,
    inProgress: emergencies.filter((e) => e.status === "accepted").length,
    completed: emergencies.filter((e) => e.status === "dispatched").length,
  };

  const handleEmergencyClick = (emergencyId) => {
    socket.emit("getEmergencyById", emergencyId);
  };

  const handleEmergencyById = (emergency) => {
    setSelectedEmergency(emergency);
    if (emergency.userId) {
      getUserById(emergency.userId)
        .then((user) => setCallerName(user.fullName))
        .catch((error) => console.error("Error fetching user:", error));
    }
  };

  useEffect(() => {
    const handleEmergencyUpdated = (updatedEmergency) => {
      setEmergencies((prev) =>
        prev.map((emergency) =>
          emergency.id === updatedEmergency.id ? updatedEmergency : emergency
        )
      );
      if (selectedEmergency && selectedEmergency.id === updatedEmergency.id) {
        setSelectedEmergency(updatedEmergency);
      }
    };

    if (socket) {
      socket.on("emergencyUpdated", handleEmergencyUpdated);
    }

    return () => {
      if (socket) {
        socket.off("emergencyUpdated", handleEmergencyUpdated);
      }
    };
  }, [socket, selectedEmergency]);

  const EmergencyDialog = ({ emergency, onClose }) => {
    if (!emergency) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-gray-200 rounded-lg p-6 w-96 shadow-lg relative">
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-xl font-bold mb-4">Accident #{emergency.id}</h2>
          <div className="space-y-2">
            <p className="flex justify-between">
              <strong>Time of occurrence:</strong>
              <span>{new Date(emergency.createdAt).toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <strong>Location:</strong>
              <span>
                {typeof emergency.location === "string"
                  ? JSON.parse(emergency.location).address
                  : emergency.location.address}
              </span>
            </p>
            <p className="flex justify-between">
              <strong>Caller:</strong>
              <span>{callerName}</span>
            </p>
            <p className="flex justify-between">
              <strong>Victim:</strong>
              <span>
                {emergency.type === "User"
                  ? "User"
                  : emergency.type === "Witness"
                  ? "Witness"
                  : "Unknown"}
              </span>
            </p>
            <p className="flex justify-between">
              <strong>Case:</strong>
              <span>{emergency.additionalInfo}</span>
            </p>
          </div>
          <button
            className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            onClick={() => {
              socket.emit("acceptEmergency", {
                ...selectedEmergency,
                emergencyId: emergency.id,
                responderId: user.id,
              });
              setActiveEmergency(emergency);
            }}
          >
            Accept
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex">
      <div className="w-3/5 p-4">
        <h1 className="text-2xl font-bold mb-4">Accidents</h1>
        <div className="flex justify-between mb-4">
          {["new", "inProgress", "completed"].map((status, index) => (
            <div
              key={index}
              className="flex flex-col items-center w-1/4 bg-gray-100 rounded-md p-2 shadow-sm"
            >
              <div className="bg-gray-200 p-1 rounded-full">
                <FaCircle
                  className={`text-sm ${
                    status === "new"
                      ? "text-red-400"
                      : status === "inProgress"
                      ? "text-orange-400"
                      : "text-green-400"
                  }`}
                />
              </div>
              <span className="block capitalize text-xs font-medium mt-1">
                {status === "inProgress" ? "In progress" : status}
              </span>
              <span className="block text-lg font-bold text-gray-700">
                {emergencyCounts[status]}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mb-4 bg-gray-100 rounded p-2">
          {["all", "pending", "accepted", "dispatched"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-md mx-1 text-sm font-medium ${
                filter === status
                  ? "bg-red-500 text-white shadow"
                  : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => setFilter(status)}
            >
              {status === "all"
                ? "All"
                : status === "pending"
                ? "New"
                : status === "accepted"
                ? "In Progress"
                : status === "dispatched"
                ? "Completed"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <ul className="overflow-y-auto max-h-[650px] rounded-lg pr-2">
          {filteredEmergencies.map((emergency) => (
            <li
              key={emergency.id}
              className="border p-4 mb-2 rounded-lg flex justify-between items-center shadow hover:shadow-lg hover:cursor-pointer hover:bg-gray-50"
              onClick={() => handleEmergencyClick(emergency.id)}
            >
              <div className="flex flex-col">
                <span className="text-lg font-medium text-gray-600 ">
                  {emergency.status.charAt(0).toUpperCase() +
                    emergency.status.slice(1)}
                </span>
                <div className="flex flex-row justify-between gap-5 ">
                  <span className="text-xs text-gray-400">
                    {new Date(emergency.createdAt).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {emergency.location.address}
                  </span>
                  <span className="text-xs text-gray-400">
                    {emergency.additionalInfo}
                  </span>
                </div>
              </div>
              <FaArrowRight className="text-gray-400 ml-4" />
            </li>
          ))}
        </ul>
      </div>
      <div
        className="w-2/5"
        style={{ height: "900px", borderRadius: "10px" }}
        ref={mapRef}
      ></div>
      <EmergencyDialog
        emergency={selectedEmergency}
        onClose={() => setSelectedEmergency(null)}
      />
    </div>
  );
}

export default EmergenciesDisplay;
