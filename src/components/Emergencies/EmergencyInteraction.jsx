import React, { useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaClock,
} from "react-icons/fa";
import {
  StreamVideo,
  StreamCall,
  StreamVideoClient,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useAuth } from "../../context/authContext";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  CallControls,
  StreamTheme,
  SpeakerLayout,
  SpeakingWhileMutedNotification,
  ToggleAudioPublishingButton,
  RecordCallButton,
  CancelCallButton,
} from "@stream-io/video-react-sdk";
import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";
import { useSocket } from "../../context/socketContext";
import { axiosInstance } from "../../configs/axios.instance";

function CustomCallControls() {
  return (
    <div className="str-video__call-controls">
      <SpeakingWhileMutedNotification>
        <ToggleAudioPublishingButton />
      </SpeakingWhileMutedNotification>
      <RecordCallButton />
      <CancelCallButton />
    </div>
  );
}

function EmergencyInteraction({ activeEmergency, onBack }) {
  const [client, setClient] = useState(null);
  const { user: authUser, streamToken } = useAuth();
  const [userCall, setUserCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [currentTab, setCurrentTab] = useState("Location");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [locationInfo, setLocationInfo] = useState({
    address: activeEmergency?.location?.address || "",
    city: activeEmergency?.location?.city || "",
    country: activeEmergency?.location?.country || "",
    floor: "",
    nearbyBuildings: "",
  });
  const [informationInfo, setInformationInfo] = useState({
    description: "",
    severity: "",
  });
  const [medicalHistory, setMedicalHistory] = useState({
    allergies: "",
    weight: "",
    height: "",
    emergencyContacts: [],
  });

  const callInitialized = useRef(false); // Ref to track initialization

  useEffect(() => {
    if (callInitialized.current) return; // Prevent re-initialization

    const clientInstance = StreamVideoClient.getOrCreateInstance({
      apiKey: "3pkfpxv4cver",
      user: {
        id: authUser.id.toString(),
      },
      token: streamToken,
    });

    const initCall = async () => {
      try {
        const call = clientInstance.call("default", activeEmergency.roomId);
        await call.join();
        await call.camera.disable();
        callInitialized.current = true;
        setClient(clientInstance);
        setUserCall(call);
      } catch (error) {
        console.error("Error joining call:", error);
        setTimeout(() => {
          callInitialized.current = false; // Reset the ref to allow retry
          initCall();
        }, 1000);
      }
    };

    initCall();

    return () => {
      // Cleanup if necessary
      if (userCall) {
        userCall.leave();
      }
      callInitialized.current = false;
    };
  }, [streamToken, authUser, activeEmergency.roomId]); // Removed userCall

  useEffect(() => {
    //Fill user data by fetching user information by ID
    const fetchUserData = async () => {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_BASE_URL}/volunteer/user/${
          activeEmergency.userId
        }`
      );
      setMedicalHistory({
        ...medicalHistory,
        allergies: res.data.allergies,
        weight: res.data.weight,
        height: res.data.height,
        //Emergency Contacts is a JSON array of objects with name and phone number
        emergencyContacts: res.data.emergencyContacts.map((contact) => ({
          name: contact.name,
          phone: contact.phone,
        })),
      });
      console.log(res.data);
    };

    const getLocationInfo = async () => {
      //Get location information from the longitute and latitute
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
          activeEmergency.location.latitude
        },${activeEmergency.location.longitude}&key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }`
      );
      const data = await res.json();
      setLocationInfo({
        address: data.results[0].formatted_address,
        city: data.results[0].address_components[2].long_name,
        country: data.results[0].address_components[3].long_name,
      });
    };
    fetchUserData();
    getLocationInfo();
  }, [activeEmergency]);

  const socket = useSocket();

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get(
          `${import.meta.env.VITE_BASE_URL}/branches/branches`
        );
        setBranches(res.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!client || !userCall) return;
    const initChat = async () => {
      try {
        const chatClient = StreamChat.getInstance("3pkfpxv4cver");
        setChatClient(chatClient);
        await chatClient.connectUser(
          {
            id: authUser.id.toString(),
          },
          streamToken
        );
        const channel = chatClient.channel("messaging", activeEmergency.roomId);
        setChannel(channel);
        await channel.create();
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };
    initChat();
  }, [client, authUser, streamToken, activeEmergency.roomId]);

  const handleDispatch = () => {
    if (!selectedBranch) return;
    const dispatchData = {
      branch: selectedBranch,
      emergencyId: activeEmergency.id,
      locationInfo,
      informationInfo,
      medicalHistory,
    };
    const emergencyData = {
      ...activeEmergency,
      status: "dispatched",
    };
    socket.emit("dispatchAmbulance", dispatchData);
    // socket.emit("updateEmergency", emergencyData);
    //End call
    userCall.leave();
    callInitialized.current = false;
    //Navigate back to emergencies
    onBack();
  };

  const renderTabContent = () => {
    if (currentTab === "Location") {
      return (
        <div>
          <h3 className="text-lg font-bold mb-2">Location</h3>
          <div className="mb-2">
            <label className="block font-semibold">Address</label>
            <input
              type="text"
              className="w-full border p-2"
              value={locationInfo.address}
              onChange={(e) =>
                setLocationInfo({ ...locationInfo, address: e.target.value })
              }
              readOnly
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">City</label>
            <input
              type="text"
              className="w-full border p-2"
              value={locationInfo.city}
              onChange={(e) =>
                setLocationInfo({ ...locationInfo, city: e.target.value })
              }
              readOnly
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Country</label>
            <input
              type="text"
              className="w-full border p-2"
              value={locationInfo.country}
              onChange={(e) =>
                setLocationInfo({ ...locationInfo, country: e.target.value })
              }
              readOnly
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Floor</label>
            <input
              type="text"
              className="w-full border p-2"
              value={locationInfo.floor}
              onChange={(e) =>
                setLocationInfo({ ...locationInfo, floor: e.target.value })
              }
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Nearby Buildings</label>
            <input
              type="text"
              className="w-full border p-2"
              value={locationInfo.nearbyBuildings}
              onChange={(e) =>
                setLocationInfo({
                  ...locationInfo,
                  nearbyBuildings: e.target.value,
                })
              }
            />
          </div>
        </div>
      );
    } else if (currentTab === "Information") {
      return (
        <div>
          <h3 className="text-lg font-bold mb-2">Information</h3>
          <div className="mb-2">
            <label className="block font-semibold">
              Description of Emergency
            </label>
            <textarea
              className="w-full border p-2"
              value={informationInfo.description}
              onChange={(e) =>
                setInformationInfo({
                  ...informationInfo,
                  description: e.target.value,
                })
              }
            ></textarea>
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Severity</label>
            <select
              className="w-full border p-2"
              value={informationInfo.severity}
              onChange={(e) =>
                setInformationInfo({
                  ...informationInfo,
                  severity: e.target.value,
                })
              }
            >
              <option value="">Select severity</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      );
    } else if (currentTab === "Medical History") {
      return (
        <div>
          <h3 className="text-lg font-bold mb-2">Medical History</h3>
          <div className="mb-2">
            <label className="block font-semibold">Allergies</label>
            <input
              type="text"
              className="w-full border p-2"
              value={medicalHistory.allergies}
              onChange={(e) =>
                setMedicalHistory({
                  ...medicalHistory,
                  allergies: e.target.value,
                })
              }
              readOnly
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Weight</label>
            <input
              type="text"
              className="w-full border p-2"
              value={medicalHistory.weight}
              onChange={(e) =>
                setMedicalHistory({ ...medicalHistory, weight: e.target.value })
              }
              readOnly
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Height</label>
            <input
              type="text"
              className="w-full border p-2"
              value={medicalHistory.height}
              onChange={(e) =>
                setMedicalHistory({ ...medicalHistory, height: e.target.value })
              }
              readOnly
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Emergency Contacts</label>
            {medicalHistory.emergencyContacts.map((contact) => (
              <div
                key={contact.name}
                className="flex items-center mb-2 border p-2"
              >
                <p className="mr-2">{contact.name}</p>
                <p className="mr-2">{contact.phone}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  useEffect(() => {
    const initializeMap = () => {
      if (window.google && mapRef.current && !googleMapRef.current) {
        const userLatLng = {
          lat: parseFloat(activeEmergency.location.latitude),
          lng: parseFloat(activeEmergency.location.longitude),
        };
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: userLatLng,
          zoom: 12,
        });

        new window.google.maps.Marker({
          position: userLatLng,
          map: googleMapRef.current,
          title: "User Location",
        });

        addMarkers();
      }
    };

    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (googleMapRef.current) {
        googleMapRef.current = null;
      }
    };
  }, [activeEmergency]);

  const addMarkers = () => {
    if (!googleMapRef.current) return;

    googleMapRef.current.markers?.forEach((marker) => marker.setMap(null));
    googleMapRef.current.markers = [];

    branches.forEach((branch) => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: parseFloat(branch.latitude),
          lng: parseFloat(branch.longitude),
        },
        map: googleMapRef.current,
        title: branch.name,
      });

      marker.addListener("click", () => {
        setSelectedBranch(branch);
      });

      googleMapRef.current.markers.push(marker);
    });
  };

  useEffect(() => {
    addMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches]);

  // For simplicity, let's assume branches with branch_number < 50 = less than 10 mins, else more.
  const lessThan10 = branches.filter((b) => b.branch_number < 50);
  const moreThan10 = branches.filter((b) => b.branch_number >= 50);

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

        {/* Video Call */}
        <div className="h-[390px]">
          {client && userCall && (
            <StreamVideo client={client}>
              <StreamTheme>
                <StreamCall call={userCall}>
                  <SpeakerLayout excludeLocalParticipant={true} />
                  <CustomCallControls />
                </StreamCall>
              </StreamTheme>
            </StreamVideo>
          )}
        </div>

        {/* Chat Section */}
        <div className="w-full h-[400px] flex flex-col">
          {chatClient && channel && (
            <Chat client={chatClient}>
              <Channel channel={channel}>
                <Window>
                  <MessageList />
                  <div
                    className="sticky bottom-0 bg-white"
                    style={{
                      boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.1)",
                      zIndex: 10,
                      padding: "10px",
                    }}
                  >
                    <MessageInput />
                  </div>
                </Window>
              </Channel>
            </Chat>
          )}
        </div>
      </div>

      {/* Report Area */}
      <div className="w-[500px] border-r p-4 overflow-auto">
        <div className="mb-4">
          <p className="font-bold">Time of occurrence:</p>
          <p>{new Date(activeEmergency.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex justify-between mb-4">
          {["Location", "Information", "Medical History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-4 py-2 ${
                currentTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"
              } rounded`}
            >
              {tab}
            </button>
          ))}
        </div>
        {renderTabContent()}
      </div>

      {/* Map Area */}
      <div className="w-[500px] p-4 flex flex-col">
        <div className="h-[500px] bg-gray-200 mb-4" ref={mapRef}></div>
        <p className="font-bold mb-2">Select a rescue team</p>
        <div className="mb-4">
          <p className="flex items-center text-green-500 font-bold">
            <FaClock className="mr-2" /> On site in less than 10 minutes
          </p>
          <ul className="mb-2">
            {lessThan10.map((branch) => (
              <li
                key={branch.branch_id}
                className={`cursor-pointer p-2 border-b ${
                  selectedBranch &&
                  selectedBranch.branch_id === branch.branch_id
                    ? "bg-green-100"
                    : ""
                }`}
                onClick={() => setSelectedBranch(branch)}
              >
                {branch.name} (Branch #{branch.branch_number})
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4">
          <p className="flex items-center text-red-500 font-bold">
            <FaClock className="mr-2" /> On site in more than 10 minutes
          </p>
          <ul className="mb-2">
            {moreThan10.map((branch) => (
              <li
                key={branch.branch_id}
                className={`cursor-pointer p-2 border-b ${
                  selectedBranch &&
                  selectedBranch.branch_id === branch.branch_id
                    ? "bg-red-100"
                    : ""
                }`}
                onClick={() => setSelectedBranch(branch)}
              >
                {branch.name} (Branch #{branch.branch_number})
              </li>
            ))}
          </ul>
        </div>
        <button
          className="w-full bg-red-500 text-white py-2 rounded"
          onClick={handleDispatch}
        >
          Send report and dispatch a team
        </button>
      </div>
    </div>
  );
}

export default EmergencyInteraction;
