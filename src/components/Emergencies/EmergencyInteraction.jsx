import React, { useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaClock,
} from "react-icons/fa";
import { useSocket } from "../../context/socketContext";
import Peer from "peerjs";

function EmergencyInteraction({ activeEmergency, onBack }) {
  const socket = useSocket();
  const [peerId, setPeerId] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState(null);
  const remoteVideoRef = useRef(null);
  useEffect(() => {
    if (!socket) return;

    const peer = new Peer();
    peer.on("open", (id) => {
      setPeerId(id);
      socket.emit("registerResponderPeer", {
        peerId: id,
        emergencyId: activeEmergency.id,
      });
    });

    peer.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
          });
        })
        .catch((err) => console.error("Failed to get local stream", err));
    });

    socket.on("peerId", ({ peerId }) => {
      setRemotePeerId(peerId);
    });

    if (remotePeerId) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          const call = peer.call(remotePeerId, stream);
          call.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
          });
        })
        .catch((err) => console.error("Failed to get local stream", err));
    }

    return () => {
      peer.destroy();
    };
  }, [socket, activeEmergency]);

  return (
    <div className="flex h-[100vh] overflow-hidden">
      {/* Accident Area */}
      <div className="w-[600px] border-r p-4">
        <button
          className="flex items-center mb-4 text-blue-500"
          onClick={onBack}
        >
          <FaArrowLeft className="mr-2" /> Back to emergencies
        </button>
        <h2 className="text-xl font-bold mb-4">
          Accident #{activeEmergency.id}
        </h2>
        <div className="flex items-center mb-4">
          <img
            src={activeEmergency.callerImage || ""}
            alt="Caller"
            className="w-16 h-16 rounded-full mr-4"
          />
          <div>
            <p className="font-bold">{activeEmergency.userId}</p>
            <div className="flex items-center">
              <span className="mr-2">00:31</span>
              <FaMicrophoneSlash className="text-gray-500 mr-2" />
              <FaPhoneSlash className="text-red-500" />
            </div>
          </div>
        </div>
        <p className="text-gray-500">
          Camera or chat have not been initiated yet.
        </p>
      </div>

      {/* Report Area */}
      <div className="w-[500px] border-r p-4">
        <div className="mb-4">
          <p className="font-bold">Time of occurrence:</p>
          <p>{new Date(activeEmergency.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex justify-between mb-4">
          {["Location", "Information", "Medical History"].map((tab) => (
            <button key={tab} className="px-4 py-2 bg-gray-200 rounded">
              {tab}
            </button>
          ))}
        </div>
        {/* Form components for each tab would go here */}
      </div>

      {/* Map Area */}
      <div className="w-[500px] p-4">
        <div className="h-[500px] bg-gray-200 mb-4">
          {/* Google Maps component would go here */}
        </div>
        <p className="font-bold mb-2">Select a rescue team</p>
        <div className="mb-4">
          <p className="flex items-center text-green-500">
            <FaClock className="mr-2" /> On site in less than 10 minutes
          </p>
          {/* Cards for teams arriving in less than 10 minutes */}
        </div>
        <div className="mb-4">
          <p className="flex items-center text-red-500">
            <FaClock className="mr-2" /> On site in more than 10 minutes
          </p>
          {/* Cards for teams arriving in more than 10 minutes */}
        </div>
        <button className="w-full bg-red-500 text-white py-2 rounded">
          Send report and dispatch a team
        </button>
      </div>
    </div>
  );
}

export default EmergencyInteraction;
